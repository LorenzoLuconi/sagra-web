import * as React from "react";
import { useQueries } from "@tanstack/react-query";
import { productByIdQuery } from "../../api/sagra/sagraComponents.ts";
import {
    Alert,
    Badge,
    Box,
    CircularProgress,
    Drawer,
    Fab,
    Grid,
    Paper,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import {OrderStore, useOrderStore} from "../../context/OrderStore.tsx";
import ProductsToOrder from "./ProductsToOrder.tsx";
import ErrorInfo from "../../view/ErrorInfo.tsx";
import OrderEditTotal from "./OrderEditTotal.tsx";
import OrderEditProducts from "./OrderEditProducts.tsx";
import OrderEditForm from "./OrderEditForm.tsx";
import { Order, Product } from "../../api/sagra/sagraSchemas.ts";
import {convertDate, TIME_CONF} from "../../utils";
import OrderEditRest from "./OrderEditRest.tsx";
import {isEqual} from "lodash";
import {ShoppingCartOutlined} from "@mui/icons-material";

interface OrderEditContainerProps {
  order: Order;
}

const OrderEditContainer :React.FC<OrderEditContainerProps> = (props: OrderEditContainerProps) => {
    const { order } = props;

    const combinedQueries = useQueries({
        queries: order.products.map((product) => {
            const productConf = productByIdQuery({
                pathParams: { productId: product.productId }
            });
            return {
                queryKey: productConf.queryKey,
                queryFn: productConf.queryFn
            };
        }),
        combine: (results) => {
            const products = results.map((result) => result.data);
            return {
                data: products.every((product): product is Product => product !== undefined) ? products : undefined,
                pending: results.some((result) => result.isPending),
                error: results.some((result) => result.isError)
            };
        }
    });

    if (combinedQueries.error) {
        return <Alert severity="error">Si è verificato un errore prelevando i prodotti dell'ordine</Alert>;
    }

    if (combinedQueries.pending) {
        return <CircularProgress />;
    }

    if ( ! combinedQueries.data)
        return <></>

    return (
        <OrderStore products={combinedQueries.data} order={order}>
            <OrderEditInnerContainer />
        </OrderStore>
    )
}

const OrderEditInnerContainer: React.FC = () => {
    const theme = useTheme();
    const isCompact = useMediaQuery(theme.breakpoints.down('md'));
    const {order} = useOrderStore();
    const [orderDrawerOpen, setOrderDrawerOpen] = React.useState(false);
    const orderedProductsCount = order.products.reduce((total, product) => total + product.quantity, 0);

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 7}}>
                    <ProductsToOrder/>
                </Grid>
                {!isCompact && (
                    <Grid size={{xs: 12, md: 5}}>
                        <Box sx={{ position: 'sticky', top: '70px' }}>
                            <OrderPanel />
                        </Box>
                    </Grid>
                )}
            </Grid>

            {isCompact && (
                <>
                    <Fab
                        color="primary"
                        aria-label={orderDrawerOpen ? "Chiudi ordine" : "Apri ordine"}
                        onClick={() => setOrderDrawerOpen((open) => !open)}
                        sx={{
                            bottom: 16,
                            position: 'fixed',
                            right: 16,
                            zIndex: (theme) => theme.zIndex.drawer + 1,
                        }}
                    >
                        <Badge badgeContent={orderedProductsCount} color="error">
                            <ShoppingCartOutlined />
                        </Badge>
                    </Fab>
                    <Drawer
                        anchor="right"
                        open={orderDrawerOpen}
                        onClose={() => setOrderDrawerOpen(false)}
                        PaperProps={{
                            sx: {
                                maxWidth: '420px',
                                p: 1,
                                width: '92vw',
                            },
                        }}
                    >
                        <OrderPanel />
                    </Drawer>
                </>
            )}
        </>
    )
}

const OrderPanel: React.FC = () => {
    const theme = useTheme();
    const {order, originalOrder, isNewOrder} = useOrderStore();

    const isOrderChanged = !isEqual(originalOrder, order)

    const showCalc = () => {
        return !isNewOrder()  && ! isOrderChanged && order.totalAmount > 0
    }

    return (
        <>
            <ErrorInfo/>

            {
                ! isNewOrder() &&
                <Paper variant="outlined"
                       sx={{
                           p: 0.5,
                           textAlign: 'center',
                           backgroundColor: theme.sagra.panelBackground,
                           filter: 'brightness(85%)'
                       }}
                       className="paper-top">
                    <Typography sx={{fontWeight: 500, fontSize: '1.1em'}}>Ordine
                        n. {order.id} del {convertDate('it', new Date(order.created))} ore {convertDate('it', new Date(order.created), TIME_CONF)}</Typography>
                </Paper>
            }

            <Paper variant="outlined"
                   sx={{p: 0.5, backgroundColor: theme.sagra.panelBackground}}
                   className={ isNewOrder() ? "paper-top" : "paper-middle"}>
                <OrderEditTotal/>
            </Paper>

            <Paper variant="outlined"
                   sx={{p: 0.5, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-middle">
                <OrderEditProducts/>
            </Paper>

            <Paper
                variant="outlined"
                sx={{padding: 2, backgroundColor: theme.sagra.panelBackground}}
                className={ showCalc() ? 'paper-middle' : 'paper-bottom'}
            >
                <OrderEditForm/>
            </Paper>

            { showCalc() &&
                <Paper
                    variant="outlined"
                    sx={{padding: 2, backgroundColor: theme.sagra.panelBackground}}
                    className="paper-bottom"
                >
                    <OrderEditRest/>
                </Paper>
            }
        </>
    );
}

export default OrderEditContainer;
