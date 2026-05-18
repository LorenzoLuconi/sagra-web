import * as React from 'react'
import {CircularProgress} from "@mui/material";
import {createEmptyOrder} from "../../context/OrderStore.tsx";
import OrderEditContainer from "./OrderEditContainer.tsx";
import {useAppConfiguration} from "../../context/AppConfigurationStore.tsx";

const OrderNew = (): React.ReactElement => {
  const configuration = useAppConfiguration();
  const {serviceCost} = configuration.order;
  // TODO commentato, perché non sono sicuro che alla fine serva davvero. Apparentemente funziona
  //const { updateOrder } = useOrderStore();

  // React.useEffect(() => {
  //   updateOrder(EmptyOrder);
  // }, [updateOrder]);

  const order = React.useMemo(() => createEmptyOrder(serviceCost), [serviceCost]);

  if (configuration.isLoading) {
    return <CircularProgress />;
  }

  return <OrderEditContainer order={order} />;
};
export default OrderNew;
