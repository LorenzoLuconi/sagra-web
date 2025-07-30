import {OrderedProduct} from "../../api/sagra/sagraSchemas.ts";
import {Container, Typography} from "@mui/material";
import {currency} from "../../utils";
import {useOrderStore} from "../../context/OrderStore.tsx";

const OrderEditTotal = () => {

  const {order} = useOrderStore()

  const total = () => {
    let t = 0;
    if (order.serviceNumber) {
      t = order.serviceCost * order.serviceNumber;
    }

    order.products.forEach((p: OrderedProduct) => {
      t = t + p.quantity * p.price;
    });

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
