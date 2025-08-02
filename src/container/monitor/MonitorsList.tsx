import * as React from 'react'
import {Monitor} from "../../api/sagra/sagraSchemas.ts";
import {Box, Card, CardActions, CardContent, IconButton, Typography} from "@mui/material";
import MonitorOutlinedIcon from '@mui/icons-material/MonitorOutlined';
import {AddCircleOutlined, VisibilityOutlined} from '@mui/icons-material';
import {useNavigate} from "react-router";

interface MonitorListProps {
    monitors: Monitor[],
    currentMonitor?: Monitor,
    selectMonitor: (monitor: Monitor) => void
}

const MonitorsList: React.FC<MonitorListProps> = (props) => {
    const {monitors, selectMonitor, currentMonitor} = props
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
                        onClick={() => { selectMonitor(monitor)}}
                    >
                        <CardContent sx={{display: 'flex', width: '150px', height: '90px', flexDirection: 'column', alignItems: 'center'}}>
                            <MonitorOutlinedIcon color={currentMonitor && currentMonitor.id === monitor.id ? "error" : "success"} sx={{fontSize: '4rem'}}/>
                            <Typography sx={{textTransform: 'uppercase', fontWeight: 700, fontSize: '1.2em', textAlign: "center"}}>{monitor.name}</Typography>
                        </CardContent>
                        <CardActions sx={{ display: "flex", justifyContent: "center"}}>
                            <IconButton onClick={() => navigate(`/monitors/${monitor.id}/view`)}><VisibilityOutlined sx={{ fontSize: '1.5em'}}/></IconButton>
                        </CardActions>
                    </Card>
                )
            })}
            <Card variant="outlined" sx={{cursor: 'pointer'}}
                onClick={ () => selectMonitor({ products: [] as number[]} as Monitor)}>
                <CardContent sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100px', height: '150px'}}>
                    <AddCircleOutlined color={currentMonitor && currentMonitor.id === undefined ? "error" : "success" }
                                       sx={{fontSize: '4rem' }}/>
                </CardContent>
            </Card>
        </Box>
    )


}


export default MonitorsList