import { Box, Paper, Stack, Typography } from "@mui/material";
import { CalculateOutlined } from "@mui/icons-material";
import { DiscountEdit } from "./DiscountEdit.tsx";
import DiscountsList from "./DiscountsList.tsx";
import { useState } from "react";
import { Discount } from "../../api/sagra/sagraSchemas.ts";

const DiscountContainer = () => {

  const [selected, setSelected] = useState<Discount | undefined>(undefined);

  const selectDiscount = (discount: Discount | undefined) => {
    setSelected(discount)
  }

  return (
    <>
      <Stack direction="row" spacing={1} sx={{mb: 1, alignItems: 'center'}}>
        <CalculateOutlined />
        <Typography sx={{fontWeight: 700, fontSize: '1.5em'}}>Sconti</Typography>
      </Stack>

      <Paper variant="outlined" sx={{padding: 2}}>
        <DiscountEdit key={selected?.id} selected={selected} setSelected={selectDiscount}/>
      </Paper>

      <Box sx={{mt: 1}}>
        <DiscountsList selected={selected} setSelected={selectDiscount}/>
      </Box>
    </>
  );
};

export default DiscountContainer