import * as React from "react"
import {OrderStore, useOrderStore} from "../../context/OrderStore.tsx";
import {Grid} from "@mui/material";
import OrderEditForm from "./OrderEditForm.tsx";
import OrderTotal from "./OrderTotal.tsx";
import OrderedProductsEdit from "./OrderedProductsEdit.tsx";
import ProductsList from "../product/ProductsOrderCard.tsx"
import {Order, Product} from "../../api/sagra/sagraSchemas.ts";

const OrderNew = () => {
    const {addProduct, order, updateOrder} = useOrderStore()

    React.useEffect(() => {
        if (order === undefined) {
            const newOrder: Order = {takeAway: false,  serviceNumber: 0, products: []} as Order
            console.log('UpdateOrder', newOrder)
            updateOrder(newOrder)

        }
    }, [])

    return (


                <Grid container spacing={2}>
                    <Grid size={7}>
                        <ProductsList
                            addToOrder={(product: Product) => {
                                console.log('Aggiungo: ', product)
                            addProduct(product, 1)
                        }}/>
                    </Grid>
                    <Grid size={5}>
                        <OrderEditForm update={false}/>
                        <OrderTotal/>
                        <OrderedProductsEdit products={order?.products ?? []}/>
                    </Grid>
                </Grid>
    )
}
export default OrderNew