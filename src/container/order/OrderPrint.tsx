import * as React from "react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Box,
  Grid,
  Table, TableCell,
  TableContainer,
  TableHead, TableRow,
  Typography
} from "@mui/material";
import { Logo } from "../../layout/Logo.tsx";
import { Order } from "../../api/sagra/sagraSchemas.ts";
import { currency } from "../../utils";
import { ProductName } from "../product/ProductName.tsx";

interface IOrderPrint {
  order: Order;
}

const OrderPrint = (props : IOrderPrint ) => {

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const order : Order = {
    id: 7811,
    customer: "Lorenzo Luconi Trombacchi dei conti di Tonfano",
    totalAmount: 147.50,
    serviceNumber: 4,
    serviceCost: 0.5,
    takeAway: false,
    discountRate: 20,
    created: '2025-07-23T23:58:45',
    note: 'era meglio morire da piccoli con i peli del culo a batuffoli che morire ...',
    products: [
      {
        productId: 1,
        quantity: 3,
        price: 8
      },
      {
        productId: 2,
        quantity: 3,
        price: 6
      }
    ]
  }


  return (
    <>
      <button onClick={reactToPrintFn}>Print</button>
      <Box ref={contentRef} sx={{ p: 5}}>
        <OrderPrintLogo/>
        <OrderPrintInfo order={order} />
        <OrderPrintTitle title="Copia Cliente" />
        <TableContainer>
          <Table sx={{width: '100%'}}>
            <TableHead>
             <TableRow>
                <TableCell>Prodotto</TableCell>
                <TableCell align="center" sx={{ width: '100px'}}>Quantità</TableCell>
                <TableCell align="right" sx={{ width: '120px'}}>Prezzo Unit.</TableCell>
                <TableCell align="right" sx={{ width: '120px'}}>Totale</TableCell>
             </TableRow>
              { order.products.map(p =>
                <TableRow key={p.productId} sx={{p: 0}}>
                  <TableCell><Typography sx={{ fontSize: '1.1em'}}><ProductName productId={p.productId}/></Typography></TableCell>
                  <TableCell align="center">{p.quantity}</TableCell>
                  <TableCell align="right">{currency(p.price)}</TableCell>
                  <TableCell align="right">{currency(p.price * p.quantity)}</TableCell>
                </TableRow>
              )}

              { order.serviceNumber > 0 ?
                <TableRow >
                  <TableCell><Typography sx={{ fontSize: '1.1em'}}>Coperti</Typography></TableCell>
                  <TableCell align="center">{order.serviceNumber}</TableCell>
                  <TableCell align="right">{currency(order.serviceCost)}</TableCell>
                  <TableCell align="right">{currency(order.serviceNumber * order.serviceCost)}</TableCell>
                </TableRow>
                : ''
              }
                <TableRow sx={{ display: 'none'}} >
                  <TableCell colSpan={3} align="right" sx={{ fontSize: '1.1em', fontWeight: 500 }}>TOTALE</TableCell>
                  <TableCell colSpan={3} align="right" sx={{ fontSize: '1.1em', fontWeight: 500 }}>{currency(order.totalAmount)}</TableCell>
                </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
      </Box>
    </>
  )
}

interface IFieldValue {
  field: string
  value: string
}


const FieldValue = (props: IFieldValue) => {
  return (
    <Box sx={{ display: "flex", mb: 0.5, verticalAlign: "middle", border: 0 }} >
      <Box sx={{ minWidth: '80px', paddingTop: '3px' }}>
        <Typography sx={{fontSize: '0.9em', textTransform: 'uppercase'}}>{props.field}:</Typography>
      </Box>
      <Box>
        <Typography sx={{fontSize: '1.1em', fontWeight: 500}}>{props.value}</Typography>
      </Box>
    </Box>
  )
}

const OrderPrintLogo = () => {
  return (
    <Box sx={{display: 'flex', columnGap: 5, justifyContent: 'flex-start'}}>
      <Logo sx={{fontSize: '6vh', color: 'text.primary', verticalAlign: 'middle'}} />
      <Typography sx={{fontSize: '1.8em', color: 'text.primary', pt: 3}}>Sagra San Pio X</Typography>
    </Box>
  )
}

interface OrderPrintInfoProps {
  order: Order
}

const OrderPrintInfo = (props: OrderPrintInfoProps) => {
  const {order} = props

  return (
    <Box sx={{display: 'inline-block', width: '100%', mt: 1, border: 1, p: 1}}>
      <Grid container spacing={4}>
        <Grid size={7}>
          <FieldValue field="Numero" value={order.id.toString()}/>
          <FieldValue field="Nome" value={order.customer}/>
          <FieldValue field="Data" value={order.created}/>
          <FieldValue field="Note" value={order.note ?? '-'}/>
        </Grid>
        <Grid size={5}>
          <FieldValue field="Totale" value={ order.discountRate ? `${currency(order.totalAmount)} (sconto ${order.discountRate}%)` : currency(order.totalAmount)}/>

          {
            order.takeAway ?
              <>
                <Typography sx={{fontSize: '1.6em', fontWeight: 500}}>ASPORTO</Typography>
              </>
              :
              <FieldValue field="Coperti" value={order.serviceNumber.toString() }/>
          }

        </Grid>
      </Grid>
    </Box>
  )
}

interface OrderPrintTitleProps {
  title: string
}
const OrderPrintTitle = (props: OrderPrintTitleProps) => {
  const  { title } = props
  return (
    <Box sx={{ mt: 5, textAlign: 'center' }}>
      <Typography sx={{fontSize: '1.8em', color: 'text.primary', textTransform: 'uppercase'}}>{title}</Typography>
    </Box>
  )
}

export default OrderPrint;