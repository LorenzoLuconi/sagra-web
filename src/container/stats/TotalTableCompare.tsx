import {OrderStatsResponse} from "../../api/sagra/sagraComponents.ts";
import dayjs from "dayjs";
import {
    Box,
    LinearProgress, SxProps,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, Typography,
    useTheme
} from "@mui/material";
import {currency} from "../../utils";
import * as React from "react";
import {SummaryI} from "./Summary.ts";

const TotalTableCompare: React.FC<{stats: OrderStatsResponse, summary: SummaryI, sx?: SxProps, isPrint?: boolean}> = (props) => {
    const {stats, summary, sx, isPrint} = props

    const days = Object.keys(stats).map(d => dayjs(d)).sort((a, b) => b.diff(a, "day"))


    return (
        <Table size='small' sx={{ ...sx }}>
            <TableHead>
                <TableRow>
                    <TableCell>Giorno</TableCell>
                    <TableCell align="center">Coperti</TableCell>
                    <TableCell align="center">Numero Ordini</TableCell>
                    <TableCell align="center">Ordini da Asporto</TableCell>
                    <TableCell align="right">Totale Asporto</TableCell>
                    <TableCell align="right">Incasso Totale</TableCell>
                    <TableCell align="left">Percentuale Incasso</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                { days.map( (day, idx) => {
                    const statsOrder = stats[day.format("YYYY-MM-DD")];
                    const percent = statsOrder.totalAmount*100/summary.totalAmount;
                    return (
                            <TableRow key={idx}  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ textWrap: 'nowrap'}}>{day.locale('it').format("DD MMMM")}</TableCell>
                                <TableCell align="center">{statsOrder.totalServiceNumber}</TableCell>
                                <TableCell align="center">{statsOrder.count}</TableCell>
                                <TableCell align="center">{statsOrder.takeAway?.count??0}</TableCell>
                                <TableCell align="right">{statsOrder.takeAway?.totalAmount ? currency(statsOrder.takeAway.totalAmount) : currency(0)}</TableCell>
                                <TableCell align="right">{currency(statsOrder.totalAmount)}</TableCell>
                                <TableCell >
                                    { isPrint ?
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9em' }}>{Math.round(percent)}%</Typography>
                                        :
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
                                            <LinearProgress sx={{height: 10, borderRadius: 5, width: '140px'}} variant="determinate" value={percent}/>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9em' }}>{Math.round(percent)}%</Typography>
                                        </Box>
                                    }
                                </TableCell>
                            </TableRow>
                        )
                    }

                )}

            </TableBody>
        </Table>
    )
}

export default TotalTableCompare;