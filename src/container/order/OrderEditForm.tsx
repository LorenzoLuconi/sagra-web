import {ErrorResource, Order, OrderedProductRequest, OrderRequest} from "../../api/sagra/sagraSchemas.ts";
import * as React from "react";
import {useState} from "react";
import {Box, Button, FormControlLabel, Paper, Stack, Switch, TextField} from "@mui/material";
import {SaveOutlined} from "@mui/icons-material";
import {useOrderStore} from "../../context/OrderStore.tsx";
import {checkOrderErrors} from "../../utils";
import toast from "react-hot-toast";
import {cloneDeep, isEqual} from "lodash";
import {useMutation} from "@tanstack/react-query";
import {fetchOrderCreate, fetchOrderUpdate, orderByIdQuery} from "../../api/sagra/sagraComponents.ts";
import {useNavigate} from "react-router";
import OrderPrint from "./OrderPrint.tsx";
import {queryClient} from "../../main.tsx";


export interface IOrderEdit {
  order?: Order;
  update: boolean
}


const OrderEditForm: React.FC<IOrderEdit> = (props) => {
    const {order: storedOrder, update} = props

  const {order, updateOrderField, products: productsTable, errors, setFieldError, resetErrors} = useOrderStore();
  const navigate = useNavigate()
  // FIXME controllare se va bene fare "order ?" per verificare se undefined
  const [customer, setCustomer] = useState(order?.customer ?? "");
  const [takeAway, setTakeAway] = useState(order?.takeAway ?? false);
  const [changed, setChanged] = useState(false);
  const [coperti, setCoperti] = useState(order?.serviceNumber ?? 0);
  const [products, setProducts] = useState([] as OrderedProductRequest[]);

  const differences = !isEqual(storedOrder, order)

    const updateOrder = useMutation({
        mutationFn: (data: OrderRequest) => {
            return fetchOrderUpdate({body: data, pathParams: {orderId: storedOrder?.id??0}})
        },
        onError: (error, variables: OrderRequest) => {

            const errors: ErrorResource = error as ErrorResource

            toast.error(errors.message?? `Si è verificato un errore per l'ordine del client ${variables.customer}`)
            errors.invalidValues!.map((invalidValue) => {
                const {message, value, field} = invalidValue
                if (field !== undefined) {
                    const spString = field.match(/\[([^\]]+)\]/);
                    const index = +spString[1]
                    const productId = variables.products[index].productId
                    setFieldError(`product.${productId}`, message?? `Errore per il prodotto ${productsTable[productId].name}`)
                    toast.error(`Errore nella quantità (${value}) del prodotto ${productsTable[productId].name}`)
                }

            })
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onSuccess: (order: Order, variables: OrderRequest,context: unknown) => {

            const fetchOrderConf = orderByIdQuery({pathParams: {orderId: order.id}})

            queryClient.invalidateQueries({queryKey: fetchOrderConf.queryKey}).then(() => {

                toast.success(`Ordine per cliente ${order.customer} modificato con successo`)
                navigate(`/orders/${order.id}`)
            })

        }
    })


  const createOrder = useMutation({
      mutationFn: (data: OrderRequest) => {
              return fetchOrderCreate({body: data})
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onError: (error, variables: OrderRequest) => {


          const errors: ErrorResource = error as ErrorResource

          toast.error(errors.message?? `Si è verificato un errore per l'ordine del client ${variables.customer}`)
          errors.invalidValues!.map((invalidValue) => {
              const {message, value, field} = invalidValue
              if (field !== undefined) {
                  const spString = field.match(/\[([^\]]+)\]/);
                  const index = +spString[1]
                  const productId = variables.products[index].productId
                  setFieldError(`product.${productId}`, message?? `Errore per il prodotto ${productsTable[productId].name}`)
                  toast.error(`Errore nella quantità (${value}) del prodotto ${productsTable[productId].name}`)
              }

          })
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSuccess: (order: Order, variables: OrderRequest,context: unknown) => {
          toast.success(`Ordine per cliente ${order.customer} creato con successo`)
          navigate(`/orders/${order.id}`)
      }
  })



  React.useEffect(() => {
    if (order !== undefined) {
      setCoperti(order.serviceNumber)
    }
  }, [order])


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

  // INUTILE, perchè la quantità o si aggiunge 1 (inc) o si setta per l'attuale form
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
            updateOrderField('customer', event.currentTarget.value)
          }, [setCustomer]
      );

  const handleChangeTakeAway =
      React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
            setTakeAway(event.target.checked);
        updateOrderField('takeAway', event.target.checked)
          }, [setTakeAway]
      );

  const printDisabled  = () : boolean  => {
    // Non abbiamo un ordine salvato oppure è modificato e quindi non ancora salvato
    return ! order || changed;
  }

  const handleChangeCoperti =
      React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
        let value = 0;
            if ( ! event.currentTarget.value ) {
              value = 0
            } else {
              // FIXME non c'e' un controllo se il valore è numerico
              const number = Number.parseInt(event.currentTarget.value);
              if ( number >=  0)
                value = number
              else
                value = 0
            }
            setCoperti(value);
            updateOrderField('serviceNumber', value)
          }, [setCoperti]
      )

  return (
      <Paper sx={{padding: 2 }}>
        <TextField fullWidth required
                   name={'customer'}
                   value={customer}
                   error={errors['customer'] !== undefined}
                   label="Nome cliente"
                   onChange={handleChangeCustomer}
        />
        <Box sx={{ display: "flex", marginTop: 2 }}>

          <TextField type="number" size='small'
                     value={coperti}
                     name={'serviceNumber'}
                     error={errors['serviceNumber'] !== undefined}
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
          <Button
              disabled={!differences}
              variant="contained"
              startIcon={<SaveOutlined/>}
              onClick={() => {
                resetErrors()
                console.log('Order to save: ', order)
                if (order !== undefined) {
                    const orderErrors = checkOrderErrors(order, productsTable)
                    const errorFields = Object.keys(orderErrors)

                    errorFields.forEach((eK: string) => {
                        setFieldError(eK, orderErrors[eK])
                        toast.error(orderErrors[eK])
                    })

                    if (errorFields.length === 0) {

                            const orderToSend: OrderRequest = {} as OrderRequest
                            orderToSend.customer = order.customer
                            orderToSend.takeAway = order.takeAway
                            orderToSend.serviceNumber = order.takeAway ? 0 : order.serviceNumber
                            orderToSend.note = order.note
                            orderToSend.products = cloneDeep(order.products)

                            console.log('Order2Send: ', orderToSend)
                        if (update) {
                            updateOrder.mutate(orderToSend)
                        } else {
                            createOrder.mutate(orderToSend)

                        }
                    }

                }
              }}
          >
            Salva
          </Button>
            {order && <OrderPrint disabled={differences} order={order} products={productsTable}/>}
        </Stack>
      </Paper>
  );
}

export default OrderEditForm;