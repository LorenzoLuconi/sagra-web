import * as React from "react"
import {ordersSearchQuery, productByIdQuery} from "../api/sagra/sagraComponents.ts";
import {convertDate, getQueryObj} from "../utils";
import {useLocation} from "react-router";
import {useQuery} from "@tanstack/react-query";
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
    Typography
} from "@mui/material";
import {Order, OrderedProduct} from "../api/sagra/sagraSchemas.ts";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface ProductNameI {
    productId: number
}

const ProductName: React.FC<ProductNameI> = (props) => {

    const productConf = productByIdQuery({pathParams: {productId: props.productId}})

    const productData = useQuery({
        queryKey: productConf.queryKey,
        queryFn: productConf.queryFn,
        staleTime: 1000*60*10
    })

    if (productData.isFetched) {
        const product = productData.data

        if (product) {
            return (
                <>{product.name}</>
            )
        }
        return <></>
    }


    if (productData.isError) {
        return <>Error</>
    }


    return (
        <>Loading</>
    )
}




interface OrderRowI {
    order: Order
}


const OrderRow: React.FC<OrderRowI> = (props) => {
    const {order} = props
    const [open, setOpen] = React.useState(false)
    const createdDate = order.created ? new Date(order.created) : new Date()
    return (
    <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <TableCell>
                <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </TableCell>
            <TableCell component="th" scope="row">
                {order.customer}
            </TableCell>
            <TableCell align="right">{convertDate('it',  createdDate)}</TableCell>
            <TableCell align="right">{order.note}</TableCell>
            <TableCell align="right">{order.serviceCost}</TableCell>
            <TableCell align="right">{order.serviceNumber}</TableCell>
        </TableRow>
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                            Prodotti
                        </Typography>
                        <Table size="small" aria-label="purchases">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Prodotto</TableCell>
                                    <TableCell>Quantità</TableCell>
                                    <TableCell align="right">Costo</TableCell>
                                    <TableCell align="right">SubTotale (€)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.products &&order.products.map((product:OrderedProduct, idx: number) => (
                                    <TableRow key={idx}>


                                        <TableCell><ProductName productId={product.productId??0}/></TableCell>
                                        <TableCell>{product.quantity}</TableCell>
                                        <TableCell component="th" scope="row">
                                            {product.price}
                                        </TableCell>

                                        <TableCell align="right">
                                            {product.price * product.quantity}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </>
    )
}


const Orders = ():React.ReactElement => {
    const location = useLocation()
    const search = new URLSearchParams(location.search)
    const searchObj = getQueryObj(search, {
        customer: 'string',
        username: 'string',
        created: 'string',
        page: 'number',
        size: 'number',
        sort: 'string'
    })

    const ordersConf = ordersSearchQuery({queryParams: searchObj})

    const ordersData = useQuery({
        queryKey: ordersConf.queryKey,
        queryFn: ordersConf.queryFn
    })

    if (ordersData.isFetched) {
        console.log('Orders: ', ordersData.data)
        const orders = ordersData.data
        return (
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Nome</TableCell>
                            <TableCell align="right">Creato</TableCell>
                            <TableCell align="right">Note</TableCell>
                            <TableCell align="right">Costo Servizio</TableCell>
                            <TableCell align="right">Numero Servizio</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {orders && orders.map((o: Order, idx: number) => (
                            <OrderRow key={idx} order={o} />
                        ))}

                        {orders === undefined && <span>Empty</span>}

                    </TableBody>
                </Table>
            </TableContainer>
        )






        //return <span>Orders</span>

    }


    if (ordersData.isError) {
        return <span>Error</span>
    }

    return (<span>Loading...</span>)


}
export default Orders