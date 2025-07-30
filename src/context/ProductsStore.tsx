import * as React from 'react'
import {Product} from "../api/sagra/sagraSchemas.ts";
import {productByIdQuery, productsSearchQuery} from "../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";

interface ProductsContextI {
    products: Record<number, Product>
}
export const ProductsContext = React.createContext<ProductsContextI>({
    products: {}
})



interface ProductStoreI extends React.PropsWithChildren{
    products: Product[]

}
const buildTable = (products: Product[]): Record<number, Product> => {
    const productsByIdTable: Record<number, Product> = {}
    for (let i = 0; i < products.length; i++) {
        const product = products[i]
        productsByIdTable[product.id] = product
    }
    return productsByIdTable
}


const ProductStore: React.FC<ProductStoreI> = (props) : React.ReactElement => {
    const {products} = props

    return (
        <ProductsContext.Provider value={{products: buildTable(products)}}>
            {props.children}
        </ProductsContext.Provider>
    )
}

export default ProductStore

export const useProducts = () => {
    const productContext = React.useContext(ProductsContext)
    return ({
        products: productContext.products
    })
}