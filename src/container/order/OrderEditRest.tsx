import * as React from "react";
import {currency} from "../../utils";
import {Box, TextField, Typography} from "@mui/material";
import {useOrderStore} from "../../context/OrderStore.tsx";
import { CalculateOutlined } from "@mui/icons-material";


const OrderEditRest: React.FC = () => {
    const {order} = useOrderStore();
    const {totalAmount} = order

    const [cash, setCash] = React.useState<number | undefined>(undefined);
    const [rest, setRest] = React.useState<number | undefined>(undefined);

    const handleChangeCash =
        React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
                const value = Number.parseFloat(event.target.value)
                if (!isNaN(value)) {
                    setCash(value);
                    setRest(value - totalAmount);   // sempre, anche se negativo
                } else {
                    setCash(undefined);
                    setRest(undefined);
                }
            }, [setCash, setRest, totalAmount],
        );

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if ( event.key == 'Escape' ) {
            setCash(undefined)
            setRest(undefined)
        }
    };

    return (
        <Box sx={{display: 'flex', justifyContent: "flex-start", alignItems: "center", gap: 2}}>
            <Box sx={{ width: '50px' }}>
                <CalculateOutlined sx={{ fontSize: '2rem' }}/>
            </Box>
            <TextField
                size="small"
                variant="outlined"
                type="number"
                value={cash ?? ''}
                placeholder="es: 88.50"
                onChange={handleChangeCash}
                label="Contanti"
                onKeyUp={handleKeyPress}
                slotProps={{ htmlInput: { size: 8, min: 1 } }}
            />

            { rest &&
                <Box sx={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', minWidth: '150px'}}>
                    <Typography component="div" sx={{fontSize: '0.9rem', textTransform: 'uppercase' }}>{rest >= 0 ? "Resto:" : "Mancante:"} </Typography>
                    <Typography component="div" sx={{ml: 1, fontSize: '1.2rem', minWidth: '150px'}}>{rest > 0 ? currency(rest) : currency(-rest)}</Typography>
                </Box>
            }
        </Box>
    )
}

export default OrderEditRest;