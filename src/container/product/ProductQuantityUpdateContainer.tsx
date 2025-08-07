import {Box, IconButton, Paper, useTheme} from "@mui/material";
import {CachedOutlined, WarehouseOutlined} from "@mui/icons-material";
import {useState} from "react";
import ProductsQuantityUpdateList from "./ProductsQuantityUpdateList.tsx";
import ProductSearchForm from "./ProductSearchForm.tsx";
import {productsSearchQuery, ProductsSearchQueryParams} from "../../api/sagra/sagraComponents.ts";
import {queryClient} from "../../main.tsx";
import toast from "react-hot-toast";
import PageTitle from "../../view/PageTitle.tsx";

const ProductQuantityUpdateContainer = () => {
    const theme = useTheme();

    const [searchParam, setSearchParam] = useState<ProductsSearchQueryParams>({});

    const handleChangeSearchParam = (searchParam : ProductsSearchQueryParams) => {
        setSearchParam(searchParam)
    }

    const productsSearchConf = productsSearchQuery({});
    const handleRefreshProducts = () => {
        queryClient.invalidateQueries({queryKey: productsSearchConf.queryKey}).then(() => {
            toast.success("Elenco prodotti aggiornato", {duration: 2000})
        }).catch((e: Error) => {console.log('Errore: ', e)})
    }

    return (
        <>

            <PageTitle title="Giacenze Magazzino" icon={<WarehouseOutlined/>}/>

            <Paper variant="outlined"
                   sx={{p: 2, mt: 1, mb: 1, backgroundColor: theme.sagra.panelBackground,
                        display: 'flex', justifyContent: 'space-between'}}
                   className="paper-top">
                <Box sx={{ width: '100%'}}>
                    <ProductSearchForm setSearchParam={handleChangeSearchParam} />
                </Box>
                <Box>
                    <IconButton sx={{ width: '40px'}}>
                        <CachedOutlined onClick={handleRefreshProducts} />
                    </IconButton>
                </Box>
            </Paper>

            <Paper variant="outlined"
                   sx={{p: 2, mb: 1, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-bottom">
                <ProductsQuantityUpdateList searchParam={searchParam} />
            </Paper>
        </>
    );
};

export default ProductQuantityUpdateContainer;