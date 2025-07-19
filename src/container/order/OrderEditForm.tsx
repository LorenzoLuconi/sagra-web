import { Order, OrderedProductRequest } from "../../api/sagra/sagraSchemas.ts";
import * as React from "react";
import { useState } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Grid, IconButton,
  Paper,
  Stack,
  Switch,
  TextField
} from "@mui/material";
import { AddCircle, PrintOutlined, RemoveCircle, SaveOutlined } from "@mui/icons-material";
import { NumberInput } from "../NumberInput.tsx";
import OrderedProductsEdit from "./OrderedProductsEdit.tsx";


export interface IOrderEdit {
  order?: Order;
}


const OrderEditForm = (props : IOrderEdit) => {

  const {order} = props;

  // FIXME controllare se va bene fare "order ?" per verificare se undefined
  const [customer, setCustomer] = useState(order ? order.customer : "");
  const [takeAway, setTakeAway] = useState(order ? order.takeAway : false);
  const [changed, setChanged] = useState(false);
  const [coperti, setCoperti] = useState(order ? order.serviceNumber : 0);
  const [products, setProducts] = useState([] as OrderedProductRequest[]);

  const incOrAddProduct = (productId: number) => {
    const newOrderedProducts: OrderedProductRequest[] = [];
    let found: boolean = false;
    products.forEach((orderedProduct) => {
      if (orderedProduct.productId === productId) {
        newOrderedProducts.push({
          productId: orderedProduct.productId,
          quantity: orderedProduct.quantity + 1
        });
        found = true;
        setChanged(true);
      } else {
        newOrderedProducts.push({
          productId: orderedProduct.productId,
          quantity: orderedProduct.quantity
        });
      }
    });

    if (!found) {
      newOrderedProducts.push({
        productId: productId,
        quantity: 1
      });
      setChanged(true);
    }

    setProducts(newOrderedProducts);
  };

  const decProduct = (productId: number) => {
    const newOrderedProducts: OrderedProductRequest[] = [];
    let changed: boolean = false;
    products.forEach((orderedProduct) => {
      if (orderedProduct.productId === productId) {
        if (orderedProduct.quantity > 1) {
          newOrderedProducts.push({
            productId: orderedProduct.productId,
            quantity: orderedProduct.quantity - 1
          });
          changed = true;
        }
      } else {
        newOrderedProducts.push({
          productId: orderedProduct.productId,
          quantity: orderedProduct.quantity
        });
      }
    });

    if (changed) {
      setProducts(newOrderedProducts);
      setChanged(true);
    }
  };

  const removeProduct = (productId: number) => {
    const newOrderedProducts: OrderedProductRequest[] = [];
    let changed: boolean = false;

    products.forEach((orderedProduct) => {
      if (orderedProduct.productId !== productId) {
        newOrderedProducts.push({
          productId: orderedProduct.productId,
          quantity: orderedProduct.quantity
        });
      } else {
        changed = true;
      }

      if (changed) {
        setProducts(newOrderedProducts);
        setChanged(true);
      }
    });
  };

  const handleChangeCustomer =
    React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
      setCustomer(event.currentTarget.value);
    }, [setCustomer]
  );

  const handleChangeTakeAway =
    React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
      setTakeAway(event.target.checked);
    }, [setTakeAway]
  );

  const printDisabled  = () : boolean  => {
    // Non abbiamo un ordine salvato oppure è modificato e quindi non ancora salvato
    return ! order || changed;
  }

  const handleChangeCoperti =
    React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
        if ( ! event.currentTarget.value ) {
          setCoperti(0)
        } else {
          // FIXME non c'e' un controllo se il valore è numerico
          const number = Number.parseInt(event.currentTarget.value);
          if ( number >=  0)
            setCoperti(number);
          else
            setCoperti(0)
        }
      }, [setCoperti]
    )

    return (
        <Paper sx={{padding: 2 }}>
        <TextField fullWidth required
          value={customer}
          label="Nome cliente"
          onChange={handleChangeCustomer}
        />
        <Box sx={{ display: "flex", marginTop: 2 }}>

          <TextField type="number" size='small'
            value={coperti}
            label="N. Coperti"
            onChange={handleChangeCoperti}
            disabled={takeAway}
            slotProps={{ htmlInput: { size: 8 } }}
                     sx={{ ml: 0, mr: 2}}
          />
          <FormControlLabel
            label="Asporto"
            control={
              <Switch checked={takeAway} onChange={handleChangeTakeAway} />
            }
          />
        </Box>
        <Stack direction="row" spacing={1} sx={{marginTop: 1, justifyContent: 'center'}}>
          <Button variant="contained" startIcon={<SaveOutlined/>}>Salva</Button>
          <Button disabled={printDisabled()} variant="contained" startIcon={<PrintOutlined/>}>Stampa</Button>
        </Stack>
        </Paper>
    );
}

export default OrderEditForm;