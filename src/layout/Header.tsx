import * as React from 'react'
import {
    alpha,
    AppBar,
    Box,
    Button,
    ButtonProps,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    MenuProps,
    Paper,
    SelectChangeEvent,
    styled,
} from "@mui/material";
import {red} from "@mui/material/colors";
import {useNavigate} from "react-router";
import {Logo} from "./Logo.tsx";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
    AccountCircleOutlined,
    AssessmentOutlined,
    CalculateOutlined,
    FormatListNumberedOutlined,
    LibraryBooksOutlined,
    MonitorOutlined,
    ReceiptOutlined,
    RestaurantOutlined,
    SettingsOutlined,
    WarehouseOutlined,
    WorkspacesOutlined
} from "@mui/icons-material";
import MaterialUISwitch from "../view/MaterialUISwitch.tsx";

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

interface HeaderI {
    changeTheme: (theme: string) => void
}


const Header: React.FC<HeaderI> = (props): React.ReactElement => {

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
        <AppBar  position={'sticky'} sx={{backgroundColor: 'transparent'}}>
            <Paper elevation={2} sx={{ display: 'flex', p: 1, alignItems: 'center'}}>
                <Logo sx={{fontSize: '3rem'}} color={'text.primary'}/>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginRight: 1}}>
                    <Button variant="text" color={'error'} startIcon={<ReceiptOutlined/>} sx={{  marginRight: 1}} onClick={() => {navigate('/orders/new')}}>Nuovo Ordine</Button>
                    <Button variant="text"  startIcon={<LibraryBooksOutlined />} sx={{ color: 'text.primary', marginRight: 1}} onClick={() => {navigate('/orders')}}>Elenco Ordini</Button>

                    <Button
                        aria-controls={open ? 'demo-customized-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        variant="text"
                        disableElevation
                        onClick={handleClick}
                        endIcon={<KeyboardArrowDownIcon/>}
                        startIcon={<SettingsOutlined />}
                        sx={{ color: 'text.primary', marginRight: 1}}
                    >
                        Admin
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
                        <MenuItem onClick={() => {navigate('/products')}}>
                            <RestaurantOutlined />
                            Prodotti
                        </MenuItem>
                        <MenuItem onClick={() => {navigate('/departments')}}>
                            <WorkspacesOutlined />
                            Reparti
                        </MenuItem>
                        <MenuItem onClick={() => {navigate('/courses')}}>
                            <FormatListNumberedOutlined />
                            Portate
                        </MenuItem>
                        <MenuItem onClick={() => {navigate('/discounts')}}>
                            <CalculateOutlined/>
                            Sconti
                        </MenuItem>

                        <MenuItem disabled onClick={() => {navigate('/products/init')}}>
                            <WarehouseOutlined />
                            Magazzino
                        </MenuItem>
                        <Divider />
                        <MenuItem disabled onClick={() => {navigate('/stats')}}>
                            <AssessmentOutlined />
                            Statistiche
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => {navigate('/monitors')}}>
                            <MonitorOutlined/>
                            Monitor
                        </MenuItem>
                    </StyledMenu>
                    <IconButton disabled>
                        <AccountCircleOutlined />
                    </IconButton>
                    <MaterialUISwitch onChange={(event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
                        console.log('event: ', event)
                        console.log('checked: ', checked)
                        props.changeTheme(checked?'dark': 'light')
                    }}/>
                </Box>
            </Paper>
        </AppBar>
    )
}
export default Header