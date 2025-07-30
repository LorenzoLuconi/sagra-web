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
    Typography,
    Tabs,
    Tab,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Popover
} from "@mui/material";
import {Product, StatsOrder} from "../../api/sagra/sagraSchemas.ts";
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import {PieChart, PieSeries} from '@mui/x-charts/PieChart';
import {convertDate} from "../../utils";
import ProductsStore, {useProducts} from "../../context/ProductsStore.tsx";
import {useQuery} from "@tanstack/react-query";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import {TimelineConnector, TimelineContent, TimelineDot, TimelineSeparator} from "@mui/lab";
import TimelineOppositeContent, {
    timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import {get} from "lodash";

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
    const amountString = props.isAmount ? ' €': ''
    return (
        <Box sx={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <Typography sx={{fontWeight: 800}}>{props.field}</Typography>
            <Typography>{`${props.value}${amountString}`}</Typography>
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
                        <TableCell align="right">Quantità</TableCell>
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
                            <TableCell align="right">{product.count}</TableCell>
                            <TableCell align="right">{product.totalAmount}</TableCell>
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

    console.log('OverviewDayStats: ', stats, day)

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


const StatsView: React.FC<ResponseStatsViewI> = (props) => {
    const {stats} = props
    const [selectedDay, setSelectedDay] = React.useState<string | undefined>(undefined)

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

            console.log('Fetched: ', products)

            return (
                <ProductsStore products={products}>
                    <Paper sx={{display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '20px', width: '100%'}}>
                       <Box sx={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>




                        <Timeline
                            sx={{
                                display: 'flex',
                                    [`& .${timelineOppositeContentClasses.root}`]: {
                                        flex: 0.2,
                                    }}}
                        >




                        {byDay.map((day: string) => {
                            return (

                                <TimelineItem key={day} >
                                    <TimelineOppositeContent
                                        sx={{display: 'flex', justifyContent: 'flex-end ', alignItems: 'center'}}
                                        color="primary">

                                        <Typography
                                            sx={{fontWeight: 700}}
                                        >{convertDate('it', new Date(day))}</Typography>

                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <TimelineConnector sx={{color: 'red'}}/>
                                        <TimelineDot/>
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent >
                                        <OverviewDayStats
                                            day={day}
                                            stats={stats[day]}
                                        />
                                    </TimelineContent>
                                </TimelineItem>



                            )
                        })}
                        </Timeline>

                       </Box>
                    </Paper>
                </ProductsStore>
            )
        }
    }
    return (<CircularProgress/>)
}

export default StatsView