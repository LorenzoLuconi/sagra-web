import {SummaryI} from "./Summary.ts";
import dayjs, {Dayjs} from "dayjs";
import {OrderStatsResponse} from "../../api/sagra/sagraComponents.ts";
import {Box, Grid, Paper, SxProps, Typography} from "@mui/material";
import {Logo} from "../../layout/Logo.tsx";
import {AppConf} from "../../AppConf.ts";
import * as React from "react";
import {convertDate, currency, FULL_DATE_CONF} from "../../utils";
import TotalTableCompare from "./TotalTableCompare.tsx";
import DepartmentsStatsTable from "./DepartmentsStatsTable.tsx";
import "../order/OrderPrint.css";


const ValueStyle : SxProps = {
    fontSize: '1.2rem',
    fontWeight: 700,
    ml: '5px'
}

const FieldStyle : SxProps = {
    fontSize: '0.9rem',
    fontWeight: 400,
    textTransform: 'uppercase',
    mt: 2
}


const TitleTableStyle : SxProps = {
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    p: 2
}


interface StatsPrintProps {
    stats: OrderStatsResponse
    summary: SummaryI
    day?: Dayjs
}

const StatsPrint : React.FC<StatsPrintProps> = (props) => {

    const {stats, summary, day} = props

    const daysString = Object.keys(stats);
    const days = daysString.map( (d) => dayjs(d))


    return (
        <StatsPrintContainer>
            <StatPrintLogo/>
            <Box sx={{ width: '100%', mt: 4, mb: 1, borderBottom: 1, display: "flex" , justifyContent: "space-between"}}>
                <Typography sx={{ fontSize: '1.5em', fontWeight: 700}} component="h2" > { day ? `Statistiche Giornaliere del ${day.locale('it').format('DD MMMM, YYYYY')}` : "Statistiche Totali"}</Typography>
                <Typography sx={{ mt: 1}}>{convertDate('it', new Date(), FULL_DATE_CONF)}</Typography>
            </Box>
            <StatsPrintSummary summary={summary} days={days}/>
            { ! day && days.length > 1 &&
                <Paper variant="outlined" sx={{ mt: 4 }}>
                    <Typography sx={{ ...TitleTableStyle}}>Comparazione Statistiche Giornaliere</Typography>
                    <TotalTableCompare stats={stats} summary={summary} isPrint />
                </Paper>
            }
            <Paper variant="outlined" sx={{ mt: 2 }}>
                <Typography sx={{ ...TitleTableStyle}}>Statistiche Reparti</Typography>
                <DepartmentsStatsTable summary={summary} />
            </Paper>
        </StatsPrintContainer>
    )
}

const StatsPrintContainer = ( props: React.PropsWithChildren ) => {
    return (
        <Box sx={{ m: 3, display: 'flex', flexDirection: 'column'}}>
            {props.children}
        </Box>
    )
}


const StatsPrintSummary : React.FC<{summary: SummaryI, days: Dayjs[]}> = (props) => {
    const {summary, days} = props

    return (
        <Grid container>
            <Grid size={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>

                    <Typography sx={{ ...FieldStyle }}>Incasso Totale</Typography>
                    <Typography sx={{ ...ValueStyle }}>{currency(summary.totalAmount)}</Typography>

                    <Typography sx={{ ...FieldStyle }}>Totale Numero Ordini</Typography>
                    <Typography sx={{ ...ValueStyle }}>{summary.count}</Typography>

                    <Typography sx={{ ...FieldStyle }}>Numero Coperti</Typography>
                    <Typography sx={{ ...ValueStyle }}>{summary.totalServiceNumber}</Typography>
                </Box>
            </Grid>
            <Grid size={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>

                    <Typography sx={{ ...FieldStyle }}>Incasso Ordini Asporto</Typography>
                    <Typography sx={{ ...ValueStyle }}>{currency(summary.totalTakeAwayAmount)}</Typography>

                    <Typography sx={{ ...FieldStyle }}>Numero Ordini Asporto</Typography>
                    <Typography sx={{ ...ValueStyle }}>{summary.totalTakeAwayCount}</Typography>


                    {
                        days.length > 1 && <>
                            <Typography sx={{ ...FieldStyle }}>Giorni</Typography>
                            <Typography sx={{ ...ValueStyle, fontSize: '1rem' }}>{ `n. ${days.length} giorni dal ${days[0].locale('it').format('DD MMMM')} al ${days[days.length-1].locale('it').format('DD MMMM')}` }</Typography>
                        </>
                    }

                    {
                        days.length == 1 && <>
                            <Typography sx={{ ...FieldStyle }}>Giorno</Typography>
                            <Typography sx={{ ...ValueStyle }}>{ days[0].locale('it').format('DD MMMM')}</Typography>
                        </>
                    }


                </Box>
            </Grid>
        </Grid>


    )

}


const StatPrintLogo = () => {
    return (
        <Box sx={{display: 'flex', columnGap: 5, justifyContent: 'flex-start', width: '100%'}}>
            <Logo sx={{fontSize: '6vh', color: 'text.primary', verticalAlign: 'middle'}} />
            <Typography sx={{fontSize: '1.8em', color: 'text.primary', pt: 3}}>{AppConf.getTitle()}</Typography>
        </Box>
    )
}


export default StatsPrint;