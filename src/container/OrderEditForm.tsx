import { Order, OrderedProductRequest } from "../api/sagra/sagraSchemas.ts";
import * as React from "react";
import { useState } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  TextField
} from "@mui/material";
import { PrintOutlined, SaveOutlined } from "@mui/icons-material";


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

  const handleChangeCoperti =
    React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
        if ( ! event.currentTarget.value ) {
          setCoperti(0)
        } else {
          // FIXME non c'e' un controllo se il valore è numerico
          setCoperti(Number.parseInt(event.currentTarget.value));
        }
      }, [setCoperti]
    );

  return (
      <form>
        <TextField fullWidth required
          value={customer}
          label="Nome cliente"
          onChange={handleChangeCustomer}
        />
        <Box sx={{ display: "flex", marginTop: 2 }}>
          <FormControlLabel
            label="Asporto"
            control={
              <Switch checked={takeAway} onChange={handleChangeTakeAway} />
            }
          />
          <TextField
            value={coperti}
            label="Numero Coperti"
            onChange={handleChangeCoperti}
            disabled={takeAway}
          />
        </Box>
        <Box sx={{ display: 'flex', marginTop: 1, justifyContent: 'center' }}>
          <Button variant="contained" startIcon={<SaveOutlined/>}>Salva</Button>
          <Button variant="contained" disabled={!order} startIcon={<PrintOutlined/>}>Stampa</Button>
        </Box>
      </form>
  );
};

export default OrderEditForm;