import { Box, Paper, Stack, Typography } from "@mui/material";
import { RestaurantOutlined } from "@mui/icons-material";
import { useState } from "react";
import ProductEdit from "./ProductEdit.tsx";
import { Product } from "../../api/sagra/sagraSchemas.ts";
import ProductsList from "./ProductsList.tsx";

const ProductContainer = () => {

  const [selected, setSelected] = useState<Product | undefined>(undefined);

  const selectProduct = (product: Product | undefined) => {
    setSelected(product)
  }

  return (
    <>
      <Stack direction="row" spacing={1} sx={{mb: 1, alignItems: 'center'}}>
        <RestaurantOutlined />
        <Typography sx={{fontWeight: 700, fontSize: '1.5em'}}>Prodotti</Typography>
      </Stack>

      <Paper variant="outlined" sx={{padding: 2}}>
        <ProductEdit key={selected?.id} selected={selected} setSelected={selectProduct}/>
      </Paper>
        <ProductsList selected={selected} setSelected={selectProduct}/>
      <Box sx={{mt: 1}}>
      </Box>
    </>
  );
};

export default ProductContainer