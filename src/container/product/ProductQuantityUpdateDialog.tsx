import { Product, ProductQuantityUpdate } from "../../api/sagra/sagraSchemas";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, TextField, Typography
} from "@mui/material";
import {
  fetchProductInitQuantity, fetchProductSellLock, fetchProductSellUnlock, fetchProductUpdateQuantity,
  ordersCountQuery,
  OrdersSearchQueryParams, productsSearchQuery
} from "../../api/sagra/sagraComponents.ts";
import { useMutation, useQuery } from "@tanstack/react-query";
import {CancelOutlined, LockOpenOutlined, LockOutlined, SaveOutlined} from "@mui/icons-material";
import { useState } from "react";
import * as React from "react";
import { queryClient } from "../../main.tsx";
import toast from "react-hot-toast";

interface IProductQuantityUpdateDialog {
  product: Product;
  closeDialogHandler: () => void;
}
const ProductQuantityUpdateDialog = (props: IProductQuantityUpdateDialog) => {
  const { product } = props;

  const [quantity, setQuantity] = useState<number|undefined>(undefined);
  const [errorQuantity, setErrorQuantity] = useState(false);

  // const resetState = () => {
  //   setQuantity(0);
  //   setErrorQuantity(false);
  // }

  const handleChangeQuantity =
    React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
      const value = Number.parseInt(event.target.value)
      if ( ! isNaN(value)) {
        setQuantity(value);
      } else {
        setQuantity(undefined);
      }
    }, [setQuantity],
  );

  const productSearchQueryConf = productsSearchQuery({});

  const productInitQuantity = useMutation({
    mutationFn: () => {
      return fetchProductInitQuantity({
        pathParams: { productId: product.id },
        body: { quantityVariation: quantity } as ProductQuantityUpdate
      });
    },
    onSuccess: (p) => {
      queryClient
        .invalidateQueries({ queryKey: productSearchQueryConf.queryKey })
        .then(() => {
          toast.success(`Quantità disponibile per '${p.name}' impostata a ${p.initialQuantity} `);
          props.closeDialogHandler();
        });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const productUpdateQuantity = useMutation({
    mutationFn: () => {
      return fetchProductUpdateQuantity({
        pathParams: { productId: product.id },
        body: { quantityVariation: quantity } as ProductQuantityUpdate
      });
    },
    onSuccess: (p) => {
      queryClient
        .invalidateQueries({ queryKey: productSearchQueryConf.queryKey })
        .then(() => {
          toast.success(`Quantità disponibile variata '${p.name}' di ${quantity}, nuova disponibilità: ${p.availableQuantity}`);
          props.closeDialogHandler();
        });
    },
    onError: (error: Error) => {
      setErrorQuantity(true)
      toast.error(error.message);
    },
  });

  const productSellUnlock = useMutation({
    mutationFn: () => {
      return fetchProductSellUnlock({
        pathParams: { productId: product.id },
      });
    },
    onSuccess: (p) => {
      queryClient
          .invalidateQueries({ queryKey: productSearchQueryConf.queryKey })
          .then(() => {
            toast.success(`Il prodotto '${p.name}' è stato sbloccato ed è vendibile`);
            props.closeDialogHandler();
          });
    },
    onError: (error: Error) => {
      setErrorQuantity(true)
      toast.error(error.message);
    },
  });

  const productSelLock = useMutation({
    mutationFn: () => {
      return fetchProductSellLock({
        pathParams: { productId: product.id },
      });
    },
    onSuccess: (p) => {
      queryClient
          .invalidateQueries({ queryKey: productSearchQueryConf.queryKey })
          .then(() => {
            toast.success(`Il prodotto '${p.name}' è stato bloccato e non è più vendibile`);
            props.closeDialogHandler();
          });
    },
    onError: (error: Error) => {
      setErrorQuantity(true)
      toast.error(error.message);
    },
  });

  const ordersCountSearchParam = () => {
    const searchParam = {} as OrdersSearchQueryParams;
    const date = new Date();

    searchParam.created = `${date.getFullYear()}-${zeroPad(date.getMonth()+1)}-${zeroPad(date.getDate())}`;
    console.log(searchParam.created);

    return searchParam;
  };

  const formInitialQuantity = () => {
    if ( ! product || ! product.id )
      return <></>

    return (
      <>
        <ProductQuantityInfo product={product} />
        <Alert severity="warning">Non sono presenti degli ordini in data odierna, pertanto la quantità inserita vale come quantità assoluta iniziale</Alert>
        <Box sx={{mt: 2, ml: 2}}>
          <TextField
            type="number"
            required
            label="Quantità iniziale"
            value={quantity !== undefined ? quantity : ''}
            onChange={handleChangeQuantity}
            error={ errorQuantity }
            slotProps={{ htmlInput: { size: 10, min: 0 } }}
            placeholder={product.initialQuantity + ""}
            helperText="Inserire il valore assoluto, maggiore di 0, di quantità disponibile prodotto"
          />
        </Box>
      </>
    )
  }

  const formUpdateQuantity = () => {
    if ( ! product || ! product.id )
      return <></>

    return (
      <>
        <ProductQuantityInfo product={product} />
        <Alert severity="warning">Sono presenti degli ordini in data odierna, pertanto si può variare la quantità indicando un valore positivo o negativo</Alert>
        <Box sx={{mt: 2, ml: 2}}>
          <TextField
            type="number"
            required
            label="Variazione quantità"
            value={quantity !== undefined ? quantity : ''}
            error={errorQuantity}
            onChange={handleChangeQuantity}
            slotProps={{ htmlInput: { size: 10 } }}
            helperText="Indicare la varizazione di quantità: esempio 10 o -10"
          />
        </Box>
      </>
    )
  }

  const commonButtons = () => {
    return (
        <>
          {
            product.sellLocked ?
                <Button variant='contained' color="success" startIcon={<LockOpenOutlined/>}
                        onClick={ () => productSellUnlock.mutate()}
                >Sblocca</Button>
                : <Button variant='contained' color="warning" startIcon={<LockOutlined />}
                          onClick={ () => productSelLock.mutate()}>Blocca</Button>
          }
          <Button variant="contained" startIcon={<CancelOutlined/>}
                  onClick={props.closeDialogHandler}>Annulla</Button>
        </>
    )
  }

  // FIXME attenzione gestire la cache o invalidazione ogni volta che si crea un ordine
  const ordersCountConf = ordersCountQuery({
    queryParams: ordersCountSearchParam(),
  });
  const ordersCount = useQuery({
    queryKey: ordersCountConf.queryKey,
    queryFn: ordersCountConf.queryFn,
  });

  if (ordersCount.isLoading) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (ordersCount.isError) {
    return (
      <Alert severity="error">
        Si è verificato un errore prelevando contando gli ordini
      </Alert>
    );
  }

  const count = ordersCount.data;

  if ( count ) {
    const initQuantity = count.count == 0

    return (
      <Dialog open={product.id !== undefined}>
        { initQuantity ?
          <>
            <DialogTitle>Inizializzazione quantità disponibile prodotto</DialogTitle>
            <DialogContent>{formInitialQuantity()}</DialogContent>
            <DialogActions>
              <Button variant="contained" startIcon={<SaveOutlined />}
                      onClick={ () => {
                        if ( quantity !== undefined && quantity > 0 )
                          productInitQuantity.mutate()
                        else
                          setErrorQuantity(true)
                      }}
              >Inizializza Quantità</Button>
              { commonButtons() }
            </DialogActions>
          </>
          :
          <>
            <DialogTitle>Variazione quantità disponibile prodotto</DialogTitle>
            <DialogContent>{formUpdateQuantity()}</DialogContent>
            <DialogActions>
              <Button variant="contained" startIcon={<SaveOutlined />}
                      onClick={ () => {
                        if ( quantity !== undefined && quantity !== 0 )
                          productUpdateQuantity.mutate()
                        else
                          setErrorQuantity(true)
                      }}
              >Varia Quantità</Button>
              { commonButtons() }
            </DialogActions>
          </>
        }
      </Dialog>
    );
  }
};



interface IProductQuantityInfo {
  product: Product;
}
const ProductQuantityInfo = (props : IProductQuantityInfo) => {
  return (
    <>
      <FieldValue field="Prodotto" value={props.product.name} />
      <FieldValue field="Quantità iniziale" value={props.product.initialQuantity} />
      <FieldValue field="Quantità disponibile" value={props.product.availableQuantity} />
    </>
  )
}

interface IFieldValue {
  field: string
  value: any
}

const FieldValue = (props: IFieldValue) => {
  return (
    <Box sx={{ display: "flex", mb: 1 }} >
      <Typography sx={{fontSize: '0.9em', width: '150px'}}>{props.field}:</Typography>
      <Typography sx={{fontSize: '1.0em', fontWeight: 500}}>{props.value}</Typography>
    </Box>
  )
}

const zeroPad = (val : number) => (val + "").padStart(2, "0");

export default ProductQuantityUpdateDialog;