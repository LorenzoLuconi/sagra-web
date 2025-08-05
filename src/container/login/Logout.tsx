import * as React from 'react'
import {useApplicationStore} from "../../context/ApplicationStore.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";
import {Typography} from "@mui/material";

const Logout = (): React.ReactElement => {
    const {set} = useApplicationStore()
    const {setToken} = useAuth()
    React.useEffect(() => {
        window.location.pathname = '/'
        set('username', undefined)
        setToken(undefined)

    }, [])

    return (
        <Typography>Logount</Typography>
    )
}
export default Logout