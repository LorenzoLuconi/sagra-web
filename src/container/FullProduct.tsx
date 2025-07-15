import {Product} from "../api/sagra/sagraSchemas.ts";
import * as React from "react";
import {courseByIdQuery, departmentByIdQuery} from "../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";
import ProductView from "../view/ProductView.tsx";

interface FullProductI {
    product: Product
}

const FullProduct: React.FC<FullProductI> = (props) => {
    const {product} = props
    const {courseId, departmentId} = product

    const courseConf = courseByIdQuery({pathParams: {id: courseId??0}})
    const departmentConf = departmentByIdQuery({pathParams: {departmentId: departmentId??0}})

    const courseData = useQuery({queryKey: courseConf.queryKey, queryFn: courseConf.queryFn})
    const departmentData = useQuery({queryKey: departmentConf.queryKey, queryFn: departmentConf.queryFn})

    console.log('FullProduct: ', courseData, departmentData)


    if (courseData.isFetched && departmentData.isFetched) {

        console.log('FullProduct: ', courseData.data, departmentData.data)

        return <ProductView product={product} course={courseData.data?? {}} department={departmentData.data??{}}/>

        // return <span>FullProduct</span>
    }

    if (courseData.isError || departmentData.isError) {
        return (<span>Pork.. errore!</span>)
    }


    return (
        <span>Loading info...</span>
    )
}
export default FullProduct