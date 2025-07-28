
// import React from 'react'

import {
  Box,
  Card, CardActionArea,
  CardContent, CardMedia,
  Typography,
} from "@mui/material";
import { Product } from "../../api/sagra/sagraSchemas.ts";
import { currency } from "../../utils";
import { IProductsOrder, productAvailable } from "./IProductsOrder.tsx";
import ProductQuantity from "./ProductQuantity.tsx";

const ProductsOrderCard = (props : IProductsOrder) => {

    const {products, addToOrder} = props;
    return (
          <Box sx={{display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 2, rowGap: 2, mt: 2 }} >
            <>
              {
                products.map( (product: Product) =>
                    <Card key={product.id}
                          sx={(theme) => ({
                            minWidth: 200,
                            maxWidth: 200,
                            backgroundColor: (! productAvailable(product) ? theme.palette.background.productSoldOut : ( product.availableQuantity < 10 ? theme.palette.background.productAlmostSoldOut : theme.palette.background.productCard))
                          })}
                          onClick={(event) => {
                            event.preventDefault();
                            if ( productAvailable(product) )
                              addToOrder(product)}
                          }>
                      <CardActionArea disableRipple={!productAvailable(product)} sx={{cursor: productAvailable(product) ? 'pointer' : 'default'}}>
                        <CardMedia
                            sx={{ height: 100 }}
                            image={`/prodotti/${product.name}.png`}
                            title={`${product.name}`}
                        />
                        <CardContent sx={{textAlign: 'center'}}>
                          <Typography sx={{fontWeight: 500}}>{product.name}</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5}}>
                            <Typography>{currency(product.price)}</Typography>
                            <ProductQuantity product={product}/>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                )
              }
            </>
          </Box>
    )
}

export default ProductsOrderCard;
