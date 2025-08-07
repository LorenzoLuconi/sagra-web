import {Paper, useTheme} from "@mui/material";
import {CalculateOutlined} from "@mui/icons-material";
import {DiscountEdit} from "./DiscountEdit.tsx";
import DiscountsList from "./DiscountsList.tsx";
import {useState} from "react";
import {Discount} from "../../api/sagra/sagraSchemas.ts";
import PageTitle from "../../view/PageTitle.tsx";

const DiscountContainer = () => {

    const theme = useTheme();
    const [selected, setSelected] = useState<Discount | undefined>(undefined);

    const selectDiscount = (discount: Discount | undefined) => {
        setSelected(discount)
    }

    return (
        <>
            <PageTitle title="Sconti" icon={<CalculateOutlined/>}/>

            <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.sagra.panelBackground}}
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