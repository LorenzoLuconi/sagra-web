import * as React from 'react'
import {
  Box,
  Button,
  ButtonProps,
  Divider,
  styled,
  Typography,
} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import { red } from "@mui/material/colors";

const RedButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText(red[700]),
  backgroundColor: red[700],
  '&:hover': {
    backgroundColor: red[900],
  },
}));

const Header = (): React.ReactElement => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', p: 1, border: '1px solid grey' }}>
        <RedButton startIcon={<ReceiptIcon />} variant="contained">Nuovo Ordine</RedButton>
        <Typography sx={{ minWidth: 80 }}>Ordini</Typography>
        <Typography sx={{ minWidth: 80 }}>Prodotti</Typography>
        <Divider orientation="vertical" flexItem />
        <Typography sx={{ minWidth: 80 }}>Admin</Typography>
      </Box>

        )
}
export default Header