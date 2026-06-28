
// import React from 'react'

import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    SxProps,
    Typography,
    useTheme,
} from "@mui/material";
import {Product} from "../../api/sagra/sagraSchemas.ts";
import {currency} from "../../utils";
import {IProductsOrder} from "./IProductsOrder.tsx";
import ProductQuantity from "./ProductQuantity.tsx";
import {useAppConf} from "../../AppConf.ts";
import {productBackgroundColor, productAvailable} from "./produtils.ts";

const ProductsOrderCard = (props : IProductsOrder) => {

    const theme = useTheme();
    const {products, addToOrder} = props;

    return (
          <Box
              sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))',
                  mt: 2,
                  width: '100%',
              }}
          >
            <>
              {
                products.map( (product: Product) =>
                    <Card key={product.id}
                          sx={{ minWidth: 0,
                              backgroundColor: productBackgroundColor(product, theme)
                          }}
                          onClick={(event) => {
                            event.preventDefault();
                            if ( productAvailable(product) )
                              addToOrder(product)}
                          }>
                            <>
                          {
                              productAvailable(product) ?
                                  <CardActionArea sx={{height: '100%'}}>
                                      <ProductCardImage product={product}/>
                                      <ProductCardContent product={product} />
                                  </CardActionArea>
                                   :<>
                                        <ProductCardImage product={product}/>
                                        <ProductCardContent product={product} />
                                    </>
                          }
                            </>
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
    const {showProductImages} = useAppConf();

    const style: SxProps = {
        height: 100
    }
    if ( ! productAvailable(product) ) {
        style['filter'] = 'brightness(60%)';
    }

    if ( showProductImages ) {
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
