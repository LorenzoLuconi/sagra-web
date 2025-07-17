import * as React from 'react'
import {Monitor} from "../api/sagra/sagraSchemas.ts";
import {Box, Card, CardContent, Typography} from "@mui/material";
import MonitorOutlinedIcon from '@mui/icons-material/MonitorOutlined';
import {useNavigate} from "react-router";

interface MonitorsViewI {
    monitors: Monitor[]
}

const MonitorsView: React.FC<MonitorsViewI> = (props) => {
    const {monitors} = props
    const navigate = useNavigate()
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
                        onClick={() => {
                        navigate(`/monitors/${monitor.id}`)
                    }}>
                        <CardContent sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <MonitorOutlinedIcon color={"success"} sx={{fontSize: '4rem'}}/>
                            <Typography sx={{textTransform: 'uppercase', fontWeight: 700, fontSize: '2.5ch'}}>{monitor.name}</Typography>
                        </CardContent>
                    </Card>
                )
            })}
        </Box>
    )


}
export default MonitorsView