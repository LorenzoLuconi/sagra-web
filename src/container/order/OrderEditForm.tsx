import {
  ErrorResourceNotEnoughQuantity,
  Order,
  OrderRequest,
} from "../../api/sagra/sagraSchemas.ts";
import * as React from "react";
import { useRef, useState } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
import { CancelOutlined, DeleteOutlined, PrintOutlined, SaveOutlined } from "@mui/icons-material";
import {useOrderStore} from "../../context/OrderStore.tsx";
import {checkOrderErrors} from "../../utils";
import toast from "react-hot-toast";
import { cloneDeep, isEqual } from "lodash";
import {useMutation} from "@tanstack/react-query";
import {
  fetchOrderCreate, fetchOrderDelete,
  fetchOrderUpdate,
  orderByIdQuery, ordersSearchQuery,
  productsSearchQuery
} from "../../api/sagra/sagraComponents.ts";
import {useNavigate} from "react-router";
import OrderPrint from "./OrderPrint.tsx";
import {queryClient} from "../../main.tsx";
import {ErrorWrapper} from "../../api/sagra/sagraFetcher.ts";
import { useConfirm } from "material-ui-confirm";
import { useReactToPrint } from "react-to-print";


const OrderEditForm: React.FC = () => {

  const {order, updateOrderField, products: productsTable, errors, setFieldError, resetErrors, resetStore, isNewOrder, originalOrder} = useOrderStore();
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(order.customer);
  const [takeAway, setTakeAway] = useState(order.takeAway);
  const [coperti, setCoperti] = useState<number|undefined>(order.serviceNumber);
  const [note, setNote] = useState(order.note ?? '');

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const differences = !isEqual(originalOrder, order)

  const handleCancel = () => {
    resetStore()
    setCustomer(originalOrder.customer)
    setCoperti(originalOrder.serviceNumber)
    setNote(originalOrder.note ?? '');
    setTakeAway(originalOrder.takeAway);
  }

  const ordersSearchConf = ordersSearchQuery({});

  const orderDelete = useMutation({
    mutationFn: (orderId: number) => {
      return fetchOrderDelete({
        pathParams: { orderId },
      });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ordersSearchConf.queryKey })
        .then(() => {
          toast.success(`L'ordine n. ${order.id} è stato rimosso`);
        });
    },
    onError: (error: Error) => {
        manageError(error)
    },
  });

  const confirm = useConfirm()

  const handleDelete = () => {
    confirm({
      title: `Cancellazione ordine`,
      description: `Vuoi procedere alla cancellazione dell'ordine n. ${order.id} del cliente '${order.customer}'?`
    }).then((confirm) => {
      if (confirm.confirmed) {
        orderDelete.mutate(order.id)
        navigate("/orders/new")
      }
    });
  }


    const productsSearchConf = productsSearchQuery({});


    const manageError = (error: Error) => {
        console.log('Gestione errore ordini: ', error)
        const errorWrapper = error as ErrorWrapper<unknown>;
        // @ts-ignore
        const {status, payload} = errorWrapper.stack
        console.log(`Error: status=${status}, payload=`, payload);

        switch (status) {
            case 450: {
                const {invalidProducts} = payload as ErrorResourceNotEnoughQuantity
                invalidProducts.map((invalidProduct) => {
                    console.log('Errore 450 per prodotto non valido: ', invalidProduct)
                    setFieldError(`product.${invalidProduct.productId}`, `${invalidProduct.message}`)
                    toast.error(`Ordine non registrato per quantità prodotto non sufficiente per '${productsTable[invalidProduct.productId].name}'`)
                })

                queryClient.invalidateQueries({queryKey: productsSearchConf.queryKey}).then(() => {
                    //toast.success("Quantità dei prodotti aggiornata")
                }).catch((e: Error) => {
                    console.log('Errore: ', e)
                })

                break;
            }

            default: {
                toast.error(`${payload.message}`)
            }
        }
    }


    const updateOrder = useMutation({
      mutationFn: (data: OrderRequest) => {
          return fetchOrderUpdate({body: data, pathParams: {orderId: originalOrder?.id??0}})
      },
      onError: (error: Error) => {
          manageError(error)
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSuccess: (order: Order) => {

          const fetchOrderConf = orderByIdQuery({pathParams: {orderId: order.id}})

          queryClient.invalidateQueries({queryKey: fetchOrderConf.queryKey}).then(() => {
            queryClient.invalidateQueries({queryKey: productsSearchConf.queryKey}).then(() => {
              toast.success(`L'ordine n. ${order.id} è stato aggiornato`)
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
      onError: (error: Error) => {
          //console.log('Order Create error: ', error, error as ErrorWrapper<unknown>)
          manageError(error)
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSuccess: (order: Order) => {
          toast.success(`Ordine per cliente '${order.customer}' creato con n. ${order.id}`)
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
          const value = Number.parseInt(event.target.value)
          if ( ! isNaN(value)) {
            setCoperti(value);
            updateOrderField('serviceNumber', value)
          } else {
            setCoperti(undefined);
            updateOrderField('serviceNumber', undefined)
          }
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
        if ( order.discountRate )
            orderToSend.discountRate = order.discountRate

        console.log('Order2Send: ', orderToSend)

      if (! isNewOrder()) {
        updateOrder.mutate(orderToSend)

      } else {
        createOrder.mutate(orderToSend)
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
                   helperText={errors['customer'] !== undefined ? errors['customer'] : ''}
        />
        <Box sx={{ display: "flex", marginTop: 2 }}>
          <TextField size='small'
                     value={coperti !== undefined ? coperti : ''}
                     required
                     type="number"
                     name={'serviceNumber'}
                     error={errors['serviceNumber'] !== undefined}
                     label="Coperti"
                     onChange={handleChangeCoperti}
                     disabled={takeAway}
                     slotProps={{ htmlInput: { size: 8, min: 0 } }}
                     sx={{ ml: 0, mr: 2}}
                     helperText={ errors['serviceNumber'] ?? ''}
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
        <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 2,
                  p: 2
        }}>
          <Button
            size="small"
              disabled={!differences}
              variant="contained"
              startIcon={<SaveOutlined/>}
              onClick= {() => handleSave()}
          >{ isNewOrder() ? 'Crea' : 'Aggiorna'}</Button>
          <Button size="small"  color="success"
                  disabled={differences || isNewOrder()}
                  onClick={reactToPrintFn} variant="contained" startIcon={<PrintOutlined/>}>Stampa</Button>
            <Button
              size="small"
              disabled={!differences}
              variant="contained"
              onClick={ () =>  {
                confirm({
                  title: `Annulla modifiche ordine`,
                  description: `Le modifiche in corso dell'ordine verranno annullate, vuoi procedere?`
                }).then((confirm) => {
                  if (confirm.confirmed) {
                    handleCancel()
                  }
                });
              }}
              startIcon={<CancelOutlined/>}
            >Annulla</Button>

          <Button size="small"
                  variant="contained"
                  disabled={ isNewOrder() }
                  onClick={ () => handleDelete()}
                  color="error"
                  startIcon={<DeleteOutlined/>}
          >Elimina</Button>
        </Box>
        { ! (differences || isNewOrder()) &&
          <div ref={contentRef} className="printContent print-container">
            <OrderPrint order={order} products={productsTable}/>
          </div>
        }
    </>
  );
}

export default OrderEditForm;