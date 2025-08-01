import {Alert, Box, CircularProgress, Divider, IconButton, Paper, useTheme} from "@mui/material";
import {Course, Product} from "../../api/sagra/sagraSchemas.ts";
import {useState} from "react";
import CoursesSelector from "../course/CoursesSelector.tsx";
import {AppsOutlined, CachedOutlined, FormatListNumberedOutlined} from "@mui/icons-material";
import ProductsOrderCard from "../product/ProductsOrderCard.tsx";
import {useOrderStore} from "../../context/OrderStore.tsx";
import ProductsOrderList from "../product/ProductsOrderList.tsx";
import {productsSearchQuery, ProductsSearchQueryParams} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";
import {queryClient} from "../../main.tsx";
import toast from "react-hot-toast";

const ProductsToOrder = () => {
  const theme = useTheme();
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(undefined);
  const [type, setType] = useState(0);

  const { addProduct } = useOrderStore();

  const productsSearchParam = () => {
    const params = {} as ProductsSearchQueryParams;
    if (selectedCourse) {
      params.courseId = selectedCourse.id;
    }

    return params;
  };

  const productsSearchConf = productsSearchQuery({
    queryParams: productsSearchParam(),
  });

  const productsQuery = useQuery({
    queryKey: productsSearchConf.queryKey,
    queryFn: productsSearchConf.queryFn,
  });

  const handleSelectCourse = (course?: Course) => {
    setSelectedCourse(course);
  };


  const handleAddProduct = (product: Product) => {
    addProduct(product, 1);
  };

  const handlRefreshProducts = () => {
    queryClient.invalidateQueries({queryKey: productsSearchConf.queryKey}).then(() => {
      toast.success("Elenco prodotti aggiornato", {duration: 2000})
    }).catch((e: Error) => {console.log('Errore: ', e)})
  }

  if (productsQuery.isLoading) {
    return ( <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (productsQuery.isError) {
    return <Alert severity="error">Si è verificato un errore prelevando la lista dei prodotti: {productsQuery.error.message}</Alert>
  }

  if ( productsQuery.data ) {
    const products = productsQuery.data;

    if (products.length < 1) {
      return <Alert severity="warning">Nessuno prodotto presente</Alert>
    }

    return (
      <Box>
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.sagra.panelBackground }}>
          <CoursesSelector handleClick={handleSelectCourse} />
        </Paper>
        <Paper variant="outlined"
               sx={{ display: "flex", justifyContent: "flex-end", mt: 1, backgroundColor: theme.sagra.panelBackground }}
               className="paper-top">

          <IconButton>
            <AppsOutlined onClick={() => setType(0)} />
          </IconButton>
          <IconButton>
            <FormatListNumberedOutlined onClick={() => setType(1)} />
          </IconButton>
          <Divider orientation="vertical" flexItem />
          <IconButton>
            <CachedOutlined onClick={() => handlRefreshProducts()} />
          </IconButton>
        </Paper>
        <Paper variant="outlined" className="paper-bottom"
               sx={{ p: 1, pb: 2, backgroundColor: theme.sagra.panelBackground}}>
          <>
          {type == 0 ? (
            <ProductsOrderCard
              addToOrder={handleAddProduct}
              products={products}
            />
          ) : (
            <ProductsOrderList
              addToOrder={handleAddProduct}
              products={products}
            />
          )}
          </>
        </Paper>
      </Box>
    );
  }
};

export default ProductsToOrder;
