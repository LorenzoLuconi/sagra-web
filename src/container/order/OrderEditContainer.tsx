import * as React from "react";
import { useQueries } from "@tanstack/react-query";
import { productByIdQuery } from "../../api/sagra/sagraComponents.ts";
import {Box, CircularProgress, Grid, Paper, Typography, useTheme} from "@mui/material";
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
  const theme = useTheme();

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
  if (combinedQueries.data ) {
    return (
      <OrderStore products={combinedQueries.data} order={order}>
        <Grid container spacing={2}>
          <Grid size={7}>
            <ProductsToOrder />
          </Grid>
          <Grid size={5}>
              <Box sx={{display: 'flex', flexDirection: 'column', position: 'sticky', top: '10px'}}>
            <ErrorInfo />

            {
              order.id > 0 &&
              <Paper variant="outlined"
                     sx={{ p: 0.5, textAlign: 'center', backgroundColor: theme.sagra.panelBackground, filter: 'brightness(85%)' }}
                     className="paper-top">
                <Typography sx={{fontWeight: 500, fontSize: '1.1em'}}>Ordine n. {order.id}</Typography>
              </Paper>
            }

            <Paper variant="outlined"
                   sx={{ p: 0.5, backgroundColor: theme.sagra.panelBackground }}
                   className="paper-middle">
              <OrderEditTotal />
            </Paper>

            <Paper variant="outlined"
                   sx={{ p: 0.5, backgroundColor: theme.sagra.panelBackground }}
                   className="paper-middle">
              <OrderEditProducts />
            </Paper>

            <Paper
              variant="outlined"
              sx={{ padding: 2, backgroundColor: theme.sagra.panelBackground }}
              className="paper-bottom"
            >
              <OrderEditForm />
            </Paper>
              </Box>
          </Grid>

        </Grid>
      </OrderStore>
    );
  }
};

export default OrderEditContainer;