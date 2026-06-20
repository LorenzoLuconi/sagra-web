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
import * as React from "react";
import {useEventTitle, usePrintConfiguration} from "../../context/AppConfigurationStore.tsx";
import {useDepartmentName} from "../department/useDepartmentName.ts";
import {useCourseName} from "../course/useCourseName.ts";

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
  const {customerCopy, splitBy} = usePrintConfiguration();

  if ( ! products || Object.keys(products).length === 0 || ! order.products || order.products.length === 0)
    return <></>

  //console.log("Products to print: ", Object.keys(products));

  return (
    <>
        {customerCopy && <OrderPrintPageCustomer order={order} products={products} />}
        {splitBy === "none"
          ? getPrintGroups(order, products, splitBy).map((group, index) => {
              const needsPageBreak = customerCopy || index > 0;
              return (
                <div key={group.key} className={needsPageBreak ? "page-break" : undefined}>
                  <OrderPrintPageProducts
                    order={order}
                    splitBy="none"
                    products={products}
                    productsToPrint={group.products}
                  />
                </div>
              );
            })
          : getPrintGroups(order, products, splitBy).map((group, index) => {
              const needsPageBreak = customerCopy || index > 0;
              return (
                <div key={group.key} className={needsPageBreak ? "page-break" : undefined}>
                  <OrderPrintPageProducts
                    order={order}
                    splitBy={splitBy}
                    groupId={group.groupId}
                    products={products}
                    productsToPrint={group.products}
                  />
                </div>
              );
            })}
    </>
  )
}

type PrintGroup = {
  key: string;
  products: OrderedProduct[];
};

type SplitPrintGroup = PrintGroup & {
  groupId: number;
};

function getPrintGroups(
  order: Order,
  products: Record<number, Product>,
  splitBy: "none",
): PrintGroup[];
function getPrintGroups(
  order: Order,
  products: Record<number, Product>,
  splitBy: "course" | "department",
): SplitPrintGroup[];
function getPrintGroups(
  order: Order,
  products: Record<number, Product>,
  splitBy: "none" | "course" | "department",
): PrintGroup[] | SplitPrintGroup[] {
  if (splitBy === "none") {
    return [{
      key: "all",
      products: order.products,
    }];
  }

  const groupIds = Array.from(new Set(order.products.map((orderedProduct) => {
    const product = products[orderedProduct.productId];
    return splitBy === "course" ? product.courseId : product.departmentId;
  })));

  return groupIds.map((groupId) => ({
    key: `${splitBy}-${groupId}`,
    groupId,
    products: order.products.filter((orderedProduct) => {
      const product = products[orderedProduct.productId];
      return splitBy === "course" ? product.courseId === groupId : product.departmentId === groupId;
    }),
  }));
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

type OrderPrintPageProductsProps =
  {
    order: Order;
    products: Record<number, Product>;
    productsToPrint: OrderedProduct[];
  } & (
    | {
        splitBy: "none";
      }
    | {
        splitBy: "course" | "department";
        groupId: number;
      }
  );

const OrderPrintPageProducts =  (props: OrderPrintPageProductsProps) => {
  const {order, products, productsToPrint} = props;

  return (
    <>
      <OrderPrintContainer>
        <OrderPrintLogo/>
        <OrderPrintInfo order={order} />
        {props.splitBy === "none"
          ? <ResolvedOrderPrintTitle splitBy="none" />
          : <ResolvedOrderPrintTitle splitBy={props.splitBy} groupId={props.groupId} />}
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

type ResolvedOrderPrintTitleProps =
  | { splitBy: "none"; groupId?: undefined }
  | { splitBy: "course" | "department"; groupId: number };

const ResolvedOrderPrintTitle = (props: ResolvedOrderPrintTitleProps) => {
  if (props.splitBy === "none") {
    return <OrderPrintTitle title="Prodotti" />;
  }

  if (props.splitBy === "course") {
    return <CourseOrderPrintTitle groupId={props.groupId} />;
  }

  return <DepartmentOrderPrintTitle groupId={props.groupId} />;
}

const CourseOrderPrintTitle = ({groupId}: {groupId: number}) => {
  const courseTitle = useCourseName(groupId);
  return <OrderPrintTitle title={courseTitle.data ?? ""} />;
}

const DepartmentOrderPrintTitle = ({groupId}: {groupId: number}) => {
  const departmentTitle = useDepartmentName(groupId);
  return <OrderPrintTitle title={departmentTitle.data ?? ""} />;
}

const OrderPrintLogo = () => {
  const eventTitle = useEventTitle();

  return (
    <Box sx={{display: 'flex', columnGap: 5, justifyContent: 'flex-start', width: '100%'}}>
      <Logo sx={{fontSize: '6vh', color: 'text.primary', verticalAlign: 'middle'}} />
      <Typography sx={{fontSize: '1.8em', color: 'text.primary', pt: 3}}>{eventTitle}</Typography>
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
