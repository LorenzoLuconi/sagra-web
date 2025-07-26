import * as React from 'react'

import {orderByIdQuery, productByIdQuery} from "../../api/sagra/sagraComponents.ts";
import {useQueries, useQuery} from "@tanstack/react-query";
import {useParams} from "react-router";
import OrderEditForm from "./OrderEditForm.tsx";
import { CircularProgress, Grid, Paper } from "@mui/material";
import OrderEditProducts from "./OrderEditProducts.tsx";
import OrderEditTotal from "./OrderEditTotal.tsx";
import {OrderStore, useOrderStore} from "../../context/OrderStore.tsx";
import {Order} from "../../api/sagra/sagraSchemas.ts";
import ProductsToOrder from "./ProductsToOrder.tsx";
import ErrorInfo from "../../view/ErrorInfo.tsx";


interface OrderFormI {
  order: Order
}

const OrderForm: React.FC<OrderFormI> = (props) => {
  const {order} = props


  const combinedQueries = useQueries({
        queries: order.products.map((product) => {
          const productConf =
              productByIdQuery({pathParams: {productId: product.productId}})
          return {
            queryKey: productConf.queryKey,
            queryFn: productConf.queryFn
          }
        }
      ),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending),
      }
    },
  })

  if (combinedQueries.pending) {
    return <CircularProgress/>
  }
  if (combinedQueries.data) {

    return (
        <OrderStore products={combinedQueries.data} order={order}>
            <Grid container spacing={2}>
              <Grid size={7}>
                <ProductsToOrder/>
              </Grid>
              <Grid size={5}>
                <ErrorInfo/>

                <Paper variant="outlined" sx={{ p: .5}} className="paper-top">
                 <OrderEditTotal />
                </Paper>

                <Paper variant="outlined" sx={{ p: 0.5}} className="paper-middle">
                  <OrderEditProducts products={order?.products ?? []}/>
                </Paper>

                <Paper variant="outlined" sx={{padding: 2 }} className="paper-bottom">
                  <OrderEditForm order={order} update={true}/>
                </Paper>

              </Grid>

            </Grid>
        </OrderStore>
    )
  }
}


const OrderEdit = () => {

  const {updateOrder} = useOrderStore()

  const params = useParams();
  const orderId: number = params.orderId ? +params.orderId : 0;

  const orderConf = orderByIdQuery({
    pathParams: {orderId: orderId},
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
            <OrderForm order={order}/>
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