import * as React from 'react'
import {
    alpha,
    AppBar,
    Box,
    Button,
    Divider,
    Menu,
    MenuItem,
    MenuProps,
    Paper,
    styled,
    Typography,
} from "@mui/material";
import {useNavigate} from "react-router";
import {Logo} from "./Logo.tsx";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
    AccountCircleOutlined,
    AssessmentOutlined,
    CalculateOutlined,
    KeyOutlined,
    LogoutOutlined,
    FormatListNumberedOutlined,
    LibraryBooksOutlined,
    MonitorOutlined,
    PeopleOutlined,
    ReceiptOutlined,
    RestaurantOutlined,
    SettingsOutlined,
    TuneOutlined,
    WarehouseOutlined,
    WorkspacesOutlined
} from "@mui/icons-material";
import MaterialUISwitch from "../view/MaterialUISwitch.tsx";
import {useAppConf} from "../AppConf.ts";
import {useAuth} from "../context/AuthStore.tsx";
import ChangePasswordDialog from "../view/ChangePasswordDialog.tsx";

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

    const navigate = useNavigate()
    const {user, logout, isLogoutPending} = useAuth()
    const {showThemeSwitcher} = useAppConf();
    const isAdmin = user?.role === "admin";
    const [adminAnchorEl, setAdminAnchorEl] = React.useState<null | HTMLElement>(null);
    const [userAnchorEl, setUserAnchorEl] = React.useState<null | HTMLElement>(null);
    const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
    const adminMenuOpen = Boolean(adminAnchorEl);
    const userMenuOpen = Boolean(userAnchorEl);
    const handleAdminClick = (event: React.MouseEvent<HTMLElement>) => {
        setAdminAnchorEl(event.currentTarget);
    };
    const handleAdminClose = () => {
        setAdminAnchorEl(null);
    };
    const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
        setUserAnchorEl(event.currentTarget);
    };
    const handleUserClose = () => {
        setUserAnchorEl(null);
    };
    const handleNavigate = (path: string) => {
        handleAdminClose();
        navigate(path);
    };

    const handleLogout = async () => {
        handleUserClose();
        await logout();
        navigate("/");
    };

    return (
        <AppBar  position={'sticky'} sx={{backgroundColor: 'transparent'}}>
            <Paper elevation={2} sx={{ display: 'flex', p: 1, alignItems: 'center'}}>
                <Logo sx={{fontSize: '3rem', color: 'text.primary'}}/>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mr: 1}}>
                    <Button variant="text" color={'error'} startIcon={<ReceiptOutlined/>} sx={{  mr: 1}}
                            onClick={() => {navigate('/orders/new')}}>Nuovo Ordine</Button>
                    <Button variant="text"  startIcon={<LibraryBooksOutlined />} sx={{ color: 'text.primary', marginRight: 1}} onClick={() => {navigate('/orders')}}>Elenco Ordini</Button>

                    {isAdmin && (
                        <>
                            <Button
                                aria-controls={adminMenuOpen ? 'admin-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={adminMenuOpen ? 'true' : undefined}
                                variant="text"
                                disableElevation
                                onClick={handleAdminClick}
                                endIcon={<KeyboardArrowDownIcon/>}
                                startIcon={<SettingsOutlined />}
                                sx={{ color: 'text.primary', marginRight: 1}}
                            >
                                Admin
                            </Button>
                            <StyledMenu
                                id="admin-menu"
                                slotProps={{
                                    list: {
                                        'aria-labelledby': 'admin-menu-button',
                                    },
                                }}
                                anchorEl={adminAnchorEl}
                                open={adminMenuOpen}
                                onClose={handleAdminClose}
                            >
                                <MenuItem onClick={() => {handleNavigate('/products')}}>
                                    <RestaurantOutlined />
                                    Prodotti
                                </MenuItem>
                                <MenuItem onClick={() => {handleNavigate('/products/updateQuantity')}}>
                                    <WarehouseOutlined />
                                    Giacenze Magazzino
                                </MenuItem>
                                <MenuItem onClick={() => {handleNavigate('/departments')}}>
                                    <WorkspacesOutlined />
                                    Reparti
                                </MenuItem>
                                <MenuItem onClick={() => {handleNavigate('/courses')}}>
                                    <FormatListNumberedOutlined />
                                    Portate
                                </MenuItem>
                                <MenuItem onClick={() => {handleNavigate('/discounts')}}>
                                    <CalculateOutlined/>
                                    Sconti
                                </MenuItem>
                                <MenuItem onClick={() => {handleNavigate('/users')}}>
                                    <PeopleOutlined />
                                    Utenti
                                </MenuItem>
                                <MenuItem onClick={() => {handleNavigate('/configurations')}}>
                                    <TuneOutlined />
                                    Configurazioni
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={() => {handleNavigate('/stats')}}>
                                    <AssessmentOutlined />
                                    Statistiche
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={() => {handleNavigate('/monitors')}}>
                                    <MonitorOutlined/>
                                    Monitor
                                </MenuItem>
                            </StyledMenu>
                        </>
                    )}
                    <Button
                        startIcon={<AccountCircleOutlined />}
                        aria-controls={userMenuOpen ? 'user-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={userMenuOpen ? 'true' : undefined}
                        variant="text"
                        disableElevation
                        color="inherit"
                        endIcon={<KeyboardArrowDownIcon />}
                        onClick={handleUserClick}
                        sx={{mr: 1, textTransform: 'none'}}
                    >
                        {user?.name ?? user?.username ?? 'Utente'}
                    </Button>

                    <StyledMenu
                        id="user-menu"
                        anchorEl={userAnchorEl}
                        open={userMenuOpen}
                        onClose={handleUserClose}
                    >
                        <Box sx={{ alignItems: 'center', p: 2}}>
                            <Box>
                                <Typography sx={{fontSize: '0.8em'}}>Username</Typography>
                                <Typography>{user?.username}</Typography>
                            </Box>
                            <Box sx={{mt: 1}}>
                                <Typography sx={{fontSize: '0.8em'}}>Ruolo</Typography>
                                <Typography>{user?.role === 'admin' ? 'Admin' : 'Cassiere'}</Typography>
                            </Box>
                        </Box>
                        <Divider/>
                        <MenuItem onClick={() => {
                            handleUserClose();
                            setPasswordDialogOpen(true);
                        }}>
                            <KeyOutlined />
                            Modifica password
                        </MenuItem>
                        <Divider />
                        <MenuItem disabled={isLogoutPending} onClick={() => void handleLogout()}>
                            <LogoutOutlined />
                            Esci
                        </MenuItem>
                    </StyledMenu>
                    <MaterialUISwitch sx={{ display: showThemeSwitcher ? 'flex' : 'none'}}onChange={(event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
                        console.log('event: ', event)
                        console.log('checked: ', checked)
                        props.changeTheme(checked?'dark': 'light')
                    }}/>
                </Box>
            </Paper>
            <ChangePasswordDialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} />
        </AppBar>
    )
}
export default Header
