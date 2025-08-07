import * as React from 'react'
import {useState} from 'react'
import {OrderStatsResponse, productsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    LinearProgress,
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
import {DatePicker, DatePickerSlotProps} from "@mui/x-date-pickers";
import dayjs, {Dayjs, ManipulateType} from 'dayjs'
import writeXlsxFile from "write-excel-file";
import toast from "react-hot-toast";
import {BarChart, BarLabel, SparkLineChart} from '@mui/x-charts';
import './Stats.css'
import {calculateSummary, DailyProductStatI, SummaryI} from "./Summary.ts";
import DepartmentStats from "./DepartmentStats.tsx";
import {AppConf} from "../../AppConf.ts";

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
                        xAxis={[{ data: props.graphData.labels, position: 'none'  }]}
                        yAxis={[{position: 'none'}]}
                        barLabel="value"
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
    console.log('BuildChartFromDays: ', xData, yData)

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

const buildSagraDaysRange = (): string[] => {
    const startDay = AppConf.getSagraStartDay()
    const endDay = AppConf.getSagraEndDay()
    return dayjsRange(new dayjs(startDay), new dayjs(endDay), 'day')
}


const TotalTabularInfo: React.FC<{productsInOrder: Record<number, StatsOrderedProducts>, summary: SummaryI}> = (props) => {
    const {productsInOrder, summary} = props
    const theme = useTheme()
    enum ProductsOrderBy {
        name = "name",
        totalQuantity = "totalQuantity",
        totalAmount = "totalAmount",
    }




    const sagraDays: string[] = buildSagraDaysRange()


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
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

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
                            <TableCell>
                                Importi Giornalieri
                            </TableCell>
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
                                <TableCell align={'center'}>
                                    {buildChartFromDays(sagraDays, productsInOrder[+productId].days)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
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




const TotalInfo: React.FC<{ stats: OrderStatsResponse }> = (props) => {
    const {stats} = props
    const theme = useTheme();
    const [value, setValue] = React.useState(0)
    const {products} = useProducts()

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };



    const summary = calculateSummary(stats)

    const dayKeys = orderBy(Object.keys(stats));
    const countGraph = { values: dayKeys.map(day => stats[day].count), labels: dayKeys};
    const serviceGraph = { values: dayKeys.map(day => stats[day].totalServiceNumber), labels: dayKeys};
    const totalAmountGraph = { values: dayKeys.map(day => stats[day].totalAmount), labels: dayKeys};

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
                        gap: 2
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
                    graphData={totalAmountGraph}
                    isAmount />
                <Card sx={{ ...cardStyle}} >
                    <CardContent>
                        <Typography sx={{ ...cardTitle, mb: 2}} >Statistiche Reparti</Typography>
                        <DepartmentStats summary={summary} width={170} height={170} />
                    </CardContent>
                </Card>
            </Box>

            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: '30px',
                width: '100%'
            }}>
                <Paper  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                }}>
                    <Typography sx={{ ...cardTitle, marginBottom: 2}}>Tabella prodotti venduti</Typography>
                    <TotalTabularInfo
                        productsInOrder={summary.productsTable}
                        summary={summary}
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
                <Paper  sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: 1, p: 2 }}>

                    <Tabs
                        value={value}
                        onChange={handleChange}
                        textColor="secondary"
                        indicatorColor="secondary"
                    >
                        <Tab label={'Grafico Importi'}/>
                        <Tab label={'Grafico Quantità'}/>
                    </Tabs>

                    <TabPanel value={value} index={0}>
                        <StatsPieChart productsStats={summary.productsTable} field={'totalAmount'}/>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <StatsBarChart productsStats={summary.productsTable} field={'totalQuantity'}/>
                    </TabPanel>
                </Paper>
            </Box>
        </Paper>
    )
}

const DayInfoStats: React.FC<{day: Dayjs, stats: OrderStatsResponse}> = (props) => {
    const {day, stats} = props
    const date = day.format('YYYY-MM-DD')
    if (stats[date] !== undefined && stats[date].products.length >0) {

    const subStats: OrderStatsResponse = {}
    subStats[date] = stats[date]

        return (
            <TotalInfo stats={subStats}/>

        )
    } else {
        return <Typography>No data</Typography>
    }
}
const AllDaysStats: React.FC<{stats: OrderStatsResponse}> = (props) => {
    const {stats} = props
    const [selectedDay, setSelectedDay] = React.useState(dayjs().format('YYYY-MM-DD'))

    const subStats: OrderStatsResponse = {}
    subStats[selectedDay] = stats[selectedDay]

    let component = <Typography>No Data</Typography>

    if (subStats[selectedDay] !== undefined && subStats[selectedDay].products.length > 0) {
        component = <TotalInfo stats={subStats}/>

    }

    return (
        <Box   id={'order-search-bar'}>
            <DatePicker
                value={dayjs(selectedDay)}
                onChange={ (v) => setSelectedDay(v ? v.format( 'YYYY-MM-DD') : '')}
                slotProps={{field: { clearable: true }} as DatePickerSlotProps<true>}
            />
            {component}
        </Box>
    )
}


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
                                <Tab label={'Totale'}></Tab>
                                <Tab label={'Oggi'}/>
                                <Tab label={'Giorni Precedenti'}/>
                            </Tabs>
                            <TabPanel value={value} index={0}>
                                <TotalInfo stats={stats}/>
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                                <DayInfoStats day={dayjs()} stats={stats} />
                            </TabPanel>
                            <TabPanel value={value} index={2}>
                                <AllDaysStats stats={stats}/>
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