import * as React from 'react'
import {Order, OrderedProduct, Product} from "../api/sagra/sagraSchemas.ts";
import {clone, cloneDeep, set} from "lodash";
import {OrderErrorT} from "../utils";
import toast from "react-hot-toast";

interface OrderContextI {
    order?: Order
    updateOrderField: (field: string, value: unknown) => void
    products: Record<number, Product>
    setProduct: (product: Product, quantity: number) => void
    deleteProduct: (product: Product) => void
    addProduct: (product: Product, quantity: number) => void
    updateOrder: (order: Order) => void
    errors: OrderErrorT
    setFieldError: (field: string, message: string) => void
    resetErrors: () => void
}

export const OrderContext = React.createContext<OrderContextI>({
    products: [],
    errors: {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setProduct: (product: Product, quantity: number) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteProduct: (product: Product) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addProduct: (product: Product, quantity: number) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateOrder: (order: Order) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateOrderField: (field: string, value: unknown) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setFieldError: (field: string, message: string) => {},

    resetErrors: () => {}
})

interface OrderStoreI extends React.PropsWithChildren {
    products: Product[]
    order?: Order

}

const EmptyOrder: Order = {
    products: [],
        serviceNumber: 1,
    serviceCost: 0.5,
    customer: '',
    takeAway: false,
} as Order

export const OrderStore: React.FC<OrderStoreI> = (props) => {
    const {products, order} = props
    const [storedOrder, setStoredOrder] = React.useState<Order | undefined>(order??EmptyOrder)
    const [storedProducts, setStoredProducts] = React.useState<Record<number, Product>>({} as Record<number, Product>)
    const [storedErrors, setStoredErrors] = React.useState<OrderErrorT>({})

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
        let selectedOrderProduct = _orderProduct
        if (_orderProduct === undefined) {

            const oP: OrderedProduct = {
                productId: product.id,
                quantity: quantity,
                price: product.price
            }
            selectedOrderProduct = oP
            products.push(oP)
        } else {
            _orderProduct.quantity = quantity
        }

        if (selectedOrderProduct?.quantity <= product.availableQuantity) {


            _storedProducts[product.id] = product


            setStoredProducts(_storedProducts)

            setStoredOrder(_order)
        } else {
            toast.error(`Quantità supera la disponibilità (${product.availableQuantity})`)
            setFieldErrorHandler(`product.${product.id}`, 'Quantità supera la disponibilità')
        }
    }


    const addProductHandler = (product: Product, quantity: number) => {
        const _order = cloneDeep(storedOrder ?? {products: []} as Order)
        const _storedProducts = cloneDeep(storedProducts)

        const {products} = _order

        const _orderProduct: OrderedProduct | undefined = products.find((p: OrderedProduct) => {return p.productId === product.id})
        let selectedOrderProduct = _orderProduct
        if (_orderProduct === undefined) {

            const oP: OrderedProduct = {
                productId: product.id,
                quantity: quantity,
                price: product.price
            }

            selectedOrderProduct = oP

            products.push(oP)
        } else {


            _orderProduct.quantity += quantity
        }

        console.log('ADDPRODUCT: ', product.name, selectedOrderProduct?.quantity, product.availableQuantity, selectedOrderProduct?.quantity > product.availableQuantity)


        if (selectedOrderProduct?.quantity <= product.availableQuantity) {


            _storedProducts[product.id] = product


            setStoredProducts(_storedProducts)

            setStoredOrder(_order)
        } else {
            toast.error(`Quantità supera la disponibilità (${product.availableQuantity})`)
            setFieldErrorHandler(`product.${product.id}`, 'Quantità supera la disponibilità')
        }
    }

    const updateOrderHandled = (order: Order) => {
        setStoredOrder((prev) => {
            return order
        })

    }


    const updateOrderFieldHandler = (field: string, value: unknown) => {

        setStoredOrder((prev) => {

            let _order = cloneDeep(prev)

            if (_order === undefined) {
                _order = EmptyOrder as Order
            }
            set(_order, field,  value)

            console.log('PRIMA: ', storedOrder, _order)

            return (_order)

        })
    }

    const setFieldErrorHandler = (field: string, message: string) => {
        setStoredErrors((prev) => {
            const _errors = clone(prev)
            _errors[field] = message
            return _errors
        })
    }

    const resetErrorsHandler = () => {
        setStoredErrors((prev) => {
            return {} as OrderErrorT
        })
    }



    return (
        <OrderContext.Provider
            value={{
                order: storedOrder,
                products: storedProducts??[],
                errors: storedErrors,
                addProduct: addProductHandler,
                setProduct: setProductHandler,
                deleteProduct: deleteProductHandler,
                updateOrder: updateOrderHandled,
                updateOrderField: updateOrderFieldHandler,
                setFieldError: setFieldErrorHandler,
                resetErrors: resetErrorsHandler
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
        errors: storeContext.errors,
        updateOrder: storeContext.updateOrder,
        addProduct: storeContext.addProduct,
        setProduct: storeContext.setProduct,
        deleteProduct: storeContext.deleteProduct,
        updateOrderField: storeContext.updateOrderField,
        setFieldError: storeContext.setFieldError,
        resetErrors: storeContext.resetErrors
    }
}