import * as React from 'react'
import {useState} from 'react'
import {OrderStatsResponse, productsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress, Divider,
    LinearProgress, Menu, MenuItem,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Tabs,
    Typography,
    useTheme
} from "@mui/material";
import {Product, StatsOrderedProducts} from "../../api/sagra/sagraSchemas.ts";
import {PieChart, PieSeries} from '@mui/x-charts/PieChart';
import {currency} from "../../utils";
import ProductsStore, {useProducts} from "../../context/ProductsStore.tsx";
import {useQuery} from "@tanstack/react-query";
import {get, orderBy} from "lodash";
import dayjs, {Dayjs, ManipulateType} from 'dayjs'
import writeXlsxFile from "write-excel-file";
import toast from "react-hot-toast";
import {BarChart, BarLabel, SparkLineChart} from '@mui/x-charts';
import './Stats.css'
import {calculateSummary, DailyProductStatI} from "./Summary.ts";
import DepartmentStats from "./DepartmentStats.tsx";
import { KeyboardArrowDown } from "@mui/icons-material";
import 'dayjs/locale/it';
import TotalTableCompare from "./TotalTableCompare.tsx";
import StatsToolbar from "./StatsToolbar.tsx";


interface GraphStatsField {
    labels: string[],
    values: number[]
}

interface StatsFieldI {
    field: string
    value: number
    description?: string
    isAmount?: boolean
    sx?: React.CSSProperties
    graphData? : GraphStatsField
}

const cardStyle: React.CSSProperties = {
    width: "250px", height: "250px", minWidth: "250px"
};

const cardTitle: React.CSSProperties = {
    fontWeight: 500, fontSize: '0.8em'
}

const cardValue: React.CSSProperties = {
    marginTop: 2, marginLeft: 1, fontSize: '1.5em', fontWeight: 800
}

const StatsField: React.FC<StatsFieldI> = (props) => {
   const value = props.isAmount ? currency(props.value): props.value

    return (
        <Card sx={{ ...cardStyle, position: 'relative' }}>
            <CardContent>
                <Typography component="div" sx={{ ...cardTitle }}>{props.field}</Typography>
                <Typography component="div" sx={{ ...cardValue }}>{`${value}`}</Typography>
                { props.description && <Typography component="div" sx={{ mt: 1, fontSize: '0.9em', fontWeight: 300 }}>{`${props.description}`}</Typography> }
            </CardContent>
            { props.graphData &&
                <Box sx={{ height: 120, position: 'absolute', bottom: 0,  }}>
                    <BarChart
                        series={[{ data: props.graphData.values, type: 'bar',
                            valueFormatter: (v) => v && props.isAmount ? currency(v) : `${v}` }]}
                        xAxis={[{ data: props.graphData.labels, position: 'none' }]}
                        yAxis={[{position: 'none'}]}
                        slots={{ barLabel: BarLabel  }}
                    >
                    </BarChart>
                 </Box>
            }
        </Card>
    )
}

interface PiePair {
    label: string
    value: number
}

interface TabPanelI extends React.PropsWithChildren {
    value: number
    index: number
}

const TabPanel: React.FC<TabPanelI>  = (props) => {
    const {value, index} = props
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
        >
            {value === index && <Box sx={{ p: 3 }}>{props.children}</Box>}
        </div>
    );
}

interface ResponseStatsViewI {
    stats: OrderStatsResponse
}

/*
 <DayStats key={day} day={day} stats={stats[day]}/>
 */






const StatsPieChart: React.FC<{productsStats: Record<number, StatsOrderedProducts>, field: string}> = (props) => {

    const {productsStats, field} = props
    const {products} = useProducts()
    const productsK = Object.keys(productsStats)
    const data: PiePair[] = []

    for (let i = 0; i<productsK.length; i++) {
        const {productId} = productsStats[+productsK[i]]
        data.push({
            label: `${products[productId].name}`,
            value: get( productsStats[+productsK[i]], field)
        })
    }
    return (
     <PieChart
         width={500}
         height={400}
         hideLegend={false}
         sx={{fontFamily: 'Roboto'}}
         series={[{ innerRadius: 100, outerRadius: 200, data, arcLabel: 'value' } as PieSeries]}
     />
 )
}

const buildChartFromDays = (days: string[], daysInfo: DailyProductStatI[]) => {
    const xData = []
    const yData = []
    for (let i=0; i<days.length; i++) {
        xData.push(days[i])
        const idx = daysInfo.findIndex((element) => element.day === days[i])
        if (idx === -1) {
            yData.push(0)
        } else {
            yData.push(daysInfo[idx].dailyAmount)
        }

    }
    // console.log('BuildChartFromDays: ', xData, yData)

    return (
        <div style={{display: 'flex', alignItems: 'center', height: '100%'}}>
            <SparkLineChart
                data={yData}
                width={100}
                height={32}
                plotType="bar"
                showHighlight
                showTooltip
                color="hsl(210, 98%, 42%)"
                xAxis={{
                    scaleType: 'band',
                    data: xData
                }}
            />
        </div>
    )


}

const StatsBarChart: React.FC<{productsStats: Record<number, StatsOrderedProducts>, field: string}> = (props) => {

    const {productsStats, field} = props
    const {products} = useProducts()

    const values: number[] = []
    const labels: string[] = []

    Object.values(productsStats).sort((a, b) => (get(a, field) < get(b, field) ? 1 : get(a, field) < get(b, field) ? -1 : 0))
        .forEach( (s) => {
            values.push(get( productsStats[s.productId], field))
            labels.push(products[s.productId].name)
        });

    return (
        <BarChart
            width={500}
            height={31*values.length}
            layout="horizontal"
            hideLegend
            sx={{fontFamily: 'Roboto'}}

            series={[
                {
                    data: values,
                    label: 'Importo',
                },
            ]}
            yAxis={[{ data: labels ,  position: 'none'}]}
        />
    )
}

enum OrderDirection {
    asc = "asc",
    desc = "desc"
}

export function dayjsRange(start: Dayjs, end: Dayjs, unit: ManipulateType, format?: string) {
    const ff = format ?? 'YYYY-MM-DD'
    const range = [];
    let current = start;
    while (!current.isAfter(end)) {
        range.push(current.format(ff));
        current = current.add(1, unit);
    }
    return range;
}

interface ProductsTableStatsProps {
    productsInOrder: Record<number, StatsOrderedProducts>
    days: string[]
    isTotal?: boolean
}


const ProductsTableStats: React.FC<ProductsTableStatsProps> = (props) => {
    const {productsInOrder, isTotal, days} = props
    const theme = useTheme()
    enum ProductsOrderBy {
        name = "name",
        totalQuantity = "totalQuantity",
        totalAmount = "totalAmount",
    }

    const {products} = useProducts()
    const [prodOrderBy, setProdOrderBy] = useState<ProductsOrderBy>(ProductsOrderBy.totalAmount)
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.desc)

    const totalAmount = Object.values(productsInOrder).reduce((a, c) => a + c.totalAmount, 0);

    const productsIds = () => {
        const values = Object.values(productsInOrder);
        switch (prodOrderBy) {
            case ProductsOrderBy.totalQuantity:
            case ProductsOrderBy.totalAmount:
                return orderBy(values, prodOrderBy, orderDirection).map( v => v.productId);
            case ProductsOrderBy.name: {
                const valuesToOrder = values.map(p => {
                    return {
                        productId: p.productId,
                        name: products[p.productId].name,
                    }
                });

                return orderBy(valuesToOrder, prodOrderBy, orderDirection).map( v => v.productId);
            }
        }
    }

    const handleChangeOrder = (field: ProductsOrderBy) => {
        setProdOrderBy(field)
        setOrderDirection(orderDirection === OrderDirection.desc ? OrderDirection.asc : OrderDirection.desc)
    }

    return (
            <TableContainer component={Box}>
                <Table sx={{ minWidth: 650 ,backgroundColor: theme.palette.background.default }} size={'small'} aria-label="total table">
                    <TableHead>
                        <TableRow>
                            <TableCell sortDirection={orderDirection}>
                                <TableSortLabel active={prodOrderBy === ProductsOrderBy.name} direction={orderDirection}
                                                onClick={ () => handleChangeOrder(ProductsOrderBy.name) } >
                                Prodotto
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderDirection} align="center">
                                    <TableSortLabel active={prodOrderBy === ProductsOrderBy.totalQuantity} direction={orderDirection}
                                                    onClick={ () => handleChangeOrder(ProductsOrderBy.totalQuantity) } >
                                        Quantità
                                    </TableSortLabel>
                                </TableCell>
                            <TableCell sortDirection={orderDirection} align="right">
                                    <TableSortLabel active={prodOrderBy === ProductsOrderBy.totalAmount} direction={orderDirection}
                                                    onClick={ () => handleChangeOrder(ProductsOrderBy.totalAmount) } >
                                    Importo
                                    </TableSortLabel>
                            </TableCell>
                            <TableCell>Percentuale Importo</TableCell>
                            { isTotal &&
                                <TableCell>
                                    Importi Giornalieri
                                </TableCell>
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productsIds().map((productId) => (
                            <TableRow
                                key={productId}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {products[+productId].name}
                                </TableCell>
                                <TableCell align="center">{productsInOrder[+productId].totalQuantity}</TableCell>
                                <TableCell align="right">{currency(productsInOrder[+productId].totalAmount)}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <LinearProgress sx={{height: 10, borderRadius: 5, width: '140px'}} variant="determinate" value={productsInOrder[+productId].totalAmount*100/totalAmount}/>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9em' }}>{Math.round(productsInOrder[+productId].totalAmount*100/totalAmount)}%</Typography>
                                    </Box>
                                </TableCell>
                                { isTotal &&
                                    <TableCell align="center">
                                        {buildChartFromDays(days, productsInOrder[+productId].days)}</TableCell>
                                }
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
    )
}


const buildProductsData = (fullOrder: Record<number, StatsOrderedProducts>, productsTable: Record<number, Product>) => {
    const productKeys = Object.keys(fullOrder)
    const rows = productKeys.map((productId: number) => {
        return (
            [
                {
                    type: String,
                    value: productsTable[productId].name,

                },
                {
                    type: Number,
                    value: fullOrder[productId].totalQuantity
                },
                {
                    type: Number,
                    value: fullOrder[productId].totalAmount,
                    format: '#,## €'
                }
            ]
        )
    })

    return rows
}


interface TotalInfoProps {
    stats: OrderStatsResponse
    isTotal?: boolean
}

const TotalInfo: React.FC<TotalInfoProps> = (props) => {
    const {stats, isTotal} = props
    const theme = useTheme();
   // const [value, setValue] = React.useState(0)
    const {products} = useProducts()

    // const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    //     setValue(newValue);
    // };



    const summary = calculateSummary(stats)

    const dayKeys = Object.keys(stats);
    const countGraph = isTotal ? { values: dayKeys.map(day => stats[day].count), labels: dayKeys} : undefined
    const totalAmountGraph = isTotal ? { values: dayKeys.map(day => stats[day].totalAmount), labels: dayKeys} : undefined;
    const serviceGraph = isTotal ? { values: dayKeys.map(day => stats[day].totalServiceNumber), labels: dayKeys} : undefined;

    return (
        <Paper variant="outlined" sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 2,
            backgroundColor: theme.sagra.panelBackground,
            borderRadius: '10px',
        }}>
            <Box
                sx={() => (
                    {
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        width: '100%'
                    }
                )}>
                <Box>
                    <StatsField
                        field={'Numero Ordini'}
                        value={summary.count}
                        description={summary.totalTakeAwayCount ? `Di cui ${summary.totalTakeAwayCount } da asporto` : ''}
                        graphData={countGraph}
                    />
                </Box>
                <StatsField
                    field={'Totale Coperti'}
                    value={summary.totalServiceNumber}
                    graphData={serviceGraph}/>
                <StatsField
                    field={'Totale Incasso'}
                    value={summary.totalAmount}
                    description={summary.totalTakeAwayAmount ? `Di cui ${currency(summary.totalTakeAwayAmount) } da asporto` : ''}
                    graphData={ totalAmountGraph }
                    isAmount />
                <Card sx={{ ...cardStyle}} >
                    <CardContent>
                        <Typography sx={{ ...cardTitle, mb: 2}} >Statistiche Reparti</Typography>
                        <DepartmentStats summary={summary} width={170} height={170} />
                    </CardContent>
                </Card>
            </Box>
            { isTotal &&
                <Paper  sx={{
                    ml: '16px',
                    mr: '16px',
                    p: 2,
                    width: 'calc(100% - 32px)' }}>
                        <Typography sx={{ ...cardTitle, marginBottom: 2}}>Tabella comparazione statistiche per giorno</Typography>
                        <TotalTableCompare stats={stats} summary={summary} />
                </Paper>
            }
                <Paper  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: 'calc(100% - 32px)',
                    ml: '16px',
                    mr: '16px',
                    p: 2,
                }}>
                    <Typography sx={{ ...cardTitle, marginBottom: 2}}>Tabella prodotti venduti</Typography>
                    <ProductsTableStats
                        productsInOrder={summary.productsTable}
                        days={Object.keys(stats)}
                        isTotal={isTotal}
                    />
                    <Button
                        onClick={() => {
                            const _data = buildProductsData(summary.productsTable, products)

                            const HEADER = [
                                {
                                    value: 'Nome Prodotto',
                                    fontWeight: 'bold'
                                },
                                {
                                    value: 'Quantità',
                                    fontWeight: 'bold'
                                },
                                {
                                    value: 'Totale',
                                    fontWeight: 'bold'
                                }
                            ]

                            const data = [HEADER, ..._data];

                            writeXlsxFile(data, {
                                fileName: "file.xlsx",
                            }).then(() => {
                                toast.success('File excel generato con successo')
                            }).catch(() => {
                                toast.error('Si è verificato un errore nella generazione del file excel')
                            })


                        }}
                    >
                        Esporta XLS
                    </Button>
                </Paper>
        </Paper>
    )
}

const DailyStats: React.FC<{stats: OrderStatsResponse}> = (props) => {
    const {stats} = props

    const days = Object.keys(stats).map(d => dayjs(d)).sort((a, b) => b.diff(a, "day"))

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSelectDay = (day: Dayjs) => {
        setSelectedDay(day)
        setAnchorEl(null)
    }

    const handleClose = () => {
        setAnchorEl(null);
    };

    const [selectedDay, setSelectedDay] = React.useState(() => days[0])
    //
    const subStats: OrderStatsResponse = {}
    const selectedDayString = selectedDay.format("YYYY-MM-DD");
    subStats[selectedDayString] = stats[selectedDayString]
    //
    // let component = <Typography>No Data</Typography>
    //
    // if (subStats[selectedDay] !== undefined && subStats[selectedDay].products.length > 0) {
    //     component = <TotalInfo stats={subStats}/>
    // }


    return (
        <Box >
            <StatsToolbar
                title={`Statistiche giornaliere del ${selectedDay.locale('it').format('DD MMMM, YYYY')}`}
                toolbarBefore={<DayMenuButton selectedDay={selectedDay} handleClick={handleClick} />}
            />
            <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
                { days.map((d, idx) =>
                    <MenuItem key={idx} onClick={() => handleSelectDay(d)} sx={{ textTransform: 'uppercase'}}>{d.locale('it').format("DD MMMM")}</MenuItem>
                )}
            </Menu>
            <Divider sx={{ml: 1, mr: 1}} orientation="vertical" flexItem />

            <TotalInfo stats={subStats} />
        </Box>
    )
}

interface DayMenuButtonProps {
    selectedDay: Dayjs
    handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const DayMenuButton : React.FC<DayMenuButtonProps> = (props) => {
    const {selectedDay, handleClick} = props

    return (
        <>
            <Button variant="contained" endIcon={<KeyboardArrowDown />} sx={{ textWrap: 'nowrap'}} onClick={handleClick}>
                { selectedDay.locale('it').format("DD MMMM")}
            </Button>
            <Divider sx={{ml: 1, mr: 1}} orientation="vertical" flexItem />
        </>
    )
}

// const DayMenu : React.FC = () => {
//     return (
//         <>
//             <Button variant="contained" endIcon={<KeyboardArrowDown />} sx={{ textWrap: 'nowrap'}} onClick={handleClick}>
//                 { selectedDay.locale('it').format("DD MMMM")}
//             </Button>
//             <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
//                 { days.map((d, idx) =>
//                     <MenuItem key={idx} onClick={() => handleSelectDay(d)} sx={{ textTransform: 'uppercase'}}>{d.locale('it').format("DD MMMM")}</MenuItem>
//                 )}
//             </Menu>
//             <Divider sx={{ml: 1, mr: 1}} orientation="vertical" flexItem />
//         </>
//     )
// }


const StatsView: React.FC<ResponseStatsViewI> = (props) => {
    const {stats} = props
    const [value, setValue] = React.useState(0)

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const productsConf = productsSearchQuery({});

    const productsData = useQuery({
        queryKey: productsConf.queryKey,
        queryFn: productsConf.queryFn,
        staleTime: 1000 * 60 * 10
    });

    if (productsData.isFetched) {
        const products = productsData.data
        if (products !== undefined) {

            return (
                <ProductsStore products={products}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '20px', width: '100%'}}>

                        <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}}>
                            <Tabs
                                value={value}
                                onChange={handleChange}
                            >
                                <Tab label={'Totali'}></Tab>
                                <Tab label={'Giornaliere'}/>
                            </Tabs>
                            <TabPanel value={value} index={0}>
                                <StatsToolbar title="Statistiche Totali" />
                                <TotalInfo stats={stats} isTotal />
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                                <DailyStats stats={stats}/>
                            </TabPanel>

                        </Box>

                    </Box>
                </ProductsStore>
            )
        }
    }
    return (<CircularProgress/>)
}

export default StatsView