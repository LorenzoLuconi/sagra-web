import {Box, IconButton, Paper, useTheme} from "@mui/material";
import {CachedOutlined, CalculateOutlined} from "@mui/icons-material";
import {DiscountEdit} from "./DiscountEdit.tsx";
import DiscountsList from "./DiscountsList.tsx";
import {useState} from "react";
import {Discount} from "../../api/sagra/sagraSchemas.ts";
import PageTitle from "../../view/PageTitle.tsx";
import {discountsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {queryClient} from "../../main.tsx";
import toast from "react-hot-toast";

const DiscountContainer = () => {

    const theme = useTheme();
    const [selected, setSelected] = useState<Discount | undefined>(undefined);

    const selectDiscount = (discount: Discount | undefined) => {
        setSelected(discount)
    }

    const searchConf = discountsSearchQuery({});
    const handleRefresh = () => {
        queryClient.invalidateQueries({queryKey: searchConf.queryKey}).then(() => {
            toast.success("Elenco sconti aggiornato", {duration: 2000})
        }).catch((e: Error) => {console.log('Errore: ', e)})
    }

    return (
        <>
            <PageTitle title="Sconti" icon={<CalculateOutlined/>}/>

            <Paper variant="outlined"
                   sx={{
                       display: "flex",
                       justifyContent: "space-between",
                       padding: 2,
                       flexWrap: "wrap",
                       gap: 1,
                       backgroundColor: theme.sagra.panelBackground}}
                   className="paper-top">
                <DiscountEdit key={selected?.id} selected={selected} setSelected={selectDiscount}/>
                <Box>
                    <IconButton sx={{ width: '40px'}}>
                        <CachedOutlined onClick={handleRefresh} />
                    </IconButton>
                </Box>
            </Paper>

            <Paper variant="outlined" sx={{mt: 1, p: 2, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-bottom">
                <DiscountsList selected={selected} setSelected={selectDiscount}/>
            </Paper>
        </>
    );
};

export default DiscountContainer