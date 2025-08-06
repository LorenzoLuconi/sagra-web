import {productsSearchQuery, ProductsSearchQueryParams} from "../../api/sagra/sagraComponents.ts";
import {Product} from "../../api/sagra/sagraSchemas.ts";
import {useQuery} from "@tanstack/react-query";
import {Alert, Box, CircularProgress} from "@mui/material";
import ProductsOrderCard from "./ProductsOrderCard.tsx";
import ProductsOrderList from "./ProductsOrderList.tsx";


export type prodOrderType = 'card' | 'list'

export interface ProductsOrderProps {
    searchParam: ProductsSearchQueryParams
    addToOrder(product: Product): void;
    type: prodOrderType
}

const ProductsOrder : React.FC<ProductsOrderProps> = (props: ProductsOrderProps) => {

    const {searchParam, addToOrder} = props;

    const productsSearchConf = productsSearchQuery({
        queryParams: searchParam,
    });

    const productsQuery = useQuery({
        queryKey: productsSearchConf.queryKey,
        queryFn: productsSearchConf.queryFn,
    });

    if (productsQuery.isLoading) {
        return ( <Box sx={{ display: "flex" }}>
                <CircularProgress />
            </Box>
        )
    }

    if (productsQuery.isError) {
        return <Alert severity="error">Si è verificato un errore prelevando la lista dei prodotti: {productsQuery.error.message}</Alert>
    }


    if (! productsQuery.data || productsQuery.data.length < 1 ) {
        return <Alert severity="warning">Nessuno prodotto presente</Alert>
    }


    if ( props.type === 'card')
        return <ProductsOrderCard addToOrder={addToOrder} products={productsQuery.data}/>
    else
        return <ProductsOrderList addToOrder={addToOrder} products={productsQuery.data}/>
}

export default ProductsOrder