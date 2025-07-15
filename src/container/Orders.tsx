import * as React from "react"
import {ordersSearchQuery} from "../api/sagra/sagraComponents.ts";
import {getQueryObj} from "../utils";
import {useLocation} from "react-router";
import {useQuery} from "@tanstack/react-query";

const Orders = ():React.ReactElement => {
    const location = useLocation()
    const search = new URLSearchParams(location.search)
    const searchObj = getQueryObj(search, {
        customer: 'string',
        username: 'string',
        created: 'string',
        page: 'number',
        size: 'number',
        sort: 'string'
    })

    const ordersConf = ordersSearchQuery({queryParams: searchObj})

    const ordersData = useQuery({
        queryKey: ordersConf.queryKey,
        queryFn: ordersConf.queryFn
    })

    if (ordersData.isFetched) {
        console.log('Orders: ', ordersData.data)

        return <span>Orders</span>

    }


    if (ordersData.isError) {
        return <span>Error</span>
    }

    return (<span>Loading...</span>)


}
export default Orders