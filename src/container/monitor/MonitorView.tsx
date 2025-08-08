import * as React from "react"
import {MonitorProductView} from "../../api/sagra/sagraSchemas.ts";
import {
    Alert,
    Box,
    CircularProgress,
    Paper,
    Typography,
    useTheme
} from "@mui/material";
import {convertDate, TIME_CONF} from "../../utils";
import {useParams} from "react-router";
import {monitorViewQuery} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";



const StyleHeader : React.CSSProperties = {
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: '5ch'
}

const StyleTitle : React.CSSProperties = {
    fontWeight: 400,
    textTransform: 'uppercase',
    fontSize: '2ch',
    padding: '1ch'
}

const StyleRow : React.CSSProperties = {
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: '3ch',
    padding: '1ch'
}
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

            <Paper sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '93vh', padding: '20px', gap: '20px', fontFamily: 'Roboto'}}>

                <Box sx={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography sx={{...StyleHeader}}>{monitor.name}</Typography>
                    <Typography sx={{...StyleHeader}}>{convertDate('it', new Date(monitor.lastUpdate), TIME_CONF)}</Typography>
                </Box>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr>
                                <th align="left" style={{...StyleTitle}}>Prodotto</th>
                                <th align="center" style={{ ...StyleTitle, width: "8vw"}}>Iniziale</th>
                                <th align="center" style={{ ...StyleTitle, width: "8vw"}}>Venduto</th>
                                <th align="center" style={{ ...StyleTitle, width: "8vw" }}>Vendibile</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product: MonitorProductView, idx: number) => {
                            return (
                                <tr key={idx} style={{ backgroundColor: productBackGroundColor(product.availableQuantity, idx) }}>
                                    <td style={{ ...StyleRow }}>
                                        {product.name}
                                    </td>
                                    <td style={{ ...StyleRow }} align="center">
                                        {product.initialQuantity}
                                    </td>
                                    <td style={{ ...StyleRow }} align="center">
                                        {product.initialQuantity-product.availableQuantity}
                                    </td>
                                    <td style={{ ...StyleRow }} align="center">
                                        {product.availableQuantity}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </Paper>

    )
}

export default MonitorView