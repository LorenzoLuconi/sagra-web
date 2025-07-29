import * as React from 'react'
import {Order, Product} from "../api/sagra/sagraSchemas.ts";
import {clone, cloneDeep, set} from "lodash";
import {addOperator, OrderErrorT, setOperator, testOrderProductAvailability} from "../utils";
import toast from "react-hot-toast";

// @ts-ignore
export const EmptyOrder: Order = {
  products: [],
  serviceNumber: null,
  serviceCost: 0.5,
  customer: '',
  takeAway: false,
    id: -1
} as Order

interface OrderContextI {
    order: Order
    resetStore: () => void
    updateOrderField: (field: string, value: unknown) => void
    products: Record<number, Product>
    setProduct: (product: Product, quantity: number) => void
    deleteProduct: (product: Product) => void
    addProduct: (product: Product, quantity: number) => void
    updateOrder: (order: Order) => void
    errors: OrderErrorT
    setFieldError: (field: string, message: string) => void
    resetErrors: () => void
    isNewOrder: () => boolean
}



export const OrderContext = React.createContext<OrderContextI>({
    order : EmptyOrder,
    products: [],
    errors: {},

    resetStore: () => {},

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
    resetErrors: () => {},
    isNewOrder: (): boolean => {return false}
})

interface OrderStoreI extends React.PropsWithChildren {
    products: Product[]
    order: Order
}


export const OrderStore: React.FC<OrderStoreI> = (props) => {
    const {products, order} = props
    const [storedOrder, setStoredOrder] = React.useState<Order>(order)
    const [storedProducts, setStoredProducts] = React.useState<Record<number, Product>>({} as Record<number, Product>)
    const [storedErrors, setStoredErrors] = React.useState<OrderErrorT>({})

    React.useEffect(() => {
        const _storedProducts: Record<number, Product> = {}
        for (let i = 0; i< products.length; i++) {
            _storedProducts[products[i].id] = products[i]
        }
        setStoredProducts(_storedProducts)
    }, [products])

    React.useEffect(() => {
        setStoredOrder(order)
    }, [order])



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

        resetErrorsHandler()

        const canSet = testOrderProductAvailability(product, quantity, order??EmptyOrder, _order, setOperator)
        /*

        const {products} = _order
        const {products: originalProducts} = order

        const _orderProduct: OrderedProduct | undefined = products.find((p: OrderedProduct) => {return p.productId === product.id})
        const _originalOrderProduct: OrderedProduct | undefined = originalProducts.find((p: OrderedProduct) => {return p.productId === product.id})

        //let selectedOrderProduct = cloneDeep(_orderProduct)
        if (_orderProduct === undefined) {

            const oP: OrderedProduct = {
                productId: product.id,
                quantity: quantity,
                price: product.price
            }
          //  selectedOrderProduct = oP
            products.push(oP)
        } else {
            _orderProduct.quantity = quantity
        }

        const originalQuantity = _originalOrderProduct?.quantity ?? 0
        const orderQuantity = _orderProduct?.quantity

        const diff = orderQuantity - originalQuantity


        console.log('setProductHandler: ',originalQuantity, orderQuantity, product.availableQuantity, diff > product.availableQuantity)

        if (diff <= product.availableQuantity) {
*/

        if (canSet) {

            _storedProducts[product.id] = product


            setStoredProducts(_storedProducts)

            setStoredOrder(_order)
        } else {
          toast.error(`Impossibile aggiungere il prodotto '${product.name}': quantità massima raggiunta (${product.availableQuantity})`, { duration: 3000, position: 'top-right' })
          // setFieldErrorHandler(`product.${product.id}`, 'Quantità supera la disponibilità')
        }
    }


    const addProductHandler = (product: Product, quantity: number) => {
        const _order = cloneDeep(storedOrder ?? {products: []} as Order)

        const _storedProducts = cloneDeep(storedProducts)
        resetErrorsHandler()

        const canAdd = testOrderProductAvailability(product, quantity, order??EmptyOrder, _order, addOperator)
/*

        const {products} = _order
        const {products: originalProducts} = order

        const _orderProduct: OrderedProduct | undefined = products.find((p: OrderedProduct) => {return p.productId === product.id})
        const _originalOrderProduct: OrderedProduct | undefined = originalProducts.find((p: OrderedProduct) => {return p.productId === product.id})
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
        const originalQuantity = _originalOrderProduct?.quantity ?? 0
        const orderQuantity = _orderProduct?.quantity ?? 0

        const diff = orderQuantity - originalQuantity


        console.log('addProductHandler: ',originalQuantity, orderQuantity, product.availableQuantity, diff > product.availableQuantity)


        if (diff <= product.availableQuantity) {
*/
        if (canAdd) {

            _storedProducts[product.id] = product


            setStoredProducts(_storedProducts)

            setStoredOrder(_order)
            toast.success(`Inserito/aggiunto '${product.name}' all'ordine`, { duration: 1200, position: 'top-right' })
        } else {
            toast.error(`Impossibile aggiungere il prodotto '${product.name}' all'ordine: quantità massima raggiunta (${product.availableQuantity})`, { duration: 3000, position: 'top-right' })
            // setFieldErrorHandler(`product.${product.id}`, 'Quantità supera la disponibilità')
        }
    }

    const updateOrderHandled = (order: Order) => {
        setStoredOrder(() => {
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
        setStoredErrors(() => {
            return {} as OrderErrorT
        })
    }

    const resetStoreHandler = () => {
        setStoredOrder(() => {
           // return (order.id === -1 ? EmptyOrder : order)
            return order
        })
        setStoredProducts(() => {
            const _storedProducts: Record<number, Product> = {}
            for (let i = 0; i< products.length; i++) {
                _storedProducts[products[i].id] = products[i]
            }
            return _storedProducts
        })
        resetErrorsHandler()
    }


    const isNewOrderHandler = (): boolean  => {
        return order.id === EmptyOrder.id
    }

    return (
        <OrderContext.Provider
            value={{
                order: storedOrder,
                products: storedProducts??[],
                errors: storedErrors,
                resetStore: resetStoreHandler,
                addProduct: addProductHandler,
                setProduct: setProductHandler,
                deleteProduct: deleteProductHandler,
                updateOrder: updateOrderHandled,
                updateOrderField: updateOrderFieldHandler,
                setFieldError: setFieldErrorHandler,
                resetErrors: resetErrorsHandler,
                isNewOrder: isNewOrderHandler
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
        resetStore: storeContext.resetStore,
        updateOrder: storeContext.updateOrder,
        addProduct: storeContext.addProduct,
        setProduct: storeContext.setProduct,
        deleteProduct: storeContext.deleteProduct,
        updateOrderField: storeContext.updateOrderField,
        setFieldError: storeContext.setFieldError,
        resetErrors: storeContext.resetErrors,
        isNewOrder: storeContext.isNewOrder
    }
}