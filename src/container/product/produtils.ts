import {Product} from "../../api/sagra/sagraSchemas.ts";
import {Theme} from "@mui/material";

export const productAvailable = (product: Product) => {
    return  product.availableQuantity > 0 && ! product.sellLocked;
}

export const productBackgroundColor = (product: Product, theme: Theme, defaultColor?: string) => {

    if ( ! productAvailable(product)) {
        return theme.sagra.productSoldOut;
    } else if ( product.availableQuantity < 10 ) {
        return theme.sagra.productAlmostSoldOut;
    } else {
        return defaultColor?? theme.palette.background.default;
    }
}