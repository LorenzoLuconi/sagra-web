import {Paper, useTheme} from "@mui/material";
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
    const [searchParam, setSearchParam] = useState<ProductsSearchQueryParams>({});

    const selectProduct = (product: Product | undefined) => {
        setSelected(product);
    };

    const handleChangeSearchParam = (searchParam: ProductsSearchQueryParams) => {
        setSearchParam(searchParam)
    }

    return (
        <>
            <PageTitle title="Prodotti" icon={<RestaurantOutlined/>}/>

            <Paper variant="outlined" sx={{padding: 2, mb: 1, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-round">
                <ProductEdit
                    key={selected?.id}
                    selected={selected}
                    setSelected={selectProduct}
                />
            </Paper>

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
                />
            </Paper>
        </>
    );
};

export default ProductContainer;