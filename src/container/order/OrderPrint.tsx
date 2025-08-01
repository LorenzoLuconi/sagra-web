import {
  Box,
  Grid, styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import {Logo} from "../../layout/Logo.tsx";
import {Order, OrderedProduct, Product} from "../../api/sagra/sagraSchemas.ts";
import { convertDate, currency, FULL_DATE_CONF } from "../../utils";
import "./OrderPrint.css"
import {DepartmentName} from "../department/DepartmentName.tsx";
import * as React from "react";

interface OrderPrintProps {
  order: Order
  products: Record<number, Product>
}

const TableStyle = {
  border: '1px solid #999',
  borderRadius: '4px',
  width: '100%'
}

const TableCellCustomerStyle = {
  fontSize: '1.0em'
}

const TableCellDepStyle = {
  fontSize: '1.2em'
}


const StyledTableRow = styled(TableRow)(() => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#FAFAFA'
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const OrderPrint = (props : OrderPrintProps ) => {

  const {order, products} = props;

  if ( ! products || Object.keys(products).length === 0 || ! order.products || order.products.length === 0)
    return <></>

  //console.log("Products to print: ", Object.keys(products));

  return (
    <>
        <OrderPrintPageCustomer order={order} products={products} />
        {
          Array.from(new Set(order.products.map( p => products[p.productId].departmentId))).map( (departmentId ) => {
            return (
                <div key={departmentId} className="page-break">
                 <OrderPrintPageDepartment order={order} departmentId={+departmentId} products={products} />
                </div>
            )
          })
        }
    </>
  )
}

interface IFieldValue {
  field: string
  value: string
}

const OrderPrintContainer = ( props: React.PropsWithChildren ) => {
  return (
    <Box sx={{ m: 3, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {props.children}
    </Box>
  )
}


const FieldValue = (props: IFieldValue) => {
  return (
    <Box sx={{ display: "flex", mb: 0.2, verticalAlign: "middle", border: 0 }} >
      <Box sx={{ minWidth: '80px', paddingTop: '3px' }}>
        <Typography sx={{fontSize: '0.9em', textTransform: 'uppercase'}}>{props.field}:</Typography>
      </Box>
      <Box>
        <Typography sx={{fontSize: '1.0em', fontWeight: 500}}>{props.value}</Typography>
      </Box>
    </Box>
  )
}

interface OrderPrintPageCustomerProps {
  order: Order
  products: Record<number, Product>
}


const OrderPrintPageCustomer =  (props: OrderPrintPageCustomerProps) => {
  const {order, products} = props;


  return (
    <>
      <OrderPrintContainer>
        <OrderPrintLogo/>
        <OrderPrintInfo order={order} hideTable={true}/>
        <OrderPrintTitle title="Copia Cliente" />
        <TableContainer sx={TableStyle}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{width: '100%'}}>Prodotto</TableCell>
                <TableCell align="center" sx={{ minWidth: '50px'}}>Quantità</TableCell>
                <TableCell align="right" sx={{ minWidth: '90px'}}>Prezzo Unit.</TableCell>
                <TableCell align="right" sx={{ minWidth: '50px'}}>Totale</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
              { order.products.map( p =>
                <StyledTableRow key={p.productId}>
                  <TableCell><Typography sx={{ ...TableCellCustomerStyle }}>{products[p.productId]?.name}</Typography></TableCell>
                  <TableCell align="center"><Typography sx={{ ...TableCellCustomerStyle}}>{p.quantity}</Typography></TableCell>
                  <TableCell align="right"><Typography sx={{ ...TableCellCustomerStyle}}>{currency(p.price)}</Typography></TableCell>
                  <TableCell align="right"><Typography sx={{ ...TableCellCustomerStyle}}>{currency(p.price * p.quantity)}</Typography></TableCell>
                </StyledTableRow>
              )}
              </>
              <>
              { order.serviceNumber > 0 &&

                <TableRow >
                  <TableCell><Typography sx={{ ...TableCellCustomerStyle}}>Coperti</Typography></TableCell>
                  <TableCell align="center">{order.serviceNumber}</TableCell>
                  <TableCell align="right"><Typography sx={{ ...TableCellCustomerStyle}}>{currency(order.serviceCost)}</Typography></TableCell>
                  <TableCell align="right"><Typography sx={{ ...TableCellCustomerStyle}}>{currency(order.serviceNumber * order.serviceCost)}</Typography></TableCell>
                </TableRow>
              }
              </>
              <TableRow sx={{ display: 'none'}} >
                <TableCell colSpan={3} align="right" sx={{ fontSize: '1.1em', fontWeight: 500 }}>TOTALE</TableCell>
                <TableCell colSpan={3} align="right" sx={{ fontSize: '1.1em', fontWeight: 500 }}>{currency(order.totalAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </OrderPrintContainer>
    </>
  )

}

interface OrderPrintPageDepartmentProps {
  order: Order;
  departmentId: number;
  products: Record<number, Product>;
}

const OrderPrintPageDepartment =  (props: OrderPrintPageDepartmentProps) => {
  const {order, departmentId, products} = props;

  const productForDepartment = () => {
    const result : OrderedProduct[] = [];
    for ( const op of order.products) {
      const productsMapElement = products[op.productId];
      if (productsMapElement && productsMapElement.departmentId == departmentId) {
        result.push(op)
      }
    }

    return result;
  }

  const productsToPrint = productForDepartment()

  return (
    <>
      <OrderPrintContainer>
        <OrderPrintLogo/>
        <OrderPrintInfo order={order} />
        <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
          <Typography sx={{fontSize: '1.8em', color: 'text.primary', textTransform: 'uppercase', fontWeight: 700}}>
            <DepartmentName departmentId={departmentId}/>
          </Typography>
        </Box>
        <TableContainer sx={TableStyle}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Prodotto</TableCell>
                <TableCell align="center" sx={{ width: '100px'}}>Quantità</TableCell>
              </TableRow>
            </TableHead>
          <TableBody>
            <>
              { productsToPrint.map(p =>
                <StyledTableRow key={p.productId} sx={{p: 0}}>
                  <TableCell ><Typography sx={{ ...TableCellDepStyle}}>{products[p.productId].name}</Typography></TableCell>
                  <TableCell align="center"><Typography sx={{ ...TableCellDepStyle}}>{p.quantity}</Typography></TableCell>
                </StyledTableRow>
              )}
            </>
          </TableBody>
          </Table>
        </TableContainer>
      </OrderPrintContainer>
    </>
  )

}

const OrderPrintLogo = () => {
  return (
    <Box sx={{display: 'flex', columnGap: 5, justifyContent: 'flex-start', width: '100%'}}>
      <Logo sx={{fontSize: '6vh', color: 'text.primary', verticalAlign: 'middle'}} />
      <Typography sx={{fontSize: '1.8em', color: 'text.primary', pt: 3}}>Sagra San Pio X</Typography>
    </Box>
  )
}

interface OrderPrintInfoProps {
  order: Order
  hideTable?: boolean
}

const OrderPrintInfo = (props: OrderPrintInfoProps) => {
  const {order} = props

  return (
    <Box sx={{display: 'inline-block', width: '100%', mt: 1, border: 1, p: 1, backgroundColor: '#FAFAFA' }}>
      <Grid container spacing={4}>
        <Grid size={7}>
          <FieldValue field="Numero" value={order.id.toString()}/>
          <FieldValue field="Nome" value={order.customer}/>
          <FieldValue field="Data" value={convertDate('it', new Date(order.created), FULL_DATE_CONF)}/>
          <FieldValue field="Note" value={order.note ?? '-'}/>
        </Grid>
        <Grid size={5}>
          <FieldValue field="Totale" value={ order.discountRate ? `${currency(order.totalAmount)} (sconto ${order.discountRate}%)` : currency(order.totalAmount)}/>
            <>
          {
            order.takeAway ?
              <Box sx={{border: '1px dashed black', borderRadius: '4px', height: '60px', p: 1, mt: 1, textAlign: 'center'}}>
                <Typography sx={{fontSize: '1.6em', fontWeight: 500, mt: 2}}>ASPORTO</Typography>
              </Box>
              :
              <>
                <FieldValue field="Coperti" value={order.serviceNumber.toString() }/>
                { props.hideTable ? '' :
                  <Box sx={{border: '1px dashed black', borderRadius: '4px', height: '70px', p: 1, mt: 1}}>
                    <Typography sx={{fontSize: '0.9em'}}>Tavolo</Typography>
                  </Box>
                }
              </>
          }
            </>
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
    <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
      <Typography sx={{fontSize: '1.8em', textTransform: 'uppercase', fontWeight: 700}}>{title}</Typography>
    </Box>
  )
}

export default OrderPrint;