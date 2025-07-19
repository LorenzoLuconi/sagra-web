import { orderByIdQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";
import { Form, useParams } from "react-router";
import OrderEditForm from "./OrderEditForm.tsx";
import { CircularProgress, Grid, Paper } from "@mui/material";
import OrderedProductsEdit from "./OrderedProductsEdit.tsx";
import { useState } from "react";
import { Order, OrderedProductRequest } from "../../api/sagra/sagraSchemas.ts";
import OrderTotal from "./OrderTotal.tsx";
import ProductToOrderDepartments from "./ProductsToOrderDepartments.tsx";


const OrderEdit = () => {
  const params = useParams();
  const orderId: number = params.orderId ? + params.orderId : 0;

  const orderConf = orderByIdQuery({
    pathParams: { orderId: orderId },
  });

  const orderData = useQuery({
    queryKey: orderConf.queryKey,
    queryFn: orderConf.queryFn,
    staleTime: 1000 * 60,
    enabled: orderId > 0
  });

  if (orderData.isFetched) {
    const order = orderData.data;

    if (order) {
      return (
        <form>
          <Grid container spacing={2}>
            <Grid size={7}><ProductToOrderDepartments /></Grid>
            <Grid size={5}>
              <OrderEditForm order={order} />
              <OrderTotal order={order} />
              <OrderedProductsEdit products={order.products} />
            </Grid>
          </Grid>
        </form>
      )
    }
    return <>Errore, ordine vuoto</>;
  }

  if (orderData.isError) {
    return <>Errore prelevamento ordine</>;
  }

  return <CircularProgress />
};

export default OrderEdit;