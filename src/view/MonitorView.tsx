import * as React from "react"
import {MonitorProductView, MonitorView} from "../api/sagra/sagraSchemas.ts";
import {Box, Paper, Typography} from "@mui/material";
import {convertDate, TIME_CONF} from "../utils";


interface MonitorVI {
    monitor: MonitorView
}

const MonitorV: React.FC<MonitorVI> = (props) => {
    const {monitor} = props
    const lastUpdate = monitor.lastUpdate ? new Date(monitor.lastUpdate) : new Date()
    const products = monitor.products ?? [] as MonitorProductView[]
    return (

            <Paper sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '93vh', padding: '20px', gap: '20px'}}>

                <Box sx={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '5ch'}}>{monitor.name}</Typography>
                    <Typography sx={{fontWeight: 700, textTransform: 'uppercase', fontSize: '5ch'}}>{convertDate('it', lastUpdate, TIME_CONF)}</Typography>
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

export default MonitorV