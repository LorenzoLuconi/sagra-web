import * as React from 'react'
import {productsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";
import {Box, Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Typography} from "@mui/material";
import {Product} from "../../api/sagra/sagraSchemas.ts";
import product from "../Product.tsx";
import {useOrderStore} from "../../context/OrderStore.tsx";


interface ProductDepartmentViewI {
    products: Product[]
}

export const ProductDepartmentView: React.FC<ProductDepartmentViewI> = (props) => {
    const {products} = props
    const {addProduct} = useOrderStore()
    return (
        <Box sx={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
            {

                products && products.map((product: Product, idx: number) => {
                    const {sellLocked} = product
                    return (
                        <Card
                            key={idx}
                            sx={{cursor: sellLocked ? 'not-allowed' : 'pointer'}}
                            onClick={() => {
                                if (!sellLocked) {
                                    addProduct(product, 1)
                                    console.log('Selected: ', product)
                                }
                            }}
                        >
                            <CardContent>
                                <Typography sx={{ color: 'text.secondary', fontSize: '0.7em'}}>{'cucina'}</Typography>
                                <Typography sx={{fontWeight: 700, fontSize: '2em', color: sellLocked ? 'text.secondary': 'text.prinary'}}>{product.name}</Typography>
                            </CardContent>
                        </Card>
                    )
                })
            }
        </Box>
    )
}



interface ProductsInDepartmentI {
    departmentId: number
}

const ProductsInDepartment: React.FC<ProductsInDepartmentI> = (props) => {

    const productsConf = productsSearchQuery({queryParams: {departmentId: props.departmentId}})

    const productsData =
        useQuery({queryKey: productsConf.queryKey, queryFn: productsConf.queryFn})

    if (productsData.isFetched) {
        const products = productsData.data

        if (products !== undefined) {
            return <ProductDepartmentView products={products}/>
        }
        return <span>No products</span>
    }

    if (productsData.isError) {
        return <spam>Errore caricamento prodotti per dipartimento</spam>
    }


    return (
        <CircularProgress/>
    )
}
export default ProductsInDepartment