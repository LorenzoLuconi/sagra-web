import * as React from 'react'
import {productsSearchQuery} from "../api/sagra/sagraComponents.ts";
import {useLocation} from "react-router";
import {getQueryObj} from "../utils";
import {useQuery} from "@tanstack/react-query";
import {Product} from "../api/sagra/sagraSchemas.ts";

import FullProduct from "./FullProduct.tsx";


const Products = (): React.ReactElement => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const searchObj = getQueryObj(searchParams,{
        courseId: "number",
        /**
         * @format int64
         */
        departmentId: "number",
        /**
         * Ricerca con operatore 'contains'
         */
        name: "string"
    })

    const productsConf = productsSearchQuery({queryParams: searchObj})

    const products = useQuery({
        queryKey: productsConf.queryKey,
        queryFn: productsConf.queryFn
    })


    if (products.isFetched) {
        const productsData = products.data
        console.log('Products: ', productsData)
    if (productsData !== undefined) {
        const fullProducts = productsData.map((product: Product, idx) => {
            console.log('Product: ', product)
            return (<FullProduct product={product} key={idx}/>)
        })
        console.log('Products: ', fullProducts)

        return (<>{fullProducts}</>)
    }

        return (<span>Empty Products</span>)
    }

    if (products.isError) {
        return <span>Products Error</span>
    }

    return <span>Loading Products...</span>

}
export default Products