import * as React from 'react'
import {OrderStatsResponse, productsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    Paper,
    Popover,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Typography
} from "@mui/material";
import {Product, StatsOrder, StatsOrderedProducts} from "../../api/sagra/sagraSchemas.ts";
import {PieChart, PieSeries} from '@mui/x-charts/PieChart';
import {convertDate, currency} from "../../utils";
import ProductsStore, {useProducts} from "../../context/ProductsStore.tsx";
import {useQuery} from "@tanstack/react-query";
import {get} from "lodash";
import {DatePicker} from "@mui/x-date-pickers";
import dayjs, {Dayjs} from 'dayjs'
import writeXlsxFile from "write-excel-file";
import toast from "react-hot-toast";

interface DayStatsContainerI {
    day: string
    stats: StatsOrder
}


interface StatsFieldI {
    field: string
    value: number
    isAmount?: boolean
}

const StatsField: React.FC<StatsFieldI> = (props) => {
    return (
        <Box sx={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <Typography sx={{fontWeight: 800}}>{props.field}</Typography>
            <Typography>{props.isAmount ? currency(props.value) : props.value}</Typography>
        </Box>
    )
}

interface PiePair {
    label: string
    value: number
}

const TabularInfo: React.FC<DayStatsContainerI> = (props) => {
    const {day, stats} = props
    const {products} = stats
    const {products: storedProducts} = useProducts()

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
            <TableContainer component={Box}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Prodotto</TableCell>
                            <TableCell align="center">Quantità</TableCell>
                            <TableCell align="right">Importo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow
                                key={product.productId}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {storedProducts[product.productId].name}
                                </TableCell>
                                <TableCell align="center">{product.totalQuantity}</TableCell>
                                <TableCell align="right">{currency(product.totalAmount)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                <StatsField field={'Numero Ordini'} value={stats.count}/>
                <StatsField field={'Totale Coperti'} value={stats.totalServiceNumber}/>
                <StatsField field={'Totale'} value={stats.totalAmount} isAmount/>
            </Box>
        </Box>
    )
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


const DayStatsContainer: React.FC<DayStatsContainerI> = (props) => {
    const {stats, day} = props
    const [value, setValue] = React.useState(0)

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{p: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px'}}>
            <Typography sx={{fontSize: '1.1rem', fontWeight: 700, color: 'primary'}}>{`Statistiche del giorno ${convertDate('it', new Date(day))}`}</Typography>

            <DatePicker />


            <Tabs
                value={value}
                onChange={handleChange}
            >
                <Tab label={'Info'}></Tab>
                <Tab label={'Grafico Prodotti'}/>
                <Tab label={'Grafico Incassi'}/>
            </Tabs>
            <TabPanel value={value} index={0}>
                <TabularInfo day={day} stats={stats}/>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <DayStats day={day} stats={stats} field={'count'}/>
            </TabPanel>
            <TabPanel value={value} index={2}>
                <DayStats day={day} stats={stats} field={'totalAmount'}/>
            </TabPanel>
        </Box>
    )
}


interface DayStatsI extends DayStatsContainerI {
    field: string
}
const DayStats: React.FC<DayStatsI> = (props) => {
    const {day, stats, field} = props
    const {products} = stats
    const {products: storedProducts} = useProducts()

    console.log('StoresProducts: ', storedProducts)

    console.log('Products: ', products)
    const data: PiePair[] = []

    for (let i = 0; i<products.length; i++) {
        console.log('Prodotto: ', products[i])
        const {productId} = products[i]
        data.push({label: `${storedProducts[productId].name}`, value: get(products[i], field)})
    }



    return (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '5px', gap: '20px'}}>
            <Typography sx={{fontWeight: '700', fontSize: '2rem'}}>{convertDate('it', new Date(day))}</Typography>

            <Box sx={{display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                    <StatsField field={'Numero Ordini'} value={stats.count}/>
                    <StatsField field={'Totale Coperti'} value={stats.totalServiceNumber}/>
                    <StatsField field={'Totale'} value={stats.totalAmount} isAmount/>
                </Box>
                <PieChart
                    width={400}
                    height={400}
                    hideLegend={false}
                    sx={{fontFamily: 'Roboto'}}
                    series={[{ innerRadius: 100, outerRadius: 200, data, arcLabel: 'value' } as PieSeries]}
                />
            </Box>

        </Box>
    )

}

interface ResponseStatsViewI {
    stats: OrderStatsResponse
}

/*
 <DayStats key={day} day={day} stats={stats[day]}/>
 */


interface StatsViewI {
    stats: StatsOrder
    day: string
}

const OverviewDayStats: React.FC<StatsViewI> = (props) => {
    const {stats, day} = props
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);


    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <Card
            sx={{
                display: 'flex',
                width: 'fit-content',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                padding: '10px'
            }}
        >
            <CardContent>
                <StatsField field={'Numero Ordini'} value={stats.count}/>
                <StatsField field={'Totale Coperti'} value={stats.totalServiceNumber}/>
                <StatsField field={'Totale'} value={stats.totalAmount} isAmount/>
            </CardContent>
            <CardActions>
                <Button
                    aria-describedby={id}
                    onClick={handleClick}
                    size="small"
                >
                    Apri Statistiche
                </Button>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'left',
                    }}
                >
                    <DayStatsContainer stats={stats} day={day}/>
                </Popover>
            </CardActions>
        </Card>
    )
}

const collectDayInfo = (dayStats: StatsOrder, productsTable: Record<number, StatsOrderedProducts>) => {
    const {products} = dayStats

    console.log('collectDayInfo: ', products)

    for (let i=0; i<products.length; i++) {
        const p = products[i]
        const productInTable = productsTable[p.productId]
        if (productInTable === undefined) {
            productsTable[p.productId] = p
        } else {
            productsTable[p.productId] = {
                productId: p.productId,
                totalQuantity: productsTable[p.productId].totalAmount + p.totalQuantity,
                totalAmount: productsTable[p.productId].totalAmount + p.totalAmount
            } as StatsOrderedProducts
        }
    }

    console.log('CollectsInfo ', productsTable)


    return (
        {
            totalAmount: dayStats.totalAmount,
            count: dayStats.count,
            totalServiceNumber: dayStats.totalServiceNumber,
            table: productsTable
        }
    )


}

interface SummaryI {
    totalServiceNumber: number
    totalAmount: number
    count: number
}

const TotalTabularInfo: React.FC<{productsInOrder: Record<number, StatsOrderedProducts>, summary: SummaryI}> = (props) => {
    const {productsInOrder, summary} = props

    const {products} = useProducts()

    const productIds = Object.keys(productsInOrder) as number[]

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: '30px'}}>

            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <StatsField field={'Numero Ordini'} value={summary.count}/>
                <StatsField field={'Totale Coperti'} value={summary.totalServiceNumber}/>
                <StatsField field={'Totale'} value={summary.totalAmount} isAmount/>
            </Box>

            <TableContainer component={Box}>
                <Table sx={{ minWidth: 650 }} size={'small'} aria-label="total table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Prodotto</TableCell>
                            <TableCell align="right">Quantità</TableCell>
                            <TableCell align="right">Importo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productIds.map((productId) => (
                            <TableRow
                                key={productId}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {products[productId].name}
                                </TableCell>
                                <TableCell align="right">{productsInOrder[productId].totalQuantity}</TableCell>
                                <TableCell align="right">{currency(productsInOrder[productId].totalAmount)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
    )
}


const buildProcutsData = (fullOrder: Record<number, StatsOrderedProducts>, productsTable: Record<number, Product>) => {
    const productKeys = Object.keys(fullOrder) as number[]
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

interface XLSDataI {
    productName: string
    count: number
    totalAmount: number
}

const TotalInfo: React.FC<{stats: OrderStatsResponse}> = (props) => {
    const {stats} = props
    const {products} = useProducts()
    const dayKeys = Object.keys(stats)
    let _totalServiceNumber = 0
    let _totalCount = 0;
    let _totalAmount = 0;
    const productsTable: Record<number, StatsOrderedProducts> = {}
    for (let i=0; i<dayKeys.length; i++) {
        const day = dayKeys[i]
        const dayStats = stats[day]
        const {totalAmount, totalServiceNumber, count} = collectDayInfo(dayStats, productsTable)
        _totalServiceNumber += totalServiceNumber
        _totalAmount += totalAmount
        _totalCount += count
    }


    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
        <TotalTabularInfo
            productsInOrder={productsTable}
            summary={{totalServiceNumber: _totalServiceNumber, totalAmount: _totalAmount, count: _totalCount}}
        />
            <Button
                onClick={() => {
                    const _data = buildProcutsData(productsTable, products)

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
        </Box>
    )
}

const DayInfoStats: React.FC<{day: Dayjs, stats: OrderStatsResponse}> = (props) => {
    return (
        <span>Today</span>
    )
}
const AllDaysStats = () => {
    return (
        <span>AllDays</span>
    )
}


const StatsView: React.FC<ResponseStatsViewI> = (props) => {
    const {stats} = props
    const [selectedDay, setSelectedDay] = React.useState<string | undefined>(undefined)
    const [value, setValue] = React.useState(0)

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const byDay = Object.keys(stats)

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
                    <Paper sx={{display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '20px', width: '100%'}}>

                        <Box sx={{display: 'flex', flexDirection: 'column'}}>
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
                                <AllDaysStats />
                            </TabPanel>

                        </Box>

                    </Paper>
                </ProductsStore>
            )
        }
    }
    return (<CircularProgress/>)
}

export default StatsView