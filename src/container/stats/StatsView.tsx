import * as React from 'react'
import {OrderStatsResponse, productsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, TableSortLabel,
    Tabs,
    Typography
} from "@mui/material";
import {Product, StatsOrder, StatsOrderedProducts} from "../../api/sagra/sagraSchemas.ts";
import {PieChart, PieSeries} from '@mui/x-charts/PieChart';
import {currency} from "../../utils";
import ProductsStore, {useProducts} from "../../context/ProductsStore.tsx";
import {useQuery} from "@tanstack/react-query";
import {get, orderBy, sortBy} from "lodash";
import {DatePicker, DatePickerSlotProps} from "@mui/x-date-pickers";
import dayjs, {Dayjs} from 'dayjs'
import writeXlsxFile from "write-excel-file";
import toast from "react-hot-toast";
import {useMemo, useState} from "react";


interface StatsFieldI {
    field: string
    value: number
    isAmount?: boolean
    sx?: React.CSSProperties
}

const StatsField: React.FC<StatsFieldI> = (props) => {
   const value = props.isAmount ? currency(props.value): props.value
    return (
        <Box sx={{display: 'flex', gap: '10px', alignItems: 'center', ...props.sx}}>
            <Typography sx={{fontWeight: 800, ...props.sx}}>{props.field}</Typography>
            <Typography sx={{...props.sx}}>{`${value}`}</Typography>
        </Box>
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
                totalQuantity: productsTable[p.productId].totalQuantity + p.totalQuantity,
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

enum OrderDirection {
    asc = "asc",
    desc = "desc"
}

const TotalTabularInfo: React.FC<{productsInOrder: Record<number, StatsOrderedProducts>, summary: SummaryI}> = (props) => {
    const {productsInOrder, summary} = props
    enum ProductsOrderBy {
        name = "name",
        totalQuantity = "totalQuantity",
        totalAmount = "totalAmount",
    }


    const {products} = useProducts()
    const [prodOrderBy, setProdOrderBy] = useState<ProductsOrderBy>(ProductsOrderBy.name)
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.desc)


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
        <Box sx={{display: 'flex', flexDirection: 'column', gap: '30px'}}>


            <TableContainer component={Box}>
                <Table sx={{ minWidth: 650 }} size={'small'} aria-label="total table">
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
    )
}


const buildProductsData = (fullOrder: Record<number, StatsOrderedProducts>, productsTable: Record<number, Product>) => {
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


const TotalInfo: React.FC<{stats: OrderStatsResponse}> = (props) => {
    const {stats} = props
    const [value, setValue] = React.useState(0)
    const {products} = useProducts()
    const dayKeys = Object.keys(stats)

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

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

    const summary={totalServiceNumber: _totalServiceNumber, totalAmount: _totalAmount, count: _totalCount}

    return (
<Box
    sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}
>

    <Box
        sx={(theme) => (
    {border: `1px solid transparent`, padding: '5px 10px', borderRadius: '10px',
        background: `${theme.palette.secondary.main}`,
        color: `${theme.palette.secondary.contrastText}`,
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '10px', width: '50%'}
        )}>
        <Box>
        <StatsField sx={{fontSize: '1.2rem'}} field={'Numero Ordini'} value={summary.count}/>
        </Box>
        <StatsField
            sx={{fontSize: '1.2rem'}}
            field={'Totale Coperti'}
            value={summary.totalServiceNumber}/>
        <StatsField
            sx={{fontSize: '1.2rem'}}
            field={'Totale'}
            value={summary.totalAmount} isAmount/>
    </Box>

    <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '30px', width: '100%'}}>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>

                <TotalTabularInfo
                    productsInOrder={productsTable}
                    summary={{totalServiceNumber: _totalServiceNumber, totalAmount: _totalAmount, count: _totalCount}}
                />
                <Button
                    onClick={() => {
                        const _data = buildProductsData(productsTable, products)

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
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>

            <Tabs
                value={value}
                onChange={handleChange}
                textColor="secondary"
                indicatorColor="secondary"
            >
                <Tab label={'Grafico Importi'}/>
                <Tab label={'Grafico Prodotti'}/>
            </Tabs>

            <TabPanel value={value} index={0}>
                <StatsPieChart productsStats={productsTable} field={'totalAmount'}/>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <StatsPieChart productsStats={productsTable} field={'count'}/>
            </TabPanel>
            </Box>
        </Box>
</Box>
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
                    <Paper sx={{display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '20px', width: '100%'}}>

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

                    </Paper>
                </ProductsStore>
            )
        }
    }
    return (<CircularProgress/>)
}

export default StatsView