import {
    fetchMonitorCreate, fetchMonitorDelete,
    fetchMonitorUpdate,
    monitorSearchQuery,
    productsSearchQuery
} from "../../api/sagra/sagraComponents.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    FormControl, Grid,
    IconButton,
    Paper,
    TextField,
    Typography, useTheme
} from "@mui/material";
import MonitorsList from "./MonitorsList.tsx";
import { useState } from "react";
import {Monitor, Product} from "../../api/sagra/sagraSchemas.ts";
import {
    AddCircleOutlined,
    CancelOutlined,
    DeleteOutlined,
    KeyboardArrowDown,
    KeyboardArrowUp, MonitorOutlined,
    SaveOutlined
} from "@mui/icons-material";
import * as React from "react";
import {ProductName} from "../product/ProductName.tsx";
import toast from "react-hot-toast";
import {queryClient} from "../../main.tsx";
import {useConfirm} from "material-ui-confirm";
import {isEqual} from "lodash";
import {manageError} from "../../utils";
import {ErrorWrapper} from "../../api/sagra/sagraFetcher.ts";

interface ErrorMessage {
    name?: string;
    products?: string;
}


const MonitorContainer = () => {

    const [monitor, setMonitor] = useState<Monitor|undefined>(undefined);
    const theme = useTheme();

    const monitorConf = monitorSearchQuery({})

    const monitorData = useQuery({
        queryKey: monitorConf.queryKey,
        queryFn: monitorConf.queryFn
    })

    const selectMonitor = (monitor: Monitor) => {
        setMonitor(monitor);
    }

    const cancelSelected = () => {
        setMonitor(undefined);
    }


    if (monitorData.isError) {
        return <Alert severity="error">Si è verificato un errore prelevando la lista dei monitor: {monitorData.error.message}</Alert>
    }

    if (monitorData.isPending) {
        return (
            <Box sx={{alignItems: 'center', justifyItems: 'center', m: 2}}>
                <CircularProgress/>
            </Box>
        );
    }

    const monitors = monitorData.data;

    if (! monitors ) {
        return <Alert severity="error">Si è verificato un errore prelevando la lista dei monitor: {monitorData.error.message}</Alert>
    }


    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1, alignItems: 'center'}}>
                <MonitorOutlined />
                <Typography sx={{ml: 1, fontWeight: 700, fontSize: '1.5em'}}>Monitors</Typography>
            </Box>
            <Grid container spacing={2}>
                <Grid size={7}>
                    <Paper variant="outlined" sx={{p: 2, backgroundColor: theme.sagra.panelBackground }}
                            className="paper-round">
                        <MonitorsList currentMonitor={monitor} monitors={monitors} selectMonitor={selectMonitor}/>
                    </Paper>
                </Grid>
                <Grid size={5} sx={{minWidth: '450px'}}>
                    {
                        monitor &&
                        <MonitorEdit key={monitor?.id} monitor={monitor} cancel={cancelSelected}/>
                    }
                </Grid>
            </Grid>
        </>
    )
}

interface MonitorEditProps {
    monitor: Monitor;
    cancel: () => void;
}

const MonitorEdit = (props: MonitorEditProps ) => {

    const {monitor} = props;
    const confirm = useConfirm();

    const theme = useTheme();

    const [name, setName] = useState<string>(monitor.name ?? '');
    const [products, setProducts] = useState(monitor.products);
    const [errorMessage, setErrorMessage] = useState<ErrorMessage>( {
        name: '',
        products: ''
    })

    const isChanged = ! isEqual(monitor, { id: monitor.id, name, products });

    const resetErrorMessage = () => {
        setErrorMessage({
            name: '',
            products: ''
        })
    }

    const addProduct = (product: Product) => {
        if ( ! products.includes(product.id)) {
            setProducts([...products, product.id]);
            toast.success(`Prodotto ${product.name} inserito nel monitor`, { duration: 1500 } );
        }
        resetErrorMessage();
    }

    const productExists = (product: Product) => {
        return products.includes(product.id);
    }

    const updateMonitor = useMutation({
        mutationFn: () => {
            if ( ! monitor.id )
                throw Error("Id del monitor non può essere vuoto nell'aggiornamento")

            return fetchMonitorUpdate({
                body: { name, products} as Monitor,
                pathParams: { monitorId: monitor.id }
            })
        },
        onError: (error) => {
            console.log("Errore durante l'aggiornamento del monitor: ", error, monitor, products, name);
            toast.error("Si è verificato un errore nell'aggiornamento del monitor")
            manageError(error as ErrorWrapper<unknown>)
        },
        onSuccess: (monitor: Monitor) => {
            const monitorConf = monitorSearchQuery({});
            queryClient.invalidateQueries({queryKey: monitorConf.queryKey}).then(() => {
                resetErrorMessage();
                toast.success(`Il monitor ${monitor.name} è stato aggiornato`);
            })
        }
    })

    const deleteMonitor = useMutation({
        mutationFn: () => {
            if ( ! monitor.id )
                throw Error("Id del monitor non può essere vuoto nell'aggiornamento")

            return fetchMonitorDelete({
                pathParams: { monitorId: monitor.id }
            })
        },
        onError: (error) => {
            console.log("Errore durante la cancellazione del monitor: ", error, monitor, products, name);
            toast.error("Si è verificato un errore cancellando il monitor")
            manageError(error as ErrorWrapper<unknown>)
        },
        onSuccess: () => {
            const monitorConf = monitorSearchQuery({});
            queryClient.invalidateQueries({queryKey: monitorConf.queryKey}).then(() => {
                props.cancel()
                toast.success(`Il monitor ${monitor.name} è stato cancellato`);
            })
        }
    })

    const createMonitor = useMutation({
        mutationFn: () => {
            if ( monitor.id )
                throw Error("Id del monitor deve essere vuoto nell'aggiornamento")

            return fetchMonitorCreate({
                body: { name, products} as Monitor,
            })
        },
        onError: (error) => {
            console.log("Errore durante la creazione del monitor: ", error, products, name);
            toast.error("Si è verificato un errore nella creazione del monitor")
            manageError(error as ErrorWrapper<unknown>)
        },
        onSuccess: (monitor: Monitor) => {
            const monitorConf = monitorSearchQuery({});
            queryClient.invalidateQueries({queryKey: monitorConf.queryKey}).then(() => {
                props.cancel();
                toast.success(`Il monitor ${monitor.name} è stato creato` );
            })
        }
    })

    const validateMonitor = () => {
        const errorMessage : ErrorMessage = {};
        let valid = true;
        if ( ! name || name.length < 1 ) {
            errorMessage.name = "Nome monitor obbligatorio da inserire"
            valid = false;
        }

        if ( ! products || products.length < 1 ) {
            errorMessage.products = "Il monitor deve contenere almeno un prodotto"
            valid = false;
        }

        setErrorMessage(errorMessage)

        if ( ! valid )
            toast.error("Sono presenti degli errori da correggere")

        return valid;
    }

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.currentTarget.value);
        resetErrorMessage();
    }

    const handleMonitorDelete = () => {
        confirm({
            title: 'Cancellazione monitor',
            description: `Vuoi procedere alla cancellazione del monitor '${name}'?`
        }).then((r) => {
            if (r.confirmed)
                deleteMonitor.mutate()
        });
    }

    return (
        <>
            <Paper variant="outlined"
               sx={{ p: 2, backgroundColor: theme.sagra.panelBackground,
                   "& .MuiTextField-root": { mb: 2, display: "block" } }}
               className="paper-top">
                <TextField
                    variant="outlined"
                    label="Nome Monitor"
                    value={name}
                    required
                    error={!!errorMessage.name}
                    helperText={errorMessage.name}
                    onChange={handleChangeName}/>
                <ProductAutocomplete addProduct={addProduct} productExists={productExists}/>
                <Box sx={{ display: "flex", gap: 2 }}>
                    { monitor.id ?
                        <>
                        <Button variant="contained" startIcon={<SaveOutlined/>}
                                disabled={!isChanged}
                            onClick={() => {
                                if (validateMonitor())
                                    updateMonitor.mutate()
                            }
                        }>Salva Modifiche</Button>
                        <Button color="error" variant="contained" startIcon={<DeleteOutlined/>} onClick={() => handleMonitorDelete()}>Elimina</Button>
                        </>
                        : <Button variant="contained"  startIcon={<SaveOutlined/>}
                              disabled={!isChanged}
                              onClick={() => {
                                  if (validateMonitor())
                                      createMonitor.mutate()
                              }}
                        >Crea Monitor</Button>
                    }
                    <Button variant="contained" startIcon={<CancelOutlined/>} onClick={() => props.cancel()}>Annulla</Button>
                </Box>
            </Paper>
            <Paper variant="outlined" sx={{ backgroundColor: theme.sagra.panelBackground }}
                   className="paper-bottom">
                { errorMessage.products &&
                    <Alert severity="error">{errorMessage.products}</Alert>
                }
                <MonitoredProducts products={products} updateProducts={ (products) => setProducts(products) } />
            </Paper>
        </>
    )
}

interface ProductAutocompleteProps {
    addProduct: (product: Product) => void;
    productExists: (product: Product) => boolean;
}

const ProductAutocomplete = (props: ProductAutocompleteProps) => {

    const [selectedProduct, setSelectedProduct] = useState<Product|undefined>(undefined);

    const productsSearchConf = productsSearchQuery({
        queryParams: { excludeLinked: true },
    });

    const productsQuery = useQuery({
        queryKey: productsSearchConf.queryKey,
        queryFn: productsSearchConf.queryFn,
        staleTime: 1000 * 10,
    });

    if (productsQuery.isLoading) {
        return ( <></> )
    }

    if (productsQuery.isError) {
        return (
            <Alert severity="error">
                Si è verificato un errore prelevando la lista dei prodotti: {productsQuery.error.message}
            </Alert>
        );
    }

    const products = productsQuery.data;

    if ( ! products || products.length < 1) {
        return (
            <Alert severity="warning">
                Nessun prodotto disponibile
            </Alert>
        );
    }

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start',  alignItems: 'start' }}>
            <FormControl>
            <Autocomplete sx={{ minWidth: '350px' }} selectOnFocus options={products}
                    getOptionLabel={(option) => option.name}
                      value={ selectedProduct || null  } // undefined non gli piace
                      onChange={(_event: React.SyntheticEvent, newProduct: Product | null) => {
                          setSelectedProduct(newProduct || undefined);
                      }}
                      getOptionDisabled={(p) => props.productExists(p) }
                      renderInput={(params) => <TextField {...params} label="Prodotti" helperText="Ricerca e seleziona prodotti da aggiungere al monitor"/>}/>
            </FormControl>
            <IconButton color="primary" disabled={!selectedProduct}  onClick={() => selectedProduct && props.addProduct(selectedProduct) }>
                <AddCircleOutlined sx={{ pt: 0.6, fontSize: '1.5em'}}/>
            </IconButton>
        </Box>
    )
}

interface MonitoredProductsProps {
    products: number[];
    updateProducts: (products: number[]) => void;
}
const MonitoredProducts = (props: MonitoredProductsProps) => {

    const {products, updateProducts} = props;
    const prodSize = products.length;
    const theme = useTheme();


    const moveProducts = (from: number, to: number) => {
        if ( to < 0 || from > products.length-1 ) {
            return;
        }

        const arr = [...products];

        arr.splice(to, 0, arr.splice(from, 1)[0]);
        updateProducts(arr)
    }

    const removeProduct = (idx: number) => {
        if ( idx < 0 || idx > products.length-1 )
            return

        const arr = [...products];
        arr.splice(idx, 1);
        updateProducts(arr)
    }

    if ( products.length < 1 ) {
        return (
            <Box sx={{ p: 1, pt: 2, pb: 2}}>
                <Typography>Nessun prodotto presente nel monitor</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 1}}>
            { products.map( (pid, idx) => {
                return (
                    <Box key={idx} sx={{mt: 0.5, pl: 1, pr: 1, display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center',
                        backgroundColor: theme.palette.background.default }}>
                        <Typography sx={{ fontSize: '1.1em'}}><ProductName productId={pid}/></Typography>
                        <Box sx={{ display: 'flex', width: '150px' }}>
                            <Box sx={{ width: '50px'}}>
                            { idx < prodSize-1 &&
                                <IconButton onClick={() => moveProducts(idx, idx+1)}>
                                    <KeyboardArrowDown sx={{ fontSize: '1.2em'}}/>
                                </IconButton>
                            }
                            </Box>

                            <Box sx={{ width: '50px' }}>
                            { idx > 0 &&
                                <IconButton onClick={() => moveProducts(idx, idx-1)}>
                                    <KeyboardArrowUp sx={{ fontSize: '1.2em'}}/>
                                </IconButton>
                            }
                            </Box>
                            <Box sx={{ width: '50px' }}>
                                <IconButton onClick={() => removeProduct(idx)}>
                                    <DeleteOutlined sx={{ fontSize: '1.2em'}}/>
                                </IconButton>
                            </Box>

                        </Box>
                    </Box>
                )
            })}

        </Box>
    )
}

export default MonitorContainer;