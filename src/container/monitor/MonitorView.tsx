import * as React from "react"
import {MonitorProductView} from "../../api/sagra/sagraSchemas.ts";
import {Alert, Box, CircularProgress, Paper, Typography} from "@mui/material";
import {convertDate, TIME_CONF} from "../../utils";
import {useParams} from "react-router";
import {monitorViewQuery} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";


const MonitorView: React.FC = () => {

    const params = useParams()
    const monitorId: number = params.monitorId ? +(params.monitorId) : 0

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

    return (

            <Paper sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '93vh', padding: '20px', gap: '20px'}}>

                <Box sx={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '5ch'}}>{monitor.name}</Typography>
                    <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '5ch'}}>{convertDate('it', new Date(monitor.lastUpdate), TIME_CONF)}</Typography>
                </Box>
                <Box sx={{display: 'flex', width: '100%', flexDirection: 'column', gap: '5px'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', padding: '10px'}}>
                        <Typography sx={{fontWeight: 400, textTransform: 'uppercase', fontSize: '3ch'}}>
                            Prodotto
                        </Typography>
                        <Typography sx={{fontWeight: 400, textTransform: 'uppercase', fontSize: '3ch'}}>
                            Quantità
                        </Typography>
                    </Box>

                {products.map((product: MonitorProductView, idx: number) => {
                    return (
                        <Box key={idx} sx={{display: 'flex', justifyContent: 'space-between', backgroundColor: (idx%2==0?'#efefef': 'transparent'), padding: '10px'}}>
                            <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '3ch'}}>
                                {product.name}
                            </Typography>
                            <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '3ch'}}>
                                {`${product.availableQuantity}/${product.initialQuantity}`}
                            </Typography>
                        </Box>
                    )
                })}
                </Box>
            </Paper>

    )
}

export default MonitorView