import * as React from 'react'
import {Monitor} from "../../api/sagra/sagraSchemas.ts";
import {Box, Card, CardContent, Typography} from "@mui/material";
import MonitorOutlinedIcon from '@mui/icons-material/MonitorOutlined';
import { AddCircleOutlined } from '@mui/icons-material';

interface MonitorListProps {
    monitors: Monitor[]
    selectMonitor: (monitor: Monitor) => void
}

const MonitorsList: React.FC<MonitorListProps> = (props) => {
    const {monitors, selectMonitor} = props


    return (
        <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center'
        }}
        >
            {monitors.map((monitor: Monitor, idx: number) => {
                return (
                    <Card
                        variant="outlined"
                        key={idx}
                        sx={{cursor: 'pointer'}}
                        onClick={() => { selectMonitor(monitor)}}
                    >
                        <CardContent sx={{display: 'flex', width: '80px', height: '110px', flexDirection: 'column', alignItems: 'center'}}>
                            <MonitorOutlinedIcon color={"success"} sx={{fontSize: '4rem'}}/>
                            <Typography sx={{textTransform: 'uppercase', fontWeight: 700, fontSize: '2.5ch'}}>{monitor.name}</Typography>
                        </CardContent>
                    </Card>
                )
            })}
            <Card variant="outlined" sx={{cursor: 'pointer'}}
                onClick={ () => selectMonitor({ products: [] as number[]} as Monitor)}>
                <CardContent sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '110px'}}>
                    <AddCircleOutlined color={"success"} sx={{fontSize: '4rem'}}/>
                </CardContent>
            </Card>
        </Box>
    )


}


export default MonitorsList