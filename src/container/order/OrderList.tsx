import * as React from "react";
import {ordersSearchQuery, OrdersSearchQueryParams } from "../../api/sagra/sagraComponents.ts";
import { convertDate, currency, TIME_CONF } from "../../utils";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box, CircularProgress,
  Collapse,
  IconButton, Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { Order, OrderedProduct } from "../../api/sagra/sagraSchemas.ts";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  CachedOutlined,
  EditOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import TakeAwayIcon from "../../icons/TakeAwayIcon.tsx";
import { ProductName } from "../product/ProductName.tsx";
import {queryClient} from "../../main.tsx";
import toast from "react-hot-toast";



interface OrderRowI {
  order: Order;
}

const OrderRow: React.FC<OrderRowI> = (props) => {
  const { order } = props;
  const [open, setOpen] = React.useState(false);
  const createdDate = order.created ? new Date(order.created) : new Date();
  const navigate = useNavigate();
  return (
    <>
      <TableRow
      >
        <TableCell sx={{ width: "30px" }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
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
        <TableCell sx={{ width: "30px" }}>
          {order.takeAway ? <TakeAwayIcon color={"info"} /> : <></>}
        </TableCell>
        <TableCell align="center">
          <IconButton onClick={() => navigate("/orders/" + order.id)}>
            <EditOutlined />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ paddingBottom: 0, paddingTop: 0, backgroundColor: '#F5F5F5'}} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ paddingBottom: 2, margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Prodotti Ordinati
              </Typography>
              <Table size="small" >
                <TableHead>
                  <TableRow>
                    <TableCell>Prodotto</TableCell>
                    <TableCell align="center">Quantità</TableCell>
                    <TableCell align="right">Costo</TableCell>
                    <TableCell align="right">SubTotale</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ borderBottom: 'none' }}>
                  {order.products.map(
                    (product: OrderedProduct, idx: number) => {
                      const subTotal = product.price * product.quantity;
                      return (
                        <TableRow key={idx} >
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
                        <TableRow >
                          <TableCell>Coperti</TableCell>
                          <TableCell align="center">
                            {order.serviceNumber}
                          </TableCell>
                          <TableCell align="right">
                            {currency(order.serviceCost)}
                          </TableCell>
                          <TableCell align="right">
                            {currency(order.serviceCost * order.serviceNumber)}
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

interface OrderListProps {
  searchQueryParam: OrdersSearchQueryParams
}
const OrderList = (props: OrderListProps): React.ReactElement => {
  console.log("Ricerca ordini, parametri: ", props.searchQueryParam)
  const ordersConf = ordersSearchQuery({ queryParams: props.searchQueryParam });

  const ordersData = useQuery({
    queryKey: ordersConf.queryKey,
    queryFn: ordersConf.queryFn,
  });

  const searchQueryParamsString = () => {
    if ( props.searchQueryParam.created || props.searchQueryParam.customer ) {
      let result = " con parametri di ricerca: "

      if ( props.searchQueryParam.created )
        result = result  + `data creazione = '${props.searchQueryParam.created}'`;

      if ( props.searchQueryParam.customer)
        result = result  + `${props.searchQueryParam.created?',' : ''} nome cliente = '${props.searchQueryParam.customer}'`;

      return result;
    }

    return '';
  }

  if ( ordersData.isPending)
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    );


  if ( ordersData.isError )
    return <Alert severity="error">Si è verificato un errore prelevando la lista degli ordini: {ordersData.error.message}</Alert>

  const orders = ordersData.data;

  if ( ! orders || orders.length == 0) {
    return (
        <Paper variant='outlined' sx={{p: 1}}>
          <Typography sx={{p: 1}}>{`Nessun ordine trovato ${searchQueryParamsString()}`}</Typography>
        </Paper>
    )
  }
  const handleRefresh = () => {
    queryClient.invalidateQueries({queryKey: ordersSearchQuery({}).queryKey}).then(() => {
      toast.success("Elenco ordini aggiornato", {duration: 2000})
    }).catch((e: Error) => {console.log('Errore: ', e)})
  }

  return (
    <>
      <Paper variant='outlined' sx={{p: 1, mb: 2, display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Typography component="div" sx={{p: 1}}>{`Sono stati trovati n. ${orders.length} ordini ${searchQueryParamsString()}`}</Typography>
        <IconButton>
          <IconButton sx={{ width: '40px'}} onClick={handleRefresh}>
            <CachedOutlined  />
          </IconButton>
        </IconButton>
      </Paper>
    <TableContainer>
      <Table stickyHeader aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align="center">#</TableCell>
            <TableCell align="center">Data</TableCell>
            <TableCell align="center">Ora</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell align="center">Sconto</TableCell>
            <TableCell align="right">Totale</TableCell>
            <TableCell></TableCell>
            <TableCell align="center">
              <SettingsOutlined />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ backgroundColor: "background.default" }}>
          {orders &&
            orders.map((o: Order, idx: number) => (
              <OrderRow key={idx} order={o} />
            ))}

          {orders === undefined && <span>Empty</span>}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
};

export default OrderList;