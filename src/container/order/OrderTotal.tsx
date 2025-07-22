import {Order, OrderedProduct} from "../../api/sagra/sagraSchemas.ts";
import {Container, Paper, Typography} from "@mui/material";
import {currency} from "../../utils";
import {useOrderStore} from "../../context/OrderStore.tsx";

export interface IOrderEdit {
  order: Order;
}

const OrderTotal = (props: IOrderEdit) => {

  const {order} = useOrderStore()

    console.log('OrderTotal: ', order)

  const total = () => {
    let t = 0
    // TODO trasformiamo il ServiceCost in costo unitario non totale?

   if (order !== undefined) {
       if (!order.takeAway) {
           t = order.serviceCost * order.serviceNumber;
       }



    order.products.forEach((p: OrderedProduct | undefined) => {
        if (p !== undefined) {
            t = t + (p.quantity * p.price);
        }
     });

   }
    console.log('Total: ', t)
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
