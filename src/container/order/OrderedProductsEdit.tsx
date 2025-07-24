import * as React from 'react'

import {Grid, IconButton, Paper, TextField, Typography} from "@mui/material";
import {DeleteOutlined} from "@mui/icons-material";
import {currency} from "../../utils";
import {OrderedProduct, Product as ProductAPI} from '../../api/sagra/sagraSchemas.ts'
import {useOrderStore} from "../../context/OrderStore.tsx";
import toast from "react-hot-toast";

interface IOrderedProductsEdit {
  products?: OrderedProduct[]
}

const OrderedProductsEdit  = (props:IOrderedProductsEdit) => {
    const {order} = useOrderStore()

  const products = order?.products ?? []


  let prodElements;
  if (products.length > 0) {
          prodElements = products.map((op: OrderedProduct, idx: number) => {
            return (
              <OrderedProductItem key={idx} productId={op.productId} quantity={op.quantity} price={op.price} />
            )
          });
  } else {
    prodElements = (
      <Typography sx={{textAlign: 'center'}}>Nessun prodotto in ordine</Typography>
    )
  }

  return (
    <Paper sx={{ mt: 1, p: 0.5 }}>
      {prodElements}
    </Paper>
  )
}

interface IOrderedProduct {
  productId: number
  quantity: number
  price? : number
}


interface OrderedProductItemViewI {
    product: ProductAPI
    quantity: number
    price?: number
}

const OrderedProductItemView: React.FC<OrderedProductItemViewI> = (props) => {
    const {errors, setFieldError} = useOrderStore()
    const {product, quantity} = props
    const {setProduct, deleteProduct} = useOrderStore()
    const [quantityValue, setQuantityValue] = React.useState<number>(props.quantity)


    React.useEffect(() => {
        setQuantityValue(quantity)
    }, [quantity])


    const price = props.price ? props.price : product.price
    const subTotal = props.quantity * price;
    return (

        <Grid key={product.id} container sx={{ alignItems: "center" }} spacing={1}>
            <Grid size={1}>
                <IconButton
                    onClick={() => {
                        deleteProduct(product)
                    }}
                >
                    <DeleteOutlined/>
                </IconButton>
            </Grid>
            <Grid size={2}>
                <TextField
                    size="small"
                    variant="standard"
                    type="number"
                    aria-valuemin={1}
                    name={`product.${product.id}`}
                    error={errors[`product.${product.id}`] !== undefined}
                    value={quantityValue}
                    onChange={(e) => {

                        if (e.target.value <=0) {
                            toast.error(`Quantità deve essere positiva`)
                            setFieldError(`product.${product.id}`, 'Quantità deve essere positiva')
                        } else {

                            if (e.target.value <= product.availableQuantity) {
                                setProduct(product, +e.target.value)
                            } else {
                                toast.error(`Quantità supera la disponibilità (${product.availableQuantity})`)
                                setFieldError(`product.${product.id}`, 'Quantità supera la disponibilità')
                            }
                        }
                    }}
                    slotProps={{ htmlInput: { size: 2, min: 1 } }}/>
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


const OrderedProductItem = (props: IOrderedProduct) => {

    const {products, order} = useOrderStore()

    const product = products[props.productId]

    if ( product ) {
        return <OrderedProductItemView product={product} quantity={props.quantity} price={props.price}/>
    }
    else
      return <></>

}

export default OrderedProductsEdit;