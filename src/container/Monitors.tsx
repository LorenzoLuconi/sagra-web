import * as React from 'react'
import {monitorSearchQuery} from "../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";
import {CircularProgress} from "@mui/material";
import MonitorsView from "../view/MonitorsView.tsx";

const Monitors = (): React.ReactElement => {

    const monitorsConf = monitorSearchQuery({queryParams: {}})

    const monitorsData = useQuery({
        queryKey: monitorsConf.queryKey,
        queryFn: monitorsConf.queryFn
    })

    if (monitorsData.isFetched) {
        console.log('Monitors: ', monitorsData.data)
        return (
            <MonitorsView monitors={monitorsData.data??[]}/>
        )
    }

    if (monitorsData.isError) {
        return (
            <span>Error</span>
        )
    }


    return (
        <CircularProgress/>
    )
}

export default Monitors