
// import React from 'react'

import {Box, Card, CardActionArea, CardContent, CardMedia, SxProps, Typography, useTheme,} from "@mui/material";
import {Product} from "../../api/sagra/sagraSchemas.ts";
import {currency} from "../../utils";
import {IProductsOrder} from "./IProductsOrder.tsx";
import ProductQuantity from "./ProductQuantity.tsx";
import {AppConf} from "../../AppConf.ts";
import {productBackgroundColor, productAvailable} from "./produtils.ts";

const ProductsOrderCard = (props : IProductsOrder) => {

    const theme = useTheme();
    const {products, addToOrder} = props;


    return (
          <Box sx={{display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 2, rowGap: 2, mt: 2 }} >
            <>
              {
                products.map( (product: Product) =>
                    <Card key={product.id}
                          sx={{ minWidth: 200, maxWidth: 200,
                              backgroundColor: productBackgroundColor(product, theme)
                          }}
                          onClick={(event) => {
                            event.preventDefault();
                            if ( productAvailable(product) )
                              addToOrder(product)}
                          }>

                          {
                              productAvailable(product) ?
                                  <CardActionArea>
                                      <ProductCardImage product={product}/>
                                      <ProductCardContent product={product} />
                                  </CardActionArea>
                                   :<>
                                        <ProductCardImage product={product}/>
                                        <ProductCardContent product={product} />
                                    </>
                          }
                    </Card>
                )
              }
            </>
          </Box>
    )
}

interface IProductsOrderCardProps {
    product: Product;
}
const ProductCardContent = (props: IProductsOrderCardProps) => {
    const {product} = props;

    return (
        <CardContent sx={{ textAlign: "center" }}>
            <Typography sx={{fontWeight: 500}}>{product.name}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5}}>
                <Typography>{currency(product.price)}</Typography>
                <ProductQuantity product={product}/>
            </Box>
        </CardContent>
    )

}

const ProductCardImage = (props: IProductsOrderCardProps) => {
    const {product} = props;
    const showImages = AppConf.showProductImages()

    const style: SxProps = {
        height: 100
    }
    if ( ! productAvailable(product) ) {
        style['filter'] = 'brightness(60%)';
    }

    if ( showImages ) {
        return (
            <CardMedia
                sx={{ ...style }}
                image={`/prodotti/${product.name}.png`}
                title={`${product.name}`}
            />
        )
    }

    return <></>
}

export default ProductsOrderCard;
