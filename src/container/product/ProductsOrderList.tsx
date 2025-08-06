// import React from 'react'

import {
    Alert,
    Box, CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import { Product } from "../../api/sagra/sagraSchemas.ts";
import { currency } from "../../utils";
import ProductQuantity from "./ProductQuantity.tsx";
import { IProductsOrder } from "./IProductsOrder.tsx";
import {productBackgroundColor, productAvailable} from "./produtils.ts";
import {productsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";

const ProductsOrderList = (props: IProductsOrder) => {
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

    const products = productsQuery.data;

  return (
        <Table size={'small'}>
          <TableHead>
            <TableRow>
              <TableCell>Nome Prodotto</TableCell>
              <TableCell sx={{ width: 100 }} align="right">
                Prezzo
              </TableCell>
              <TableCell sx={{ width: 100 }}>Quantità</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            <>
            {products.map((product: Product) => {
              return (
                <TableRow hover={productAvailable(product)}
                  key={product.id}
                  sx={(theme) => ({
                    minWidth: 200,
                    cursor: productAvailable(product) ? 'pointer' : 'default',
                    backgroundColor: productBackgroundColor(product, theme)
                  })}
                  onClick={() => {
                    if ( productAvailable(product) )
                      addToOrder(product)
                  }}
                >
                  <TableCell sx={{ fontSize: "1.0em" }}>
                    {product.name}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: "1.0em" }}>
                    {currency(product.price)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.0em" }}>
                    <ProductQuantity product={product} />
                  </TableCell>
                </TableRow>
              );
            })}
            </>
          </TableBody>
        </Table>
    );
}





export default ProductsOrderList;
