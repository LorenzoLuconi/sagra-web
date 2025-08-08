import * as React from "react"
import {MonitorProductView} from "../../api/sagra/sagraSchemas.ts";
import {
    Alert,
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import {convertDate, TIME_CONF} from "../../utils";
import {useParams} from "react-router";
import {monitorViewQuery} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";


const MonitorView: React.FC = () => {

    const params = useParams()
    const monitorId: number = params.monitorId ? +(params.monitorId) : 0
    const theme = useTheme();

    const monitorViewConf = monitorViewQuery({pathParams: {monitorId: monitorId}})
    const monitorQuery = useQuery({
        queryKey: monitorViewConf.queryKey,
        queryFn: monitorViewConf.queryFn,
        refetchInterval: 1000*60
    })

    if ( monitorQuery.isPending) {
        return (
            <Box sx={{alignItems: 'center', justifyItems: 'center', m: 2}}>
                <CircularProgress/>
            </Box>
        )
    }

    if ( monitorQuery.isError) {
        return <Alert severity="error">Si è verificato un errore prelevando la lista dei monitor: {monitorQuery.error.message}</Alert>
    }


    const monitor = monitorQuery.data
    const products = monitor.products ?? [] as MonitorProductView[]

    const productBackGroundColor = (availableQuantity: number, idx: number) => {
        if ( availableQuantity <= 0 ) {
            return theme.sagra.productSoldOut;
        } else if ( availableQuantity < 10 ) {
            return theme.sagra.productAlmostSoldOut;
        } else {
            return (idx % 2 == 0 ? '#efefef': 'transparent')
        }
    }

    return (

            <Paper sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '93vh', padding: '20px', gap: '20px'}}>

                <Box sx={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '5ch'}}>{monitor.name}</Typography>
                    <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '5ch'}}>{convertDate('it', new Date(monitor.lastUpdate), TIME_CONF)}</Typography>
                </Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" style={{fontWeight: 400, textTransform: 'uppercase', fontSize: '2ch'}}>Prodotto</TableCell>
                            <TableCell align="center" style={{ width: "10vw", fontWeight: 400, textTransform: 'uppercase', fontSize: '2ch'}}>Iniziale</TableCell>
                            <TableCell align="center" style={{ width: "10vw", fontWeight: 400, textTransform: 'uppercase', fontSize: '2ch' }}>Venduto</TableCell>
                            <TableCell align="center" style={{ width: "10vw", fontWeight: 400, textTransform: 'uppercase', fontSize: '2ch' }}>Vendibile</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {products.map((product: MonitorProductView, idx: number) => {
                            return (
                                <TableRow key={idx} sx={{ backgroundColor: productBackGroundColor(product.availableQuantity, idx) }}>
                                    <TableCell style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '3ch' }}>
                                        {product.name}
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '3ch' }} align="center">
                                        {product.initialQuantity}
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '3ch' }} align="center">
                                        {product.initialQuantity-product.availableQuantity}
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '3ch' }} align="center">
                                        {product.availableQuantity}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                <Box sx={{display: 'none', width: '100%', flexDirection: 'column', gap: '5px'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, padding: '10px'}}>
                        <Box sx={{ width: '100%' }}>
                            <Typography sx={{fontWeight: 400, textTransform: 'uppercase', fontSize: '3ch'}}>
                                Prodotto
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100px', alignItems: 'center' }}>
                            <Typography sx={{fontWeight: 400, textTransform: 'uppercase', fontSize: '2ch'}}>
                                Iniziale
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100px', alignItems: 'center' }}>
                            <Typography component="div" sx={{fontWeight: 400, textTransform: 'uppercase', fontSize: '2ch', width: '24ch'}}>
                                Venduto
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100px', alignItems: 'center' }}>
                            <Typography component="div" sx={{fontWeight: 400, textTransform: 'uppercase', fontSize: '2ch', width: '24ch'}}>
                                Da Vendere
                            </Typography>
                        </Box>
                    </Box>

                {products.map((product: MonitorProductView, idx: number) => {
                    return (
                        <Box key={idx} sx={{display: 'flex', padding: '10px', gap: 2,
                            backgroundColor: productBackGroundColor(product.availableQuantity, idx)}}>
                            <Box sx={{ width: '100%', alignItems: 'center' }}>
                                <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '3ch', width: '80%'}}>
                                    {product.name}
                                </Typography>
                            </Box>
                            <Box sx={{ width: '100px', alignItems: 'center' }}>
                                <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '3ch'}}>
                                    {product.initialQuantity}
                                </Typography>
                            </Box>
                            <Box sx={{ width: '100px', alignItems: 'center' }}>
                                <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '3ch'}}>
                                    {product.initialQuantity-product.availableQuantity}
                                </Typography>
                            </Box>
                            <Box sx={{ width: '100px', alignItems: 'center' }}>
                                <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '3ch'}}>
                                    {product.availableQuantity}
                                </Typography>
                            </Box>
                        </Box>
                    )
                })}
                </Box>
            </Paper>

    )
}

export default MonitorView