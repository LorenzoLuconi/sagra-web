import * as React from 'react'
import {EmptyOrder} from "../../context/OrderStore.tsx";
import OrderEditContainer from "./OrderEditContainer.tsx";

const OrderNew = (): React.ReactElement => {
  // TODO commentato, perché non sono sicuro che alla fine serva davvero. Apparentemente funziona
  //const { updateOrder } = useOrderStore();

  // React.useEffect(() => {
  //   updateOrder(EmptyOrder);
  // }, [updateOrder]);

  return <OrderEditContainer order={EmptyOrder} />;
};
export default OrderNew;