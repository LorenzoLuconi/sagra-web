import * as React from 'react'
import {OrderStatsResponse, productsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {Box, CircularProgress, Paper, Typography} from "@mui/material";
import {Product, StatsOrder} from "../../api/sagra/sagraSchemas.ts";
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
/*
const data = [
    { label: 'Group A', value: 400 },
    { label: 'Group B', value: 300 },
    { label: 'Group C', value: 300 },
    { label: 'Group D', value: 200 },
];

const ddata = [
    {
        label: "Group A",
        value: 16
    },
    {
        label: "Group B",
        value: 18
    },
    {
        label: "Group C",
        value: 16
    },
    {
        label: "Group D",
        value: 8
    },

]
*/


const settings = {
    margin: { right: 5 },
    width: 200,
    height: 200,
    hideLegend: true,
};

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
        <Paper sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', padding: '5px', gap: '20px'}}>
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

        </Paper>
    )

}

interface StatsViewI {
    stats: StatsOrder
}

/*
 <DayStats key={day} day={day} stats={stats[day]}/>
 */


const OverviewDayStats: React.FC<StatsViewI> = (props) => {
    const {stats} = props
    return (
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
            <StatsField field={'Numero Ordini'} value={stats.count}/>
            <StatsField field={'Totale Coperti'} value={stats.totalServiceNumber}/>
            <StatsField field={'Totale'} value={stats.totalAmount} isAmount/>
        </Box>
    )
}


const StatsView: React.FC<StatsViewI> = (props) => {
    const {stats} = props

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
                    <Paper sx={{display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '20px'}}>
                        <Timeline
                            sx={{
                                    [`& .${timelineOppositeContentClasses.root}`]: {
                                        flex: 0.2,
                                    }}}
                        >




                        {byDay.map((day: string) => {
                            return (

                                <TimelineItem key={day}>
                                    <TimelineOppositeContent color="textSecondary">
                                        <Typography>{convertDate('it', new Date(day))}</Typography>
                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <TimelineConnector />
                                        <TimelineDot/>
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent sx={{ py: '22px', px: 2 }}>
                                        <OverviewDayStats stats={stats[day]}/>
                                    </TimelineContent>
                                </TimelineItem>



                            )
                        })}
                        </Timeline>
                    </Paper>
                </ProductsStore>
            )
        }
    }
    return (<CircularProgress/>)
}

export default StatsView