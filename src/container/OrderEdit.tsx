import * as React from "react";
import { orderByIdQuery } from "../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import OrderEditForm from "./OrderEditForm.tsx";

const OrderEdit = () => {

  const params = useParams()
  const orderId: number = params.orderId ? + (params.orderId) : 0

  const orderConf = orderByIdQuery({
    pathParams: { orderId: orderId },
  });

  const orderData = useQuery({
    queryKey: orderConf.queryKey,
    queryFn: orderConf.queryFn,
    staleTime: 1000 * 60,
  });

  if (orderData.isFetched) {
    const order = orderData.data;

    if (order) {
      return ( <OrderEditForm order={order} /> )
      // return <span>Order Edit</span>
    }
    return <></>
  }

  if (orderData.isError) {
    return <>Error</>;
  }
};


export default OrderEdit;