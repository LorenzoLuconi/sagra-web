import * as React from "react"
import {Order, OrderedProduct, Product} from "../api/sagra/sagraSchemas.ts";
import {ErrorWrapper} from "../api/sagra/sagraFetcher.ts";
import toast from "react-hot-toast";
import {redirect} from "react-router";

export const getQueryObj = (searchParams: URLSearchParams, queryConf: Record<string, string>) => {
    const res: any = {}
    // console.log('SearchParams: ', searchParams)
    const qKeys = Object.keys(queryConf);
    for (let k=0; k<qKeys.length; k++) {
        const qq = searchParams.getAll(qKeys[k]);
          console.log('SeachValue: ', qKeys[k], qq);
        if (qq !== undefined && qq.length > 0) {
            res[qKeys[k]] = qq;
        }
    }
    return res;
}

export const FULL_DATE_CONF: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
}

export const TIME_CONF: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
}


export const convertDate = (locale: string, date: Date, dataConversion?: Intl.DateTimeFormatOptions): string => {
    const o = dataConversion ?? {
        year: "numeric",
        month: "long",
        day: "numeric"
    } as Intl.DateTimeFormatOptions
    //  console.log('DataConverion?: ', o, locale, date);
    return new Intl.DateTimeFormat(locale, o).format(date);
}

export const currencyEuro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

export const currency = (value : number) : string => {
  return currencyEuro.format(value)
}

export type OrderErrorT = Record<string, string>

export const checkOrderErrors = (order: Order, productsTable: Record<number, Product>): OrderErrorT => {
    const res = {} as OrderErrorT

    if (order.customer.length===0) {
        res['customer'] = 'Bisogna specificare il nome del cliente'
    }

    if ( (order.serviceNumber === undefined || order.serviceNumber < 0) && !order.takeAway) {
        res['serviceNumber'] = 'Inserire il numero di coperti'
    }

    // Check products quantity
    const {products} = order

    if (products.length === 0) {
        res['products'] = 'Bisogna specificare almeno una portata'
    }

/*
    for (let i = 0; i<products.length; i++) {
        const {productId, quantity} = products[i]
        const fullProduct = productsTable[productId]
        if (fullProduct.sellLocked) {
            res[`product.${fullProduct.id}`] = `La vendita del prodotto ${fullProduct.name} è stato bloccata`
        } else {
            if (fullProduct.availableQuantity < quantity) {
                res[`product.${fullProduct.id}`] = `Il prodotto ${fullProduct.name} ha superato la disponibità ${fullProduct.availableQuantity}`
            }
        }
    }
*/
    return res
}

export  async function  manageErrorResponse<TError>(response: Response)  {
    const {status} = response;

    let eW: ErrorWrapper<TError>
    // let error: ErrorResponse = {} as ErrorResponse
    console.log('ManageResponse: ---- ', response.status)
      try {
        eW = {
            status: response.status as unknown,
            payload: await response.json()
        } as ErrorWrapper<TError>

    } catch (e: Error) {
        console.log('Catch: ', e)
        eW =  {
            status: status as unknown,
            payload: `${status}`
        } as ErrorWrapper<TError>
    }


    console.log('----', eW)

    throw eW
}

export const addOperator = (oldQuantity: number, newQuantity: number): number => {
    return oldQuantity+newQuantity
}

export const setOperator = (oldQuantity: number, newQuantity: number): number => {
    return newQuantity
}

export const testOrderProductAvailability = (product: Product, quantity: number, originalOrder: Order, storedOrder: Order, operator: (oldQuantity: number, newQuantity: number) => number): boolean => {

        const {products} = storedOrder
        const {products: originalProducts} = originalOrder

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


            _orderProduct.quantity = operator(_orderProduct.quantity, quantity)
        }

        console.log('testOrderProductAvailability: ', product.name, selectedOrderProduct?.quantity, product.availableQuantity, selectedOrderProduct?.quantity > product.availableQuantity)
        const originalQuantity = _originalOrderProduct?.quantity ?? 0
        const orderQuantity = _orderProduct?.quantity ?? 0

        const diff = orderQuantity - originalQuantity
        return (diff <= product.availableQuantity)
}

export const manageError = (error: ErrorWrapper<unknown>) => {
    const {status, payload} = error.stack
    console.log('Status: ', status, payload)
    switch (status) {
        case 401: {
            toast.error('Verrai rediretto alla pagina di login')
            toast.error('Utente non ha il permesso di accedere alla risorsa richiesta')
            return redirect('/')
            break
        }
        default:
            toast.error(`${payload.message}`)
    }

}


export const headerFromToken = (token?: string) => {
    if (token) {
        return (
            {
                'authorization': `Bearer ${token}`
            }
        )
    } else {
        return ({})
    }
}

const getStorageValue = (key: string, defaultValue?: unknown) => {
    // getting stored value
    const saved = localStorage.getItem(key) ?? undefined;
    console.log('GetStorageValue: ', typeof saved, (saved !== undefined))
    const initial = (saved !== undefined && saved !== 'undefined') ? JSON.parse(saved) : undefined;
    return initial ?? defaultValue;
}

export const useLocalStorage = (key: string, defaultValue?: unknown) => {
    const [value, setValue] = React.useState(() => {
        return getStorageValue(key, defaultValue);
    });

    React.useEffect(() => {
        // storing input name
        if (value !== undefined) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }, [key, value]);

    return [value, setValue];
};