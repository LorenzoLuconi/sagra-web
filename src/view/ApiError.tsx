import * as React from 'react'
import {ErrorWrapper} from "../api/sagra/sagraFetcher.ts";
import toast from "react-hot-toast";
import {redirect, useNavigate} from "react-router";
import {useAuth} from "../context/AuthProvider.tsx";
import {Box, Typography} from "@mui/material";
import {Navigate} from "react-router-dom";

interface ApiErrorI {
    error: ErrorWrapper<Error>
}

interface ErrorBoxI {
    errorMessage: string
}

const ErrorBox: React.FC<ErrorBoxI> = (props) => {
    return (
        <Box sx={{display: 'flex', width: '100%'}}>
            <Typography>{props.errorMessage}</Typography>
        </Box>
    )
}


const ApiError: React.FC<ApiErrorI> = (props): React.ReactElement => {
    const {error} = props

    const {setToken} = useAuth()
    const {status,payload}  = error
    toast.error('Si è verificato un errore')
    if (status !== undefined) {
        switch (status) {
            case 401:

                toast.error('Utente non abilitato o sessione scaduta')
                setToken(undefined)
                return <Navigate to={'/'}/>

            default:
                return (<ErrorBox errorMessage={payload}/>)
        }

    }
    return (
        <ErrorBox errorMessage={error as string}/>
    )
}

export default ApiError