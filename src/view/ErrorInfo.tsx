import * as React from 'react'
import {useOrderStore} from "../context/OrderStore.tsx";
import {Paper, Typography} from "@mui/material";
const ErrorInfo = () => {

    const {errors} = useOrderStore()
    const errorKeys = Object.keys(errors)
    const hasErrors = errorKeys.length > 0

    if (hasErrors) {

        return (

            <Paper
                sx={{
                    p: 1, mt: 1,
                    display: 'flex',
                    gap: '10px',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    backgroundColor: "error.light",
                    color: 'white'
                }}
            >
                {errorKeys.map((eK: string, idx: number) => {
                    const eMessage = errors[eK]
                    return (
                    <Typography key={idx}>{eMessage}</Typography>
                    )
                })}

            </Paper>

        )
    }
    return <></>

}
export default ErrorInfo