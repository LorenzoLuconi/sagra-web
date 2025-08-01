import {Box, Paper, Typography, useTheme} from "@mui/material";
import {CalculateOutlined} from "@mui/icons-material";
import {DiscountEdit} from "./DiscountEdit.tsx";
import DiscountsList from "./DiscountsList.tsx";
import {useState} from "react";
import {Discount} from "../../api/sagra/sagraSchemas.ts";

const DiscountContainer = () => {

    const theme = useTheme();
    const [selected, setSelected] = useState<Discount | undefined>(undefined);

    const selectDiscount = (discount: Discount | undefined) => {
        setSelected(discount)
    }

    return (
        <>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', mb: 1, alignItems: 'center'}}>
                <CalculateOutlined/>
                <Typography sx={{fontWeight: 700, fontSize: '1.5em'}}>Sconti</Typography>
            </Box>

            <Paper variant="outlined" sx={{mt: 1, p: 2, backgroundColor: theme.sagra.panelBackground}}
                className="paper-top">
                <DiscountEdit key={selected?.id} selected={selected} setSelected={selectDiscount}/>
            </Paper>

            <Paper variant="outlined" sx={{mt: 1, p: 2, backgroundColor: theme.sagra.panelBackground}}
                className="paper-bottom">
                <DiscountsList selected={selected} setSelected={selectDiscount}/>
            </Paper>
        </>
    );
};

export default DiscountContainer