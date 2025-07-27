import * as React from "react";
import { EmptyOrder, useOrderStore } from "../../context/OrderStore.tsx";
import OrderEditContainer from "./OrderEditContainer.tsx";

const OrderNew = () => {
  const { order, updateOrder } = useOrderStore();

  React.useEffect(() => {
    updateOrder(EmptyOrder);
  }, [updateOrder]);

  return <OrderEditContainer order={order} />;
};
export default OrderNew;