import * as React from "react";
import { ordersSearchQuery } from "../api/sagra/sagraComponents.ts";
import { convertDate, currency, getQueryObj, TIME_CONF } from "../utils";
import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Order, OrderedProduct } from "../api/sagra/sagraSchemas.ts";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  EditOutlined,
  PrintOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import TakeAwayIcon from "../icons/TakeAwayIcon.tsx";
import { ProductName } from "./ProductName.tsx";



interface OrderRowI {
  order: Order;
}

const OrderRow: React.FC<OrderRowI> = (props) => {
  const { order } = props;
  const [open, setOpen] = React.useState(false);
  const createdDate = order.created ? new Date(order.created) : new Date();
  return (
    <>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" }, backgroundColor: "#efefef" }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          {order.takeAway ? <TakeAwayIcon color={"info"} /> : <></>}
        </TableCell>
        <TableCell align="center">{order.id}</TableCell>
        <TableCell align="center">{convertDate("it", createdDate)}</TableCell>
        <TableCell align="center">
          {convertDate("it", createdDate, TIME_CONF)}
        </TableCell>
        <TableCell>{order.customer}</TableCell>
        <TableCell align="center">
          {order.discountRate ? order.discountRate + "%" : ""}
        </TableCell>
        <TableCell align="right">{currency(order.totalAmount)}</TableCell>
        <TableCell align="center">
          <IconButton disabled>
            <PrintOutlined />
          </IconButton>
          <IconButton disabled>
            <EditOutlined />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Prodotti Ordinati
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Prodotto</TableCell>
                    <TableCell align="center">Quantità</TableCell>
                    <TableCell align="right">Costo</TableCell>
                    <TableCell align="right">SubTotale</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.products.map(
                    (product: OrderedProduct, idx: number) => {
                      const subTotal = product.price * product.quantity;
                      return (
                        <TableRow key={idx} sx={{ backgroundColor: "#efefef" }}>
                          <TableCell>
                            <ProductName productId={product.productId} />
                          </TableCell>
                          <TableCell align="center">
                            {product.quantity}
                          </TableCell>
                          <TableCell align="right">
                            {currency(product.price)}
                          </TableCell>

                          <TableCell align="right">
                            {currency(subTotal)}
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                  {(() => {
                    if (order.serviceNumber > 0)
                      return (
                        <TableRow sx={{ backgroundColor: "#efefef" }}>
                          <TableCell>Coperti</TableCell>
                          <TableCell align="center">
                            {order.serviceNumber}
                          </TableCell>
                          <TableCell align="right">
                            {currency(order.serviceCost / order.serviceNumber)}
                          </TableCell>
                          <TableCell align="right">
                            {currency(order.serviceCost)}
                          </TableCell>
                        </TableRow>
                      );
                    else return;
                  })()}

                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography sx={{ fontWeight: 700 }}>Totale</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 700 }}>
                        {currency(order.totalAmount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Orders = (): React.ReactElement => {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const searchObj = getQueryObj(search, {
    customer: "string",
    username: "string",
    created: "string",
    page: "number",
    size: "number",
    sort: "string",
  });

  const ordersConf = ordersSearchQuery({ queryParams: searchObj });

  const ordersData = useQuery({
    queryKey: ordersConf.queryKey,
    queryFn: ordersConf.queryFn,
  });

  if (ordersData.isFetched) {
    console.log("Orders: ", ordersData.data);
    const orders = ordersData.data;
    return (
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell></TableCell>
              <TableCell align="center">#</TableCell>
              <TableCell align="center">Data</TableCell>
              <TableCell align="center">Ora</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell align="center">Sconto</TableCell>
              <TableCell align="right">Totale</TableCell>
              <TableCell align="center">
                <SettingsOutlined />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders &&
              orders.map((o: Order, idx: number) => (
                <OrderRow key={idx} order={o} />
              ))}

            {orders === undefined && <span>Empty</span>}
          </TableBody>
        </Table>
      </TableContainer>
    );

    //return <span>Orders</span>
  }

  if (ordersData.isError) {
    return <span>Error</span>;
  }

  return <span>Loading...</span>;
};

export const TakeAway = (props) => {
  return (
    <img
      src={"/public/take-away.svg"}
      alt={"Asporto"}
      style={{ height: "30px", width: "auto", ...props }}
    />
  );
};
export default Orders;