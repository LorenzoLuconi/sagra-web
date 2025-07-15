import * as React from 'react'
import {useParams} from "react-router";
import {productByIdQuery} from "../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";
import FullProduct from "./FullProduct.tsx";

interface ProductI {
    productId?: number
}


const Product: React.FC<ProductI> = (props) => {
    const params = useParams()
    const productId = props.productId ?? (params.id !== undefined ? +params.id: 0)
    const productConf = productByIdQuery({pathParams: {productId: productId}})

    const productData = useQuery({
        queryKey: productConf.queryKey,
        queryFn: productConf.queryFn
    })

    if (productData.isFetched) {
        if (productData.data !== undefined) {
            return <FullProduct product={productData.data}/>
        }
        return <span>No Product</span>

    }

    if (productData.isError) {
        return <span>Error</span>
    }

    return (
        <>Loading Product..</>
    )
}

export default Product