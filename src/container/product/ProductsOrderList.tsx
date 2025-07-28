// import React from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Product } from "../../api/sagra/sagraSchemas.ts";
import { currency } from "../../utils";
import ProductQuantity from "./ProductQuantity.tsx";
import { IProductsOrder, productAvailable } from "./IProductsOrder.tsx";

const ProductsOrderList = (props: IProductsOrder) => {
  const {products, addToOrder} = props;

  return (
      <form>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome Prodotto</TableCell>
              <TableCell sx={{ width: 100 }} align="right">
                Prezzo
              </TableCell>
              <TableCell sx={{ width: 100 }}>Quantità</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            <>
            {products.map((product: Product) => {
              return (
                <TableRow
                  key={product.id}
                  sx={(theme) => ({
                    minWidth: 200,
                    cursor: productAvailable(product) ? 'pointer' : 'default',
                    backgroundColor: (! productAvailable(product) ? theme.palette.background.productSoldOut : ( product.availableQuantity < 10 ? theme.palette.background.productAlmostSoldOut : theme.palette.background.productCard))
                  })}
                  onClick={() => {
                    if ( productAvailable(product) )
                      addToOrder(product)
                  }}
                >
                  <TableCell sx={{ fontSize: "1.0em" }}>
                    {product.name}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: "1.0em" }}>
                    {currency(product.price)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.0em" }}>
                    <ProductQuantity product={product} />
                  </TableCell>
                </TableRow>
              );
            })}
            </>
          </TableBody>
        </Table>
      </form>
    );
}





export default ProductsOrderList;
