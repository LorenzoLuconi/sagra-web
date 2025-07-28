import {ErrorResource, Order, OrderRequest} from "../../api/sagra/sagraSchemas.ts";
import * as React from "react";
import {useState} from "react";
import {Box, Button, FormControlLabel, Stack, Switch, TextField} from "@mui/material";
import { CancelOutlined, SaveOutlined } from "@mui/icons-material";
import {useOrderStore} from "../../context/OrderStore.tsx";
import {checkOrderErrors} from "../../utils";
import toast from "react-hot-toast";
import { cloneDeep, isEqual } from "lodash";
import {useMutation} from "@tanstack/react-query";
import {
  fetchOrderCreate,
  fetchOrderUpdate,
  orderByIdQuery,
  productsSearchQuery
} from "../../api/sagra/sagraComponents.ts";
import {useNavigate} from "react-router";
import OrderPrint from "./OrderPrint.tsx";
import {queryClient} from "../../main.tsx";
import {ErrorWrapper} from "../../api/sagra/sagraFetcher.ts";


export interface OrderEditProps {
  order: Order;
}


const OrderEditForm: React.FC<OrderEditProps> = (props) => {
  const {order: storedOrder} = props

  const {order, updateOrderField, products: productsTable, errors, setFieldError, resetErrors, resetStore} = useOrderStore();
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(order?.customer ?? "");
  const [takeAway, setTakeAway] = useState(order?.takeAway ?? false);
  const [coperti, setCoperti] = useState(order?.serviceNumber ?? 0);
  const [note, setNote] = useState(order?.note ?? '');

  const differences = !isEqual(storedOrder, order)
  console.log("Calcolo differenze: " + differences);

  const manageError = (error: ErrorWrapper<unknown>) => {
      const {status, payload} = error.stack

      console.log('Status: ', status, payload)

      toast.error(`${payload.message}`)

      switch (status) {
          case 450: {
              const {invalidProducts} = payload
              invalidProducts!.map((product) => {
                  console.log('Error: ', product)
                  setFieldError(`product.${product.productId}`, `${product.message}`)
                  toast.error(`${productsTable[product.productId].name} ${product.message}`)
              })
          }

      }
  }

  const productsSearchConf = productsSearchQuery({});


    const updateOrder = useMutation({
      mutationFn: (data: OrderRequest) => {
          return fetchOrderUpdate({body: data, pathParams: {orderId: storedOrder?.id??0}})
      },
      onError: (error, variables: OrderRequest) => {
          console.log('error: ', error as ErrorWrapper<unknown>)

          const netError = error as ErrorWrapper<unknown>

          manageError(netError)

      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSuccess: (order: Order) => {

          const fetchOrderConf = orderByIdQuery({pathParams: {orderId: order.id}})

          queryClient.invalidateQueries({queryKey: fetchOrderConf.queryKey}).then(() => {
            queryClient.invalidateQueries({queryKey: productsSearchConf.queryKey}).then(() => {
              toast.success(`Ordine per cliente ${order.customer} modificato con successo`)
              navigate(`/orders/${order.id}`)
            })
          })

      }
  })


  const createOrder = useMutation({
      mutationFn: (data: OrderRequest) => {
              return fetchOrderCreate({body: data})
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onError: (error, variables: OrderRequest) => {

    console.log('error: ', error, error as ErrorWrapper<unknown>)
          const errors: ErrorResource = error as ErrorResource

          manageError(errors as ErrorWrapper<unknown>)
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSuccess: (order: Order) => {
          toast.success(`Ordine per cliente ${order.customer} creato con successo`)
          navigate(`/orders/${order.id}`)
      }
  })



  React.useEffect(() => {
    if (order !== undefined) {
      setCoperti(order.serviceNumber)
    }
  }, [order])


  const handleChangeCustomer =
      React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
            setCustomer(event.currentTarget.value);
            updateOrderField('customer', event.currentTarget.value)
          }, [setCustomer, updateOrderField]
      );

  const handleChangeTakeAway =
      React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
            setTakeAway(event.target.checked);
        updateOrderField('takeAway', event.target.checked)
          }, [setTakeAway, updateOrderField]
      );

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
          }, [setCoperti, updateOrderField]
      )

  const handleChangeNote =
    React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
        setNote(event.currentTarget.value);
        updateOrderField('note', event.currentTarget.value)
      }, [setNote, updateOrderField]
    );

  const handleSave = () => {
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

        if (order.id!== -1) {
          updateOrder.mutate(orderToSend)
        } else {
          createOrder.mutate(orderToSend)
        }
      }
    }
  }


  return (
    <>
        <TextField fullWidth required
                   name={'customer'}
                   size='small'
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
        <Box>
          <TextField fullWidth size="small"
                     label="Note"
                     multiline
                     minRows={2}
                     value={note}
                     sx={{mt: 2}}
                     onChange={handleChangeNote}
                     />
        </Box>
        <Stack direction="row" spacing={1} sx={{marginTop: 1, justifyContent: 'center'}}>
          <Button
              disabled={!differences}
              variant="contained"
              startIcon={<SaveOutlined/>}
              onClick= {() => handleSave()}
          >{order?.id !== -1 ? 'Aggiorna' : 'Crea'}</Button>

          {
            (order && order.id) ?
            <Button
              disabled={!differences}
              variant="contained"
              onClick={ () =>  {
                // FIXME deve essere resettato lo stato
                  resetStore()
              }}
              startIcon={<CancelOutlined/>}
            >Annulla</Button> : ''
          }
          <OrderPrint disabled={differences || ! order.id} order={order} products={productsTable}/>
        </Stack>
    </>
  );
}

export default OrderEditForm;