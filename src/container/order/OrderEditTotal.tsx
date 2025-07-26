import {OrderedProduct} from "../../api/sagra/sagraSchemas.ts";
import {Container, Typography} from "@mui/material";
import {currency} from "../../utils";
import {useOrderStore} from "../../context/OrderStore.tsx";

const OrderEditTotal = () => {

  const {order} = useOrderStore()

    console.log('OrderEditTotal: ', order)

  const total = () => {
    let t = 0
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
    return t;
  };

  return (
    <>
      <Container sx={{textAlign: 'center'}}>
        <Typography sx={{ fontWeight: 700, fontSize: '2.0em', justifyContent: 'center'}}>{currency(total())}</Typography>
      </Container>
    </>
  );
};

export default OrderEditTotal;
