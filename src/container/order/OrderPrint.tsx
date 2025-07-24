import * as React from "react";
import {useRef} from "react";
import {useReactToPrint} from "react-to-print";
import {Box, Button, Grid, Table, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {PrintOutlined} from "@mui/icons-material";
import {Logo} from "../../layout/Logo.tsx";
import {Order, OrderedProduct, Product} from "../../api/sagra/sagraSchemas.ts";
import {currency} from "../../utils";
import {ProductName} from "../product/ProductName.tsx";
import "./OrderPrint.css"
import {productByIdQuery} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";
import {DepartmentName} from "../department/DepartmentName.tsx";

interface OrderPrintProps {
  order: Order;
}

interface OrderedProductPrint {
  productId: number;
  price: number;
  quantity: number;
  department: string
}


const OrderPrint = (props : OrderPrintProps ) => {

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const order : Order = {
    id: 7811,
    customer: "Lorenzo Luconi Trombacchi",
    totalAmount: 147.50,
    serviceNumber: 4,
    serviceCost: 0.5,
    takeAway: false,
    discountRate: 20,
    created: '2025-07-23T23:58:45',
    note: 'vuole il ketchup e non la maionese',
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
      },
      {
        productId: 3,
        quantity: 2,
        price: 0.8
      }
    ]
  } as Order

  // La chiave è l'id del prodotto, qualcosa di simile presente in OrderStore
  const productsMap : Record<number, Product> = {
    1: { name: 'Tordelli', departmentId: 1 } as Product,
    2: { name: 'Grigliata Salsicce', departmentId: 2 } as Product,
    3: { name: 'Panzanell', departmentId: 2 } as Product,
  }



  return (
    <>
      <Button onClick={reactToPrintFn} variant="contained" startIcon={<PrintOutlined/>}>Stampa</Button>

      <div ref={contentRef} className="printContent print-container">
        <OrderPrintPageCustomer order={order} />

        {
          Array.from(new Set(Object.values(productsMap).map(product => product.departmentId)).values()).map((departmentId: number) => {
            return (
              <>
                <div className="page-break" />
                <OrderPrintPageDepartment key={departmentId} order={order} departmentId={+departmentId} productsMap={productsMap} />
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

interface OrderPrintPageCustomerProps {
  order: Order;
}

const OrderPrintPageCustomer =  (props: OrderPrintPageCustomerProps) => {
  const {order} = props;

  return (
    <>
      <Box sx={{ m: 3}}>
        <OrderPrintLogo/>
        <OrderPrintInfo order={order} hideTable={true}/>
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
            </TableHead>
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
          </Table>
        </TableContainer>
      </Box>
    </>
  )

}

interface OrderPrintPageDepartmentProps {
  order: Order;
  departmentId: number;
  productsMap: Record<number, Product>;
}

const OrderPrintPageDepartment =  (props: OrderPrintPageDepartmentProps) => {
  const {order, departmentId, productsMap} = props;

  const productForDepartment = () => {
    const result : OrderedProduct[] = [];
    for ( const op of order.products) {
      const productsMapElement = productsMap[op.productId];
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
        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography sx={{fontSize: '1.8em', color: 'text.primary', textTransform: 'uppercase'}}>
            <DepartmentName departmentId={departmentId}/>
          </Typography>
        </Box>
        <TableContainer>
          <Table sx={{width: '100%'}}>
            <TableHead>
              <TableRow>
                <TableCell>Prodotto</TableCell>
                <TableCell align="center" sx={{ width: '100px'}}>Quantità</TableCell>
              </TableRow>
            </TableHead>
              { productsToPrint.map(p =>
                <TableRow key={p.productId} sx={{p: 0}}>
                  <TableCell><Typography sx={{ fontSize: '1.1em'}}><ProductName productId={p.productId}/></Typography></TableCell>
                  <TableCell align="center">{p.quantity}</TableCell>
                </TableRow>
              )}
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
              <Box sx={{border: '1px dashed black', borderRadius: '4px', height: '70px', p: 1, mt: 1, textAlign: 'center'}}>
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
    <Box sx={{ mt: 5, textAlign: 'center' }}>
      <Typography sx={{fontSize: '1.8em', color: 'text.primary', textTransform: 'uppercase'}}>{title}</Typography>
    </Box>
  )
}

interface ProductMapProps {
  orderedProduct: OrderedProduct
}
const ProductMap = (props: ProductMapProps) => {
  const {orderedProduct} = props

  const productConf = productByIdQuery({
    pathParams: { productId: orderedProduct.productId }
  });

  const productData = useQuery({
    queryKey: productConf.queryKey,
    queryFn: productConf.queryFn,
  });

  if (productData.isLoading) {
    return <></>;
  }

  if (productData.isError) {
    return <>Error</>;
  }
}



export default OrderPrint;