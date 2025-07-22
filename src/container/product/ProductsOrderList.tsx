// import React from 'react'

import { useQuery } from "@tanstack/react-query";
import {
  productsSearchQuery,
  ProductsSearchQueryParams,
} from "../../api/sagra/sagraComponents.ts";
import {
  Alert,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Product } from "../../api/sagra/sagraSchemas.ts";
import { currency } from "../../utils";
import ProductQuantity from "./ProductQuantity.tsx";
import { IProductsOrder } from "./IProductsOrder.tsx";

const ProductsList = (props: IProductsOrder) => {
  const searchParam = () => {
    const params = {} as ProductsSearchQueryParams;
    if (props.courseId !== undefined) {
      params.courseId = props.courseId;
    }

    return params;
  };

  const productsSearchConf = productsSearchQuery({
    queryParams: searchParam(),
  });

  const productsQuery = useQuery({
    queryKey: productsSearchConf.queryKey,
    queryFn: productsSearchConf.queryFn,
  });

  if (productsQuery.isLoading) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (productsQuery.isError) {
    return (
      <Alert severity="error">
        Si è verificato un errore prelevando la lista degli sconti:{" "}
        {productsQuery.error.message}
      </Alert>
    );
  }

  const products = productsQuery.data;

  if (products) {
    if (products.length < 1) {
      return <Typography>Nessuno prodotto presente</Typography>;
    }

    return (
      <form>
        <Table>
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
            {products.map((product: Product) => {
              return (
                <TableRow
                  key={product.id}
                  sx={{ cursor: "pointer" }}
                  onClick={() => props.addToOrder(product)}
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
          </TableBody>
        </Table>
      </form>
    );
  }
};



export default ProductsList;
