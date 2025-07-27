import * as React from "react";

import { orderByIdQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import OrderEditContainer from "./OrderEditContainer.tsx";


const OrderEdit = () => {

  const params = useParams();
  const orderId: number = params.orderId ? +params.orderId : 0;

  const orderConf = orderByIdQuery({
    pathParams: { orderId: orderId },
  });

  const orderData = useQuery({
    queryKey: orderConf.queryKey,
    queryFn: orderConf.queryFn,
    staleTime: 1000 * 60,
    enabled: orderId > 0,
  });

  if (orderData.isFetched) {
    const order = orderData.data;

    if (order) {
      return <OrderEditContainer order={order} />;
    }
    return <>Errore, ordine vuoto</>;
  }

  if (orderData.isError) {
    return <>Errore prelevamento ordine</>;
  }

  return <CircularProgress />;
};

export default OrderEdit;