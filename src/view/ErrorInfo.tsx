import * as React from 'react'
import {useOrderStore} from "../context/OrderStore.tsx";
import {Alert, Box} from "@mui/material";
const ErrorInfo = () => {

    const {errors} = useOrderStore()
    const errorKeys = Object.keys(errors)
    const hasErrors = errorKeys.length > 0

    if (hasErrors) {

        return (
            <Box>
                {errorKeys.map((eK: string, idx: number) => {
                    const eMessage = errors[eK]
                    return (
                        <Alert variant="standard" key={idx} severity="error" sx={{margin: '5px'}}>{eMessage}</Alert>
                    )
                })}
            </Box>

        )
    }
    return <></>

}
export default ErrorInfo