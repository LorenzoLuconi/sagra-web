import {
  ErrorResource,
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CancelOutlined, DeleteOutlined, PrintOutlined, SaveOutlined } from "@mui/icons-material";
import {useOrderStore} from "../../context/OrderStore.tsx";
import {checkOrderErrors} from "../../utils";
import toast from "react-hot-toast";
import { cloneDeep, isEqual } from "lodash";
import {useMutation} from "@tanstack/react-query";
import {
  fetchOrderCreate, fetchOrderDelete,
  fetchOrderUpdate
} from "../../api/sagra/sagraComponents.ts";
import {useNavigate} from "react-router";
import OrderPrint from "./OrderPrint.tsx";
import {queryClient} from "../../main.tsx";
import {ErrorWrapper} from "../../api/sagra/sagraFetcher.ts";
import { useConfirm } from "material-ui-confirm";
import { useReactToPrint } from "react-to-print";
import {useOrderConfiguration, usePrintConfiguration} from "../../context/AppConfigurationStore.tsx";


const OrderEditForm: React.FC = () => {

  const theme = useTheme();
  const iconOnlyActions = useMediaQuery(theme.breakpoints.down("lg"));
  const {order, updateOrderField, products: productsTable, errors, setFieldError, resetErrors, resetStore, isNewOrder, originalOrder} = useOrderStore();
  const orderConfiguration = useOrderConfiguration();
  const printConfiguration = usePrintConfiguration();
  const {nameMandatory, takeAwayEnabled, serviceEnabled} = orderConfiguration;
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(order.customer);
  const [takeAway, setTakeAway] = useState(order.takeAway);
  const [coperti, setCoperti] = useState<number|undefined>(order.serviceNumber);
  const [note, setNote] = useState(order.note ?? '');

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    pageStyle: getOrderPrintPageStyle(printConfiguration.format),
  });

  const newOrder = isNewOrder();
  const differences = !isEqual(originalOrder, order);
  const showServiceNumber = serviceEnabled || (!newOrder && order.serviceNumber !== undefined);
  const showTakeAway = takeAwayEnabled || (!newOrder && order.takeAway);
  const showOrderOptions = showServiceNumber || showTakeAway;

  const handleCancel = () => {
    resetStore()
    setCustomer(originalOrder.customer)
    setCoperti(originalOrder.serviceNumber)
    setNote(originalOrder.note ?? '');
    setTakeAway(originalOrder.takeAway);
  }

  const invalidateOrders = () => {
    void queryClient.invalidateQueries({ queryKey: ["v1", "orders"] });
  };

  const invalidateProducts = () => {
    void queryClient.invalidateQueries({ queryKey: ["v1", "products"] });
  };

  const invalidateOrderDependencies = () => {
    invalidateOrders();
    invalidateProducts();
  };

  const orderDelete = useMutation({
    mutationFn: (orderId: number) => {
      return fetchOrderDelete({
        pathParams: { orderId },
      });
    },
    onSuccess: () => {
        toast.success(`L'ordine n. ${order.id} è stato rimosso`);
        invalidateOrderDependencies();
        navigate("/orders/new")
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
      }
    });
  }


    const getErrorParts = (error: unknown): {status?: unknown; payload?: unknown} => {
        if (error && typeof error === "object" && "payload" in error) {
            const {status, payload} = error as ErrorWrapper<unknown> & {status?: unknown; payload?: unknown};
            return {status, payload};
        }

        if (error && typeof error === "object" && "stack" in error) {
            const stack = (error as Error).stack;
            if (stack && typeof stack === "object" && "payload" in stack) {
                const {status, payload} = stack as ErrorWrapper<unknown> & {status?: unknown; payload?: unknown};
                return {status, payload};
            }
        }

        return {};
    };

    const manageError = (error: Error) => {
        console.log('Gestione errore ordini: ', error)
        const {status, payload} = getErrorParts(error);
        console.log(`Error: status=${status}, payload=`, payload);

        switch (status) {
            case 450: {
                const {invalidProducts} = payload as ErrorResourceNotEnoughQuantity
                invalidProducts.map((invalidProduct) => {
                    console.log('Errore 450 per prodotto non valido: ', invalidProduct)
                    setFieldError(`product.${invalidProduct.productId}`, `${invalidProduct.message}`)
                    toast.error(`Ordine non registrato per quantità prodotto non sufficiente per '${productsTable[invalidProduct.productId].name}'`)
                })

                invalidateProducts();

                break;
            }

            default: {
                const errorResource = payload as ErrorResource | undefined;
                if (errorResource?.invalidValues && errorResource.invalidValues.length > 0) {
                    errorResource.invalidValues.forEach((invalidValue) => {
                        setFieldError(invalidValue.field, invalidValue.message);
                        toast.error(invalidValue.message);
                    });
                    return;
                }

                toast.error(errorResource?.message ?? "Si è verificato un errore inatteso")
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
      onSuccess: (order: Order) => {
          toast.success(`L'ordine n. ${order.id} è stato aggiornato`)
          invalidateOrderDependencies();
          navigate(`/orders/${order.id}`)
      }
  })


  const createOrder = useMutation({
      mutationFn: (data: OrderRequest) => {
              return fetchOrderCreate({body: data})
      },
      onError: (error: Error) => {
          //console.log('Order Create error: ', error, error as ErrorWrapper<unknown>)
          manageError(error)
      },
      onSuccess: (order: Order) => {
          toast.success(`Ordine per cliente '${order.customer}' creato con n. ${order.id}`)
          invalidateOrderDependencies();
          navigate(`/orders/${order.id}`)
      }
  })



  React.useEffect(() => {
    if (order !== undefined) {
      setCoperti(order.serviceNumber)
    }
  }, [order])

  React.useEffect(() => {
    if (newOrder && !takeAwayEnabled && order.takeAway) {
      setTakeAway(false);
      updateOrderField('takeAway', false);
    }
  }, [newOrder, order.takeAway, takeAwayEnabled, updateOrderField]);

  React.useEffect(() => {
    if (newOrder && !serviceEnabled && order.serviceNumber !== undefined) {
      setCoperti(undefined);
      updateOrderField('serviceNumber', undefined);
    }
  }, [newOrder, order.serviceNumber, serviceEnabled, updateOrderField]);


  const handleChangeCustomer =
      React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
            setCustomer(event.currentTarget.value);
            updateOrderField('customer', event.currentTarget.value)
          }, [setCustomer, updateOrderField]
      );

  const handleChangeTakeAway =
      React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
        setTakeAway(event.target.checked);
        setCoperti(undefined)
        updateOrderField('takeAway', event.target.checked)
        updateOrderField('serviceNumber', undefined)
  }, [setTakeAway, updateOrderField, setCoperti]);

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
    const normalizedTakeAway = newOrder && !takeAwayEnabled ? false : order.takeAway;
    const normalizedServiceNumber = newOrder && !serviceEnabled ? 0 : (normalizedTakeAway ? 0 : order.serviceNumber);
    const orderErrors = checkOrderErrors(order, productsTable, orderConfiguration)
    const errorFields = Object.keys(orderErrors)

    errorFields.forEach((eK: string) => {
      setFieldError(eK, orderErrors[eK])
      toast.error(orderErrors[eK])
    })

    if (errorFields.length === 0) {

      const orderToSend: OrderRequest = {} as OrderRequest
      orderToSend.customer = order.customer
      orderToSend.takeAway = normalizedTakeAway
      orderToSend.serviceNumber = normalizedServiceNumber
      orderToSend.note = order.note
      orderToSend.products = cloneDeep(order.products)
        if ( order.discountRate )
            orderToSend.discountRate = order.discountRate

        console.log('Order2Send: ', orderToSend)

      if (!newOrder) {
        updateOrder.mutate(orderToSend)

      } else {
        createOrder.mutate(orderToSend)
      }
    }
  }


  return (
    <>
        <TextField fullWidth
                   required={nameMandatory}
                   name={'customer'}
                   size='small'
                   value={customer}
                   error={errors['customer'] !== undefined}
                   label="Nome cliente"
                   onChange={handleChangeCustomer}
                   helperText={errors['customer'] !== undefined ? errors['customer'] : ''}
        />
        {showOrderOptions && (
          <Box sx={{ display: "flex", marginTop: 2 }}>
            {showServiceNumber && (
              <TextField size='small'
                         value={coperti !== undefined ? coperti : ''}
                         required
                         type="number"
                         name={'serviceNumber'}
                         error={errors['serviceNumber'] !== undefined}
                         label="Coperti"
                         onChange={handleChangeCoperti}
                         disabled={showTakeAway && takeAway}
                         slotProps={{ htmlInput: { size: 8, min: 0 } }}
                         sx={{ ml: 0, mr: 2}}
                         helperText={ errors['serviceNumber'] ?? ''}
              />
            )}

            {showTakeAway && (
              <FormControlLabel
                  label="Asporto"
                  control={
                    <Switch checked={takeAway} onChange={handleChangeTakeAway} />
                  }
              />
            )}
          </Box>
        )}
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
        <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 1, flexWrap: "nowrap",
                  overflowX: "auto", p: 2
        }}>
          {newOrder && (
            <Button
              size="small"
              variant="contained"
              aria-label="Crea"
              startIcon={iconOnlyActions ? undefined : <SaveOutlined/>}
              onClick= {() => handleSave()}
              sx={iconOnlyActions ? {minWidth: 40, px: 1} : {whiteSpace: "nowrap"}}
            >{iconOnlyActions ? <SaveOutlined/> : "Crea"}</Button>
          )}
          {!newOrder && (
            <Button
              size="small"
              disabled={!differences}
              variant="contained"
              aria-label="Aggiorna"
              startIcon={iconOnlyActions ? undefined : <SaveOutlined/>}
              onClick= {() => handleSave()}
              sx={iconOnlyActions ? {minWidth: 40, px: 1} : {whiteSpace: "nowrap"}}
            >{iconOnlyActions ? <SaveOutlined/> : "Aggiorna"}</Button>
          )}
          {!newOrder && (
            <Button size="small"  color="success"
                    disabled={differences}
                    aria-label="Stampa"
                    onClick={reactToPrintFn}
                    variant="contained"
                    startIcon={iconOnlyActions ? undefined : <PrintOutlined/>}
                    sx={iconOnlyActions ? {minWidth: 40, px: 1} : {whiteSpace: "nowrap"}}
            >{iconOnlyActions ? <PrintOutlined/> : "Stampa"}</Button>
          )}
          <Button
            size="small"
            disabled={!differences}
            variant="contained"
            aria-label="Annulla"
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
            startIcon={iconOnlyActions ? undefined : <CancelOutlined/>}
            sx={iconOnlyActions ? {minWidth: 40, px: 1} : {whiteSpace: "nowrap"}}
          >{iconOnlyActions ? <CancelOutlined/> : "Annulla"}</Button>
          {!newOrder && (
            <Button size="small"
                    variant="contained"
                    onClick={ () => handleDelete()}
                    color="error"
                    aria-label="Elimina"
                    startIcon={iconOnlyActions ? undefined : <DeleteOutlined/>}
                    sx={iconOnlyActions ? {minWidth: 40, px: 1} : {whiteSpace: "nowrap"}}
            >{iconOnlyActions ? <DeleteOutlined/> : "Elimina"}</Button>
          )}
        </Box>
        { ! (differences || newOrder) &&
          <div ref={contentRef} className="printContent print-container">
            <OrderPrint order={order} products={productsTable}/>
          </div>
        }
    </>
  );
}

export default OrderEditForm;

const getOrderPrintPageStyle = (format: "A4" | "A5") => `
    @page {
        size: ${format};
        margin: 10mm;
    }

    @media print {
        html, body {
            height: initial !important;
            overflow: initial !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }
`;
