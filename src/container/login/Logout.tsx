import * as React from 'react'
import {useApplicationStore} from "../../context/ApplicationStore.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";
import {Box, Typography} from "@mui/material";
import {Logo} from "../../layout/Logo.tsx";

const Logout = (): React.ReactElement => {
    const {set} = useApplicationStore()
    const {setToken} = useAuth()
    React.useEffect(() => {
        window.location.pathname = '/'
        set('username', undefined)
        set('roles', undefined)
        setToken(undefined)

    }, [])

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', alignItems: 'center', justifyContent:'center', gap: 10}}>
            <Logo sx={{width:'100px',  height:'100px', color: '#5f5f5f'}}/>
            <Typography sx={{fontSize: '2rem', fontWeight: 200, color: '#5f5f5f'}}> Sto completando il logout</Typography>
        </Box>
    )
}
export default Logout