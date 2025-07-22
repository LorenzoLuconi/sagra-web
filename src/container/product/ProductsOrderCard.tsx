// import React from 'react'

import { useQuery } from "@tanstack/react-query";
import {
  productsSearchQuery,
  ProductsSearchQueryParams,
} from "../../api/sagra/sagraComponents.ts";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Product } from "../../api/sagra/sagraSchemas.ts";
import { currency } from "../../utils";
import { IProductsOrder, productAvailable } from "./IProductsOrder.tsx";
import ProductQuantity from "./ProductQuantity.tsx";

const ProductsOrderCard = (props : IProductsOrder) => {

  const searchParam = () => {
    const params = {} as ProductsSearchQueryParams;
    if ( props.courseId !== undefined ) {
      params.courseId = props.courseId;
    }

    return params;
  }

  const productsSearchConf = productsSearchQuery({
    queryParams: searchParam()
  });

  const productsQuery = useQuery({
    queryKey: productsSearchConf.queryKey,
    queryFn: productsSearchConf.queryFn,
    staleTime: 1000 * 10
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

  const products = productsQuery.data;

  if (products) {
    if (products.length < 1) {
      return <Typography>Nessuno prodotto presente</Typography>
    }

    return (
      <form>
        <Box sx={{display: "flex", flexWrap: "wrap", gap: 2, rowGap: 2, mt: 2 }} >
          <>
          {
            products.map( (product: Product) =>
              <Card key={product.id}
                    sx={(theme) => ({
                      minWidth: 200,
                      cursor: productAvailable(product) ? 'pointer' : 'default',
                      backgroundColor: productAvailable(product) ? theme.palette.background.paper : 'grey.300'
                    })}
                    onClick={() => {
                      if ( productAvailable(product) )
                        props.addToOrder(product)}
                    }>
                <CardContent sx={{textAlign: 'center'}}>
                  <Typography sx={{fontWeight: 500}}>{product.name}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5}}>
                    <Typography>{currency(product.price)}</Typography>
                    <Typography><ProductQuantity product={product}/></Typography>
                  </Box>
                </CardContent>
              </Card>
            )
          }
          </>
        </Box>
      </form>
    )
  }
}

export default ProductsOrderCard;
