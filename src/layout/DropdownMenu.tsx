import * as React from 'react'
import {alpha, Button, Menu, MenuProps, styled} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface DropdownMenuI extends Omit<MenuProps, 'open'> {
    id: string
    name: string
    icon?: React.ReactNode
}


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


const DropdownMenu: React.FC<DropdownMenuI> = (props) => {
  const {id, name, icon, children} = props
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);


    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
<>
        <Button
            aria-controls={open ? `${id}` : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            variant="text"
            disableElevation
            onClick={handleClick}
            endIcon={<KeyboardArrowDownIcon/>}
            startIcon={icon}
            sx={{ color: 'text.primary', marginRight: 1}}
        >
            {name}
        </Button>
    <StyledMenu
        id={`${id}`}
        slotProps={{
            list: {
                'aria-labelledby': `${id}` ,
            },
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
    >
        {children}
    </StyledMenu>
</>
    )
}

export default DropdownMenu;