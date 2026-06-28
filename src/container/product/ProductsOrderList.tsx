import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { Product } from "../../api/sagra/sagraSchemas.ts";
import { currency } from "../../utils";
import ProductQuantity from "./ProductQuantity.tsx";
import { IProductsOrder } from "./IProductsOrder.tsx";
import {productBackgroundColor, productAvailable} from "./produtils.ts";

const ProductsOrderList = (props: IProductsOrder) => {
    const {products, addToOrder} = props;

    return (
      <TableContainer>
        <Table size={'medium'} sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 'auto' }}>Nome Prodotto</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', width: '4.75rem' }} align="right">
                Prezzo
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', width: '4.75rem' }} align="right">Quantità</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            <>
            {products.map((product: Product) => {
              return (
                <TableRow hover={productAvailable(product)}
                  key={product.id}
                  sx={(theme) => ({
                    cursor: productAvailable(product) ? 'pointer' : 'default',
                    backgroundColor: productBackgroundColor(product, theme)
                  })}
                  onClick={() => {
                    if ( productAvailable(product) )
                      addToOrder(product)
                  }}
                >
                  <TableCell sx={{ fontSize: "1.0em", overflowWrap: 'anywhere' }}>
                    {product.name}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: "1.0em", whiteSpace: 'nowrap' }}>
                    {currency(product.price)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: "1.0em", whiteSpace: 'nowrap' }}>
                    <ProductQuantity product={product} />
                  </TableCell>
                </TableRow>
              );
            })}
            </>
          </TableBody>
        </Table>
      </TableContainer>
    );
}





export default ProductsOrderList;
