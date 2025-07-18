import { Grid, IconButton, Paper, TextField, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { DeleteOutlined } from "@mui/icons-material";
import { currency } from "../utils/index.ts";
import Product from "./Product.tsx";
import { productByIdQuery } from "../api/sagra/sagraComponents.ts";

interface IOrderedProductsEdit {
  products?: OrderedProduct[]
}

const OrderedProductsEdit  = (props:IOrderedProductsEdit) => {
  const products = props.products ? props.products : [];
  return (
    <Paper sx={{mt: 1, p: 0.5}}>
      {products.map((op: OrderedProduct) => {
        return (
          <OrderedProduct productId={op.productId} quantity={op.quantity} price={op.price} />
        )})
      }
    </Paper>
  );
}

interface IOrderedProduct {
  productId: number
  quantity: number
  price? : number
}

const OrderedProduct = (props: IOrderedProduct) => {
  const productConf = productByIdQuery({
    pathParams: { productId: props.productId }
  });

  const productData = useQuery({
    queryKey: productConf.queryKey,
    queryFn: productConf.queryFn,
    staleTime: 1000 * 60
  });

  if ( productData.isFetched ) {
    const product = productData.data

    if ( product ) {
      const price = props.price ? props.price : product.price
      const subTotal = props.quantity * price;

      return (
          <Grid key={product.id} container sx={{ verticalAlign: "center" }} spacing={1}>
            <Grid size={1}>
              <IconButton><DeleteOutlined/></IconButton>
            </Grid>
            <Grid size={2}>
              <TextField size="small" variant="standard" type="number" defaultValue={props.quantity} slotProps={{ htmlInput: { size: 2 } }}></TextField>
            </Grid>
            <Grid size={6}>
              <Typography>{product.name}</Typography>
            </Grid>
            <Grid size={3} sx={{ textAlign: "right"}}>
              <Typography >{currency(subTotal)}</Typography>
            </Grid>

          </Grid>
      )
    }
    else
      return <></>
  }
}

export default OrderedProductsEdit;