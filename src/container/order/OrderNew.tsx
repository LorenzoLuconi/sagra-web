import * as React from "react";
import { useOrderStore } from "../../context/OrderStore.tsx";
import { Order } from "../../api/sagra/sagraSchemas.ts";
import OrderEditContainer  from "./OrderEditContainer.tsx";

const OrderNew = () => {
  const { order, updateOrder } = useOrderStore();

  React.useEffect(() => {
    if (order === undefined) {
      const newOrder: Order = {
        takeAway: false,
        serviceNumber: 0,
        products: [],
      } as Order;
      console.log("UpdateOrder", newOrder);
      updateOrder(newOrder);
    }
  }, []);

  return <OrderEditContainer order={order} />;
};
export default OrderNew;