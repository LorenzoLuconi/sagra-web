import * as React from 'react'
import {
  Box,
  Button,
  ButtonProps,
  Menu,
  Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent,
  styled,
  Typography, MenuProps, alpha, Paper
} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import { red } from "@mui/material/colors";
import {Link, useNavigate} from "react-router";
import {Logo} from "./Logo.tsx";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const RedButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText(red[700]),
  backgroundColor: red[700],
  '&:hover': {
    backgroundColor: red[900],
  },
}));

const StyledMenu = styled((props: MenuProps) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color: 'rgb(55, 65, 81)',
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity,
                ),
            },
        },
        ...theme.applyStyles('dark', {
            color: theme.palette.grey[300],
        }),
    },
}));
const Header = (): React.ReactElement => {
    const [selection, setSelection] = React.useState(undefined);
    const navigate = useNavigate()
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChange = (event: SelectChangeEvent<string>) => {
        setSelection(event.target.value as string);
        if (event.target.value !== undefined) {
            navigate(event.target.value)
        }
    };
    return (
      <Paper sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center', p: 1, border: '1px solid grey' }}>
          <Logo/>
          <RedButton startIcon={<ReceiptIcon />} variant="contained" onClick={() => {navigate('/orders/new')}}>Nuovo Ordine</RedButton>
          <Typography sx={{ minWidth: 80 }}><Link to={'/orders'}>Ordini</Link></Typography>

          <Button
              id="demo-customized-button"
              aria-controls={open ? 'demo-customized-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              variant="contained"
              disableElevation
              onClick={handleClick}
              endIcon={<KeyboardArrowDownIcon/>}
          >
              Options
          </Button>
          <StyledMenu
              id="demo-customized-menu"
              slotProps={{
                  list: {
                      'aria-labelledby': 'demo-customized-button',
                  },
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
          >
              <MenuItem onClick={() => {navigate('/products')}}>Prodotti</MenuItem>
              <MenuItem onClick={() => {navigate('/departments')}}>Reparti</MenuItem>
              <MenuItem onClick={() => {navigate('/coarse')}}>Portate</MenuItem>
          </StyledMenu>


        <Typography sx={{ minWidth: 80 }}>Admin</Typography>
      </Paper>

        )
}
export default Header