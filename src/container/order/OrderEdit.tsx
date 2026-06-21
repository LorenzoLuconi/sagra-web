import * as React from "react";
import { OrderByIdError, orderByIdQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Alert, CircularProgress } from "@mui/material";
import OrderEditContainer from "./OrderEditContainer.tsx";

const isOrderByIdError = (error: unknown): error is OrderByIdError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 404
  );
};

const OrderEdit = (): React.ReactElement => {
  const params = useParams();
  const orderId: number = params.orderId ? +params.orderId : 0;

  const orderConf = orderByIdQuery({
    pathParams: { orderId: orderId },
  });

  const orderData = useQuery({
    queryKey: orderConf.queryKey,
    queryFn: orderConf.queryFn,
    enabled: orderId > 0,
  });

  if (orderData.isError) {
    const error = orderData.error;
    console.log(error);
    if (isOrderByIdError(error)) {
      return (
        <Alert severity="error">
          Ordine con id {params.orderId} non trovato
        </Alert>
      );
    }
    // if ( error.status === 404) {
    //   return (
    //     <Alert severity="error">
    //       Ordine con id {params.orderId} non trovato
    //     </Alert>
    //   );
    // }
    /*
    return (
      <Alert severity="error">
        Si è verificato un errore prelevando l'ordine
      </Alert>
    );

 */
  }

  if (orderData.isPending) {
    return <CircularProgress />;
  }

  const order = orderData.data;

  if (order) {
    return <OrderEditContainer order={order} />;
  }

  return (
    <Alert severity="error">
      Si è verificato un errore prelevando l'ordine: ordine vuoto
    </Alert>
  );
};

export default OrderEdit;
