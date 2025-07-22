import * as React from 'react'
import {Order, OrderedProduct, Product} from "../api/sagra/sagraSchemas.ts";
import {cloneDeep, set} from "lodash";

interface OrderContextI {
    order?: Order
    updateOrderField: (field: string, value: unknown) => void
    products: Record<number, Product>
    setProduct: (produce: Product, quantity: number) => void
    deleteProduct: (product: Product) => void
    addProduct: (product: Product, quantity: number) => void
    updateOrder: (order: Order) => void
}

export const OrderContext = React.createContext<OrderContextI>({
    products: [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setProduct: (product: Product, quantity: number) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteProduct: (product: Product) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addProduct: (product: Product, quantity: number) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateOrder: (order: Order) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateOrderField: (field: string, value: unknown) => {}
})

interface OrderStoreI extends React.PropsWithChildren {
    products: Product[]
    order?: Order

}

const EmptyOrder: Order = {
    products: [],
    serviceNumber: 0,
    serviceCost: 0.5,
    customer: '',
    takeAway: false,
} as Order

export const OrderStore: React.FC<OrderStoreI> = (props) => {
    const {products, order} = props
    const [storedOrder, setStoredOrder] = React.useState<Order | undefined>(order??EmptyOrder)
    const [storedProducts, setStoredProducts] = React.useState<Record<number, Product>>({} as Record<number, Product>)


    React.useEffect(() => {
        const _storedProducts: Record<number, Product> = {}
        for (let i = 0; i< products.length; i++) {
            _storedProducts[products[i].id] = products[i]
        }
        setStoredProducts(_storedProducts)
    }, [products])


    const deleteProductHandler = (product: Product) => {
            setStoredOrder((prev) => {
                let _order = undefined
                if (prev !== undefined) {
                    _order = cloneDeep(prev)
                    const {products} = _order
                    const idx = products.findIndex((p) => {
                        return p.productId === product.id
                    })
                    console.log('DELETE Products: ', products, idx)
                    if (idx > -1) {
                        const res = products.splice(idx, 1)
                        console.log('Cancellato: ', res)
                    }
                }
                return _order
            })
    }


    const setProductHandler = (product: Product, quantity: number) => {
        const _order = cloneDeep(storedOrder ?? {products: []} as Order)
        const _storedProducts = cloneDeep(storedProducts)

        const {products} = _order

        const _orderProduct: OrderedProduct | undefined = products.find((p: OrderedProduct) => {return p.productId === product.id})
        if (_orderProduct === undefined) {

            const oP: OrderedProduct = {
                productId: product.id,
                quantity: quantity,
                price: product.price
            }

            products.push(oP)
        } else {
            _orderProduct.quantity = quantity
        }




        _storedProducts[product.id] = product


        setStoredProducts(_storedProducts)

        setStoredOrder(_order)
    }


    const addProductHandler = (product: Product, quantity: number) => {
        const _order = cloneDeep(storedOrder ?? {products: []} as Order)
        const _storedProducts = cloneDeep(storedProducts)

        const {products} = _order

        const _orderProduct: OrderedProduct | undefined = products.find((p: OrderedProduct) => {return p.productId === product.id})
        if (_orderProduct === undefined) {

            const oP: OrderedProduct = {
                productId: product.id,
                quantity: quantity,
                price: product.price
            }

            products.push(oP)
        } else {
            _orderProduct.quantity += quantity
        }


        _storedProducts[product.id] = product


        setStoredProducts(_storedProducts)

        setStoredOrder(_order)

    }

    const updateOrderHandled = (order: Order) => {
        setStoredOrder((prev) => {
            return order
        })

    }


    const updateOrderFieldHandler = (field: string, value: unknown) => {

        setStoredOrder((prev) => {

            let _order = cloneDeep(prev)


            console.log('UPDATEORDERHANDLER: ', _order, field, value)

            if (_order === undefined) {
                _order = EmptyOrder as Order
            }
            set(_order, field,  value)

            console.log('PRIMA: ', storedOrder, _order)

            return (_order)

        })
    }


        return (
        <OrderContext.Provider
            value={{
                order: storedOrder,
                products: storedProducts??[],
                addProduct: addProductHandler,
                setProduct: setProductHandler,
                deleteProduct: deleteProductHandler,
                updateOrder: updateOrderHandled,
                updateOrderField: updateOrderFieldHandler
            }}
        >
            {props.children}
        </OrderContext.Provider>
    )

}


export const useOrderStore = () => {
    const storeContext = React.useContext(OrderContext)
    return {
        order: storeContext.order,
        products: storeContext.products,
        updateOrder: storeContext.updateOrder,
        addProduct: storeContext.addProduct,
        setProduct: storeContext.setProduct,
        deleteProduct: storeContext.deleteProduct,
        updateOrderField: storeContext.updateOrderField
    }
}