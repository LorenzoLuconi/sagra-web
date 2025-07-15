import * as React from 'react'
import {Course, Department, Product} from "../api/sagra/sagraSchemas.ts";
import {Box, Card, CardContent, Typography} from "@mui/material";


interface ProductViewI {
    product: Product
    course: Course
    department: Department
}

const ProductView: React.FC<ProductViewI> = (props) => {
    const {product, course, department} = props

    const card = (
        <>
            <CardContent>
                <Typography>{product.name}</Typography>
            </CardContent>
        </>
    )


    return (
        <Box sx={{ minWidth: 275 }}>
            <Card variant="outlined">{card}</Card>
        </Box>
    )

}

export default ProductView