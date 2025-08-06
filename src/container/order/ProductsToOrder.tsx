import {
  Box,
  Divider,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  useTheme
} from "@mui/material";
import { Product} from "../../api/sagra/sagraSchemas.ts";
import {useState} from "react";
import {AppsOutlined, CachedOutlined, FormatListNumberedOutlined} from "@mui/icons-material";
import {useOrderStore} from "../../context/OrderStore.tsx";
import {productsSearchQuery, ProductsSearchQueryParams} from "../../api/sagra/sagraComponents.ts";
import {queryClient} from "../../main.tsx";
import toast from "react-hot-toast";
import {useLocalStorage} from "../../utils";
import {defaultUserPreferences, ProductViewT} from "../../userPreferences.ts";
import ProductSearchForm from "../product/ProductSearchForm.tsx";
import ProductsOrder from "../product/ProductsOrder.tsx";

const ProductLayoutMapping: Record<ProductViewT, number> = {
  'grid': 0,
  'list': 1
}


const ProductsToOrder = () => {
  const theme = useTheme();
  const [userPreferences, setUserPreferences] = useLocalStorage('sagraWeb:userPreferences:genericUser', defaultUserPreferences)

  const [searchParam, setSearchParam] = useState<ProductsSearchQueryParams>({});

  const handleChangeSearchParam = (searchParam : ProductsSearchQueryParams) => {
    setSearchParam(searchParam)
  }

  const { addProduct } = useOrderStore();


  const handleAddProduct = (product: Product) => {
    addProduct(product, 1);
  };

  const productsSearchConf = productsSearchQuery({});
  const handleRefreshProducts = () => {
    queryClient.invalidateQueries({queryKey: productsSearchConf.queryKey}).then(() => {
      toast.success("Elenco prodotti aggiornato", {duration: 2000})
    }).catch((e: Error) => {console.log('Errore: ', e)})
  }

  const handlePreferences = (
      _event: React.MouseEvent<HTMLElement>,
      newPreference: string | null,
  ) => {
    setUserPreferences({productView: newPreference});
  };

    return (
      <Box>
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.sagra.panelBackground }}>
          <ProductSearchForm setSearchParam={handleChangeSearchParam} />
        </Paper>
        <Paper variant="outlined"
               sx={{ display: "flex", justifyContent: "flex-end", mt: 1, p: 1, backgroundColor: theme.sagra.panelBackground }}
               className="paper-top">

          <ToggleButtonGroup
              size={"small"}
              value={userPreferences.productView}
              exclusive
              onChange={handlePreferences}

          >
            <ToggleButton value="grid" aria-label="grid">
              <AppsOutlined/>
            </ToggleButton>
            <ToggleButton value="list" aria-label="list">
              <FormatListNumberedOutlined />
            </ToggleButton>
          </ToggleButtonGroup>
          <Divider sx={{ml: 1, mr: 1}} orientation="vertical" flexItem />
          <IconButton>
            <CachedOutlined onClick={() => handleRefreshProducts()} />
          </IconButton>
        </Paper>
        <Paper variant="outlined" className="paper-bottom"
               sx={{ p: 1, pb: 2, backgroundColor: theme.sagra.panelBackground}}>
          <>
          {ProductLayoutMapping[userPreferences.productView] === 0 ? (
            <ProductsOrder
                type="card"
              addToOrder={handleAddProduct}
              searchParam={searchParam}
            />
          ) : (
            <ProductsOrder
                type="list"
              addToOrder={handleAddProduct}
              searchParam={searchParam}
            />
          )}
          </>
        </Paper>
      </Box>
    );
};

export default ProductsToOrder;
