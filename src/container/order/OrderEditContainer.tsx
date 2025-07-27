import * as React from "react";
import { useQueries } from "@tanstack/react-query";
import { productByIdQuery } from "../../api/sagra/sagraComponents.ts";
import { CircularProgress, Grid, Paper } from "@mui/material";
import { OrderStore } from "../../context/OrderStore.tsx";
import ProductsToOrder from "./ProductsToOrder.tsx";
import ErrorInfo from "../../view/ErrorInfo.tsx";
import OrderEditTotal from "./OrderEditTotal.tsx";
import OrderEditProducts from "./OrderEditProducts.tsx";
import OrderEditForm from "./OrderEditForm.tsx";
import { Order } from "../../api/sagra/sagraSchemas.ts";

interface OrderEditContainerProps {
  order: Order;
}

 const OrderEditContainer: React.FC<OrderEditContainerProps> = (props) => {
  const { order } = props;

  const combinedQueries = useQueries({
    queries: order.products.map((product) => {
      const productConf = productByIdQuery({
        pathParams: { productId: product.productId }
      });
      return {
        queryKey: productConf.queryKey,
        queryFn: productConf.queryFn
      };
    }),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending)
      };
    }
  });

  if (combinedQueries.pending) {
    return <CircularProgress />;
  }
  if (combinedQueries.data) {
    return (
      <OrderStore products={combinedQueries.data} order={order}>
        <Grid container spacing={2}>
          <Grid size={7}>
            <ProductsToOrder />
          </Grid>
          <Grid size={5}>
            <ErrorInfo />

            <Paper variant="outlined" sx={{ p: 0.5 }} className="paper-top">
              <OrderEditTotal />
            </Paper>

            <Paper variant="outlined" sx={{ p: 0.5 }} className="paper-middle">
              <OrderEditProducts products={order?.products ?? []} />
            </Paper>

            <Paper
              variant="outlined"
              sx={{ padding: 2 }}
              className="paper-bottom"
            >
              <OrderEditForm order={order} update={true} />
            </Paper>
          </Grid>
        </Grid>
      </OrderStore>
    );
  }
};

export default OrderEditContainer;