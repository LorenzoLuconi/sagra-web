import { EmptyOrder, useOrderStore } from "../../context/OrderStore.tsx";
import OrderEditContainer from "./OrderEditContainer.tsx";

const OrderNew = () => {
  // TODO commentato, perché non sono sicuro che alla fine serva davvero. Apparentemente funziona
  //const { updateOrder } = useOrderStore();

  // React.useEffect(() => {
  //   updateOrder(EmptyOrder);
  // }, [updateOrder]);

  return <OrderEditContainer order={EmptyOrder} />;
};
export default OrderNew;