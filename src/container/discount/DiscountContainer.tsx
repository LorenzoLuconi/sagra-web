import { Box, Paper, Stack, Typography } from "@mui/material";
import { CalculateOutlined, WorkspacesOutlined } from "@mui/icons-material";
import { DiscountEdit } from "./DiscountEdit.tsx";
import DiscountsList from "./DiscountsList.tsx";

const DiscountContainer = () => {
  return (
    <>
      <Stack direction="row" spacing={1} sx={{mb: 1, alignItems: 'center'}}>
        <CalculateOutlined />
        <Typography sx={{fontWeight: 700, fontSize: '1.5em'}}>Sconti</Typography>
      </Stack>

      <Paper variant="outlined" sx={{padding: 2}}>
        <DiscountEdit/>
      </Paper>

      <Box sx={{mt: 1}}>
        <DiscountsList />
      </Box>
    </>
  );
};

export default DiscountContainer