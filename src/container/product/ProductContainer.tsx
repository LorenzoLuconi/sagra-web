import {Dialog, DialogContent, DialogTitle, Paper, useTheme} from "@mui/material";
import {RestaurantOutlined} from "@mui/icons-material";
import {useState} from "react";
import ProductEdit from "./ProductEdit.tsx";
import {Product} from "../../api/sagra/sagraSchemas.ts";
import ProductsList from "./ProductsList.tsx";
import * as React from "react";
import ProductSearchForm from "./ProductSearchForm.tsx";
import {ProductsSearchQueryParams} from "../../api/sagra/sagraComponents.ts";
import PageTitle from "../../view/PageTitle.tsx";

const ProductContainer: React.FC = () => {
    const theme = useTheme();

    const [selected, setSelected] = useState<Product | undefined>(undefined);
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [searchParam, setSearchParam] = useState<ProductsSearchQueryParams>({});

    const selectProduct = (product: Product | undefined) => {
        setSelected(product);
        if (product) {
            setProductDialogOpen(true);
        }
    };

    const handleChangeSearchParam = (searchParam: ProductsSearchQueryParams) => {
        setSearchParam(searchParam)
    }

    const handleCreateProduct = () => {
        setSelected(undefined);
        setProductDialogOpen(true);
    };

    const handleCloseProductDialog = () => {
        setSelected(undefined);
        setProductDialogOpen(false);
    };

    const handleProductEditClose = () => {
        handleCloseProductDialog();
    };


    return (
        <>
            <PageTitle title="Prodotti" icon={<RestaurantOutlined/>}/>

            <Dialog
                open={productDialogOpen}
                onClose={handleCloseProductDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selected ? "Modifica prodotto" : "Nuovo prodotto"}
                </DialogTitle>
                <DialogContent>
                    <ProductEdit
                        key={selected?.id ?? "new"}
                        selected={selected}
                        setSelected={handleProductEditClose}
                    />
                </DialogContent>
            </Dialog>

            <Paper variant="outlined" sx={{padding: 2, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-top">
                <ProductSearchForm setSearchParam={handleChangeSearchParam}></ProductSearchForm>
            </Paper>

            <Paper variant="outlined" sx={{padding: 2, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-bottom">
                <ProductsList
                    selected={selected}
                    setSelected={selectProduct}
                    searchParam={searchParam}
                    onCreateProduct={handleCreateProduct}
                />
            </Paper>
        </>
    );
};

export default ProductContainer;
