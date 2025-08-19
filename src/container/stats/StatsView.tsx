import * as React from 'react'
import {useRef} from 'react'
import {OrderStatsResponse, productsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Menu,
    MenuItem,
    Paper,
    Tab,
    Tabs,
    Typography,
    useTheme
} from "@mui/material";
import {Product, StatsOrderedProducts} from "../../api/sagra/sagraSchemas.ts";
import {currency} from "../../utils";
import ProductsStore, {useProducts} from "../../context/ProductsStore.tsx";
import {useQuery} from "@tanstack/react-query";
import dayjs, {Dayjs} from 'dayjs'
import writeXlsxFile  from "write-excel-file";
import toast from "react-hot-toast";
import {BarChart, BarLabel} from '@mui/x-charts';
import './Stats.css'
import {calculateSummary } from "./Summary.ts";
import DepartmentsStatsPie from "./DepartmentsStatsPie.tsx";
import {KeyboardArrowDown} from "@mui/icons-material";
import 'dayjs/locale/it';
import TotalTableCompare from "./TotalTableCompare.tsx";
import StatsToolbar from "./StatsToolbar.tsx";
import StatsPrint from "./StatsPrint.tsx";
import ProductsTableStats from "./ProductsStatsTable.tsx";


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

// interface PiePair {
//     label: string
//     value: number
// }

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

// const StatsPieChart: React.FC<{productsStats: Record<number, StatsOrderedProducts>, field: string}> = (props) => {
//
//     const {productsStats, field} = props
//     const {products} = useProducts()
//     const productsK = Object.keys(productsStats)
//     const data: PiePair[] = []
//
//     for (let i = 0; i<productsK.length; i++) {
//         const {productId} = productsStats[+productsK[i]]
//         data.push({
//             label: `${products[productId].name}`,
//             value: get( productsStats[+productsK[i]], field)
//         })
//     }
//     return (
//      <PieChart
//          width={500}
//          height={400}
//          hideLegend={false}
//          sx={{fontFamily: 'Roboto'}}
//          series={[{ innerRadius: 100, outerRadius: 200, data, arcLabel: 'value' } as PieSeries]}
//      />
//  )
// }



// const StatsBarChart: React.FC<{productsStats: Record<number, StatsOrderedProducts>, field: string}> = (props) => {
//
//     const {productsStats, field} = props
//     const {products} = useProducts()
//
//     const values: number[] = []
//     const labels: string[] = []
//
//     Object.values(productsStats).sort((a, b) => (get(a, field) < get(b, field) ? 1 : get(a, field) < get(b, field) ? -1 : 0))
//         .forEach( (s) => {
//             values.push(get( productsStats[s.productId], field))
//             labels.push(products[s.productId].name)
//         });
//
//     return (
//         <BarChart
//             width={500}
//             height={31*values.length}
//             layout="horizontal"
//             hideLegend
//             sx={{fontFamily: 'Roboto'}}
//
//             series={[
//                 {
//                     data: values,
//                     label: 'Importo',
//                 },
//             ]}
//             yAxis={[{ data: labels ,  position: 'none'}]}
//         />
//     )
// }



// export function dayjsRange(start: Dayjs, end: Dayjs, unit: ManipulateType, format?: string) {
//     const ff = format ?? 'YYYY-MM-DD'
//     const range = [];
//     let current = start;
//     while (!current.isAfter(end)) {
//         range.push(current.format(ff));
//         current = current.add(1, unit);
//     }
//     return range;
// }



const buildProductsData = (fullOrder: Record<number, StatsOrderedProducts>, productsTable: Record<number, Product>) => {
    const productKeys = Object.keys(fullOrder)
    return productKeys.map((productId) => {
        const id = +productId
        return (
            [
                {
                    type: String,
                    value: productsTable[id].name,
                },
                {
                    type: Number,
                    value: fullOrder[id].totalQuantity
                },
                {
                    type: Number,
                    value: fullOrder[id].totalAmount,
                    format: '#,##0.00 €',
                }
            ]
        )
    })
}


interface TotalInfoProps {
    stats: OrderStatsResponse
    printContentRef: React.RefObject<HTMLDivElement|null>
}

const TotalInfo: React.FC<TotalInfoProps> = (props) => {
    const {stats, printContentRef} = props
    const theme = useTheme();
   // const [value, setValue] = React.useState(0)
    const {products} = useProducts()

    // const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    //     setValue(newValue);
    // };

    const summary = calculateSummary(stats)

    const dayKeys = Object.keys(stats);
    const isTotal = dayKeys.length > 1
    const countGraph = isTotal ? { values: dayKeys.map(day => stats[day].count), labels: dayKeys} : undefined
    const totalAmountGraph = isTotal ? { values: dayKeys.map(day => stats[day].totalAmount), labels: dayKeys} : undefined;
    const serviceGraph = isTotal ? { values: dayKeys.map(day => stats[day].totalServiceNumber), labels: dayKeys} : undefined;

    return (
        <>
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
                            <DepartmentsStatsPie summary={summary} width={170} height={170} />
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
                            <TotalTableCompare stats={stats} summary={summary}  sx={{ minWidth: 500, backgroundColor: theme.palette.background.default }}/>
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
                                        fontWeight: 'bold',
                                        align: 'center',
                                    },
                                    {
                                        value: 'Totale',
                                        fontWeight: 'bold',
                                        align: 'center'
                                    }
                                ]

                                const data = [HEADER, ..._data];

                                // @ts-ignore
                                writeXlsxFile(data, {
                                    columns: [{ width: 50}],
                                    fileName: "statistiche_sagra.xlsx",
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
            {
                printContentRef &&
                    <div ref={printContentRef} className="printContent print-container">
                        <StatsPrint stats={stats} summary={summary} />
                    </div>
            }

        </>
    )
}

const DailyStats: React.FC<{stats: OrderStatsResponse, printContentRef: React.RefObject<HTMLDivElement|null>}> = (props) => {
    const {stats, printContentRef} = props

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

    return (
        <Box >
            <StatsToolbar
                title={`Statistiche giornaliere del ${selectedDay.locale('it').format('DD MMMM, YYYY')}`}
                printContentRef={printContentRef}
                toolbarBefore={<DayMenuButton selectedDay={selectedDay} handleClick={handleClick} />}
            />
            <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
                { days.map((d, idx) =>
                    <MenuItem key={idx} onClick={() => handleSelectDay(d)} sx={{ textTransform: 'uppercase'}}>{d.locale('it').format("DD MMMM")}</MenuItem>
                )}
            </Menu>
            <Divider sx={{ml: 1, mr: 1}} orientation="vertical" flexItem />

            <TotalInfo stats={subStats} printContentRef={printContentRef}/>
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


const StatsView: React.FC<ResponseStatsViewI> = (props) => {
    const {stats} = props
    const [value, setValue] = React.useState(0)

    const printContentRef = useRef<HTMLDivElement>(null);

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
                                <StatsToolbar title="Statistiche Totali" printContentRef={printContentRef??undefined} />
                                <TotalInfo stats={stats} printContentRef={printContentRef} />
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                                <DailyStats stats={stats} printContentRef={printContentRef} />

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