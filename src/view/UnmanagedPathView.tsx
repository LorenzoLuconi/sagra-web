import * as React from 'react'
import {Paper, Typography} from "@mui/material";
import {useLocation} from "react-router";


const UnmanagedPathView = () => {
    const location = useLocation()
    return (
        <Paper sx={{padding: '10px', backgroundColor: '#d32f2f', color: 'white'}}>
            <Typography sx={{fontSize: '1.2rem', fontWeight: 700}}>{`Percorso ${location.pathname} non valido`}</Typography>
        </Paper>
    )
}
export default UnmanagedPathView