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
  Typography
} from "@mui/material";
import { Product } from "../../api/sagra/sagraSchemas.ts";
import ProductQuantity from "./ProductQuantity.tsx";
import { useState } from "react";
import ProductQuantityUpdateDialog from "./ProductQuantityUpdateDialog.tsx";

interface IProductsQuantityUpdateListProps {
  courseId?: number;
}


const ProductsQuantityUpdateList = (props: IProductsQuantityUpdateListProps) => {

  const [selectedProduct, setSelectedProduct] = useState({ } as Product);



  const resetState = () => {
    setSelectedProduct({ } as Product);
  }

  const handleClick = (product: Product) => {
    setSelectedProduct(product);
  }

  const handleCloseDialog = () => {
    resetState()
  }

  const searchParam = () => {
    const params = {} as ProductsSearchQueryParams;
    if (props.courseId !== undefined) {
      params.courseId = props.courseId;
    }

    params.excludeLinked = true

    return params;
  };

  const productsSearchConf = productsSearchQuery({
    queryParams: searchParam(),
  });

  const productsQuery = useQuery({
    queryKey: productsSearchConf.queryKey,
    queryFn: productsSearchConf.queryFn,
    staleTime: 1000 * 10,
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
        Si è verificato un errore prelevando la lista dei prodotti: {productsQuery.error.message}
      </Alert>
    );
  }

  const products = productsQuery.data;

  if (products) {
    if (products.length < 1) {
      return <Typography>Nessuno prodotto presente</Typography>;
    }

    // FIXME i prodotti bloccati
    return (
      <form>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nome Prodotto</TableCell>
              <TableCell align="center" sx={{ width: 150 }}>Quantità Iniziale</TableCell>
              <TableCell align="center" sx={{ width: 150 }}>Quantità Disponibile</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            <>
              {products.map((product: Product) => {
                return (
                  <TableRow key={product.id} sx={{
                      minWidth: 200,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleClick(product)}>
                    <TableCell sx={{ fontSize: "1.0em" }}>
                      {product.name}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "1.0em" }}>
                      {product.initialQuantity}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "1.0em" }}>
                      <ProductQuantity product={product} />
                    </TableCell>
                  </TableRow>

                );
              })}
            </>
          </TableBody>
        </Table>
        {selectedProduct.id ?
          <ProductQuantityUpdateDialog product={selectedProduct} closeDialogHandler={handleCloseDialog}/>
        : ''}
      </form>
    );
  }
};





export default ProductsQuantityUpdateList;
