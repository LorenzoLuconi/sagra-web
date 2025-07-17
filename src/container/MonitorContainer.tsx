import * as React from 'react'
import {useParams} from "react-router";
import {monitorViewQuery} from "../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";
import {Box, CircularProgress} from "@mui/material";
import MonitorV from "../view/MonitorView.tsx";
import {MonitorView } from "../api/sagra/sagraSchemas.ts";

const MonitorContainer = (): React.ReactElement => {

    const params = useParams()
    const monitorId: number = params.id ? +(params.id) : 0
    const monitorConf = monitorViewQuery({pathParams: {monitorId: monitorId}})

    const monitorData = useQuery({
        queryKey: monitorConf.queryKey,
        queryFn: monitorConf.queryFn,
        refetchInterval: 1000*60
    })


    if (monitorData.isFetched) {
        console.log('Monitor: ', monitorData.data)
        return (<MonitorV monitor={monitorData.data??{}as MonitorView}/>)
    }

    if (monitorData.isError) {
        return <span>Error</span>
    }


    return <Box sx={{display: 'flex', justifyContent: 'center'}}><CircularProgress/></Box>

}

export default MonitorContainer