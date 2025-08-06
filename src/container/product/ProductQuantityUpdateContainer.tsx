import {Box, Paper, Typography, useTheme} from "@mui/material";
import {WarehouseOutlined} from "@mui/icons-material";
import {useState} from "react";
import ProductsQuantityUpdateList from "./ProductsQuantityUpdateList.tsx";
import ProductSearchForm from "./ProductSearchForm.tsx";
import {ProductsSearchQueryParams} from "../../api/sagra/sagraComponents.ts";

const ProductQuantityUpdateContainer = () => {
    const theme = useTheme();

    const [searchParam, setSearchParam] = useState<ProductsSearchQueryParams>({});

    const handleChangeSearchParam = (searchParam : ProductsSearchQueryParams) => {
        setSearchParam(searchParam)
    }

    return (
        <>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', mb: 1, alignItems: "center"}}>
                <WarehouseOutlined/>
                <Typography sx={{fontWeight: 700, fontSize: "1.5em"}}>
                    Giacenze Magazzino
                </Typography>
            </Box>

            <Paper variant="outlined"
                   sx={{p: 2, mt: 1, mb: 1, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-top">
                <ProductSearchForm setSearchParam={handleChangeSearchParam} />
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