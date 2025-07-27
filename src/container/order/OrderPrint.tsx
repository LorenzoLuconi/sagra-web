import {useRef} from "react";
import {useReactToPrint} from "react-to-print";
import {
  Box,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import {PrintOutlined} from "@mui/icons-material";
import {Logo} from "../../layout/Logo.tsx";
import {Order, OrderedProduct, Product} from "../../api/sagra/sagraSchemas.ts";
import {currency} from "../../utils";
import "./OrderPrint.css"
import {DepartmentName} from "../department/DepartmentName.tsx";

interface OrderPrintProps {
  order: Order
  disabled: boolean
  products: Record<number, Product>
}

const TableStyle = {
  border: '1px solid black',
  borderRadius: '3px',
  width: '100%'
}

const OrderPrint = (props : OrderPrintProps ) => {

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const {order, products} = props;

  return (
    <>
      <Button disabled={props.disabled} onClick={reactToPrintFn} variant="contained" startIcon={<PrintOutlined/>}>Stampa</Button>

      <div ref={contentRef} className="printContent print-container" style={{ alignItems: 'center'}}>
        <OrderPrintPageCustomer order={order} products={products} />

        {
          Array.from(new Set(Object.values(products).map(product => product.departmentId)).values()).map((departmentId: number) => {
            return (
              <>
                <div key={'pb-'.concat(''+departmentId)} className="page-break" />
                <OrderPrintPageDepartment key={departmentId} order={order} departmentId={+departmentId} products={products} />
              </>
            )
          })
        }

      </div>
    </>
  )
}

interface IFieldValue {
  field: string
  value: string
}


const FieldValue = (props: IFieldValue) => {
  return (
    <Box sx={{ display: "flex", mb: 0.2, verticalAlign: "middle", border: 0 }} >
      <Box sx={{ minWidth: '80px', paddingTop: '3px' }}>
        <Typography sx={{fontSize: '0.9em', textTransform: 'uppercase'}}>{props.field}:</Typography>
      </Box>
      <Box>
        <Typography sx={{fontSize: '1.1em', fontWeight: 500}}>{props.value}</Typography>
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
      <Box sx={{ m: 3}}>
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
              { order.products.map(p =>
                <TableRow key={p.productId} sx={{p: 0}}>
                  <TableCell><Typography sx={{ fontSize: '1.2em'}}>{products[p.productId]?.name}</Typography></TableCell>
                  <TableCell align="center">{p.quantity}</TableCell>
                  <TableCell align="right">{currency(p.price)}</TableCell>
                  <TableCell align="right">{currency(p.price * p.quantity)}</TableCell>
                </TableRow>
              )}

              { order.serviceNumber > 0 ?
                <TableRow >
                  <TableCell><Typography sx={{ fontSize: '1.2em'}}>Coperti</Typography></TableCell>
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
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
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
      <Box sx={{ m: 3}}>
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
              { productsToPrint.map(p =>
                <TableRow key={p.productId} sx={{p: 0}}>
                  <TableCell ><Typography sx={{ fontSize: '1.2em'}}>{products[p.productId].name}</Typography></TableCell>
                  <TableCell align="center">{p.quantity}</TableCell>
                </TableRow>
              )}
          </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
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
  hideTable?: boolean
}

const OrderPrintInfo = (props: OrderPrintInfoProps) => {
  const {order} = props

  return (
    <Box sx={{display: 'inline-block', width: '100%', mt: 1, border: 1, p: 1, backgroundColor: '#FAFAFA' }}>
      <Grid container spacing={4}>
        <Grid size={7}>
          <FieldValue field="Numero" value={order.id?.toString()}/>
          <FieldValue field="Nome" value={order.customer}/>
          <FieldValue field="Data" value={order.created}/>
          <FieldValue field="Note" value={order.note ?? '-'}/>
        </Grid>
        <Grid size={5}>
          <FieldValue field="Totale" value={ order.discountRate ? `${currency(order.totalAmount)} (sconto ${order.discountRate}%)` : currency(order.totalAmount)}/>

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