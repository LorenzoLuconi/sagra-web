import { orderByIdQuery } from "../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import OrderEditForm from "./OrderEditForm.tsx";
import { Grid, Paper } from "@mui/material";

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
  });

  if (orderData.isFetched) {
    const order = orderData.data;

    return (
      <Grid container spacing={2}>
        <Grid size={8}>Elenco Prodotti</Grid>
        <Grid size={4}>
          <Paper sx={{padding: 2, }}>
            <OrderEditForm order={order} />
          </Paper>
        </Grid>
      </Grid>
    );

    return <></>;
  }

  if (orderData.isError) {
    return <>Error</>;
  }
};

export default OrderEdit;