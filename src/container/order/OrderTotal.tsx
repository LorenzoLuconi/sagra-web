import { Order, OrderedProduct } from "../../api/sagra/sagraSchemas.ts";
import { Box, Container, Paper, Typography } from "@mui/material";
import { currency } from "../../utils";

export interface IOrderEdit {
  order: Order;
}

const OrderTotal = (props: IOrderEdit) => {
  const { order } = props;

  const total = () => {
    // TODO trasformiamo il ServiceCost in costo unitario non totale?
    let t: number = order.serviceCost??0;

    order.products.forEach((p: OrderedProduct) => {
      t = t + (p.quantity * p.price);
    });
    console.log("Total:" + t);

    return t;
  };

  return (
    <Paper sx={{ p: 1, mt: 1}}>
      <Typography sx={{ fontSize: '0.8em'}}>Totale Ordine</Typography>
      <Container sx={{textAlign: 'center'}}>
        <Typography sx={{ fontWeight: 700, fontSize: '2.2em', justifyContent: 'center'}}>{currency(total())}</Typography>
      </Container>
    </Paper>
  );
};

export default OrderTotal;
