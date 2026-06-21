import * as React from 'react'
import {Order, OrderedProduct, Product} from "../api/sagra/sagraSchemas.ts";
import {ErrorWrapper} from "../api/sagra/sagraFetcher.ts";
import toast from "react-hot-toast";

type QueryParamType = "string" | "number";
type QueryParamValue<TType extends QueryParamType> = TType extends "number" ? number : string;
type QueryObj<TQueryConf extends Record<string, QueryParamType>> = Partial<{
    [TKey in keyof TQueryConf]: QueryParamValue<TQueryConf[TKey]>
}>;

export const getQueryObj = <TQueryConf extends Record<string, QueryParamType>>(
    searchParams: URLSearchParams,
    queryConf: TQueryConf,
): QueryObj<TQueryConf> => {
    const res: Partial<Record<keyof TQueryConf, string | number>> = {}
    // console.log('SearchParams: ', searchParams)
    const qKeys = Object.keys(queryConf) as Array<keyof TQueryConf>;
    for (let k=0; k<qKeys.length; k++) {
        const key = qKeys[k];
        const qq = searchParams.get(key as string);
          console.log('SeachValue: ', qKeys[k], qq);
        if (qq !== null && qq.length > 0) {
            res[key] = queryConf[key] === "number" ? Number(qq) : qq;
        }
    }
    return res as QueryObj<TQueryConf>;
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

// NOTA BENE: de-DE è voluto perché it-IT il separatore migliaia lo metto solo se >= 10.000. Boh!
export const currencyEuro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export const currency = (value : number) : string => {
  return currencyEuro.format(value)
}

export type OrderErrorT = Record<string, string>

interface CheckOrderErrorsOptions {
    nameMandatory?: boolean;
    takeAwayEnabled?: boolean;
    serviceEnabled?: boolean;
}

export const checkOrderErrors = (
    order: Order,
    _productsTable: Record<number, Product>,
    options: CheckOrderErrorsOptions = {},
): OrderErrorT => {
    const res = {} as OrderErrorT
    const {
        nameMandatory = true,
        takeAwayEnabled = true,
        serviceEnabled = true,
    } = options;

    if (nameMandatory && order.customer.length===0) {
        res['customer'] = 'Deve essere inserito il nome del cliente'
    }

    if ( serviceEnabled && (order.serviceNumber === undefined || order.serviceNumber < 0) && !(takeAwayEnabled && order.takeAway)) {
        res['serviceNumber'] = 'Inserire il numero di coperti o selezionare asporto'
    }

    // Check products quantity
    const {products} = order

    if (products.length === 0) {
        res['products'] = "Deve essere presente almeno un prodotto nell'ordine"
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

    } catch (e: unknown) {
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

export const setOperator = (_oldQuantity: number, newQuantity: number): number => {
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

        const originalQuantity = _originalOrderProduct?.quantity ?? 0
        const orderQuantity = selectedOrderProduct?.quantity ?? 0

        const diff = orderQuantity - originalQuantity
        return (diff <= product.availableQuantity)
}

export const manageError = (error: ErrorWrapper<unknown>) => {
    const status = typeof error === "object" && error !== null && "status" in error ? error.status : undefined;
    const payload = typeof error === "object" && error !== null && "payload" in error ? error.payload : undefined;
    console.log('Utils ManageError: ', status, payload)

    if (payload && typeof payload === "object" && "message" in payload) {
        const message = payload.message;
        if (typeof message === "string" && message.length > 0) {
            toast.error(message);
            return;
        }
    }

    if (typeof payload === "string" && payload.length > 0) {
        toast.error(payload);
        return;
    }

    toast.error("Si è verificato un errore inatteso");
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
