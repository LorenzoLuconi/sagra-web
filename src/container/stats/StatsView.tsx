import * as React from 'react'
import {OrderStatsResponse, productsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {Box, Button, Card, CardActions, CardContent, CircularProgress, Paper, Typography, Tabs, Tab} from "@mui/material";
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

interface DayStatsI {
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

const DayStats: React.FC<DayStatsI> = (props) => {
    const {day, stats} = props
    const {products} = stats
    const {products: storedProducts} = useProducts()

    console.log('StoresProducts: ', storedProducts)

    console.log('Products: ', products)
    const data: PiePair[] = []

    for (let i = 0; i<products.length; i++) {
        console.log('Prodotto: ', products[i])
        const {productId, count, totalAmount} = products[i]
        data.push({label: `${storedProducts[productId].name}`, value: totalAmount})
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
    onSelectedDay: (selected: string) => voidd
}

const OverviewDayStats: React.FC<StatsViewI> = (props) => {
    const {stats, day} = props
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
                    onClick={() => {props.onSelectedDay(day)}}
                    size="small"
                >
                    Learn More
                </Button>
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
                                            onSelectedDay={(_selectedDay: string)=> {
                                                setSelectedDay(_selectedDay)
                                            }}
                                        />
                                    </TimelineContent>
                                </TimelineItem>



                            )
                        })}
                        </Timeline>
                           <Box>
                           <Tabs>
                               <Tab label={'Info'}></Tab>
                               <Tab label={'Grafico'}/>
                           </Tabs>
                           <Paper sx={{width: '100%'}}>
                               { selectedDay && <DayStats day={selectedDay} stats={stats[selectedDay]}/>}
                           </Paper>
                           </Box>
                       </Box>
                    </Paper>
                </ProductsStore>
            )
        }
    }
    return (<CircularProgress/>)
}

export default StatsView