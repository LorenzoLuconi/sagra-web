import {CachedOutlined, PrintOutlined } from "@mui/icons-material"
import {Box, Divider, IconButton, Paper, Typography, useTheme} from "@mui/material"
import {queryClient} from "../../main.tsx";
import toast from "react-hot-toast";
import {orderStatsQuery} from "../../api/sagra/sagraComponents.ts";

interface StatsToolbarProps {
    title?: string
    toolbarBefore?: React.ReactElement
}

const StatsToolbar: React.FC<StatsToolbarProps> = (props) => {
    const {title,toolbarBefore} = props
    const theme = useTheme()

    const handleRefreshStats = () => {
        queryClient.invalidateQueries({queryKey: orderStatsQuery({}).queryKey}).then(() => {
            toast.success("Statistiche aggiornate", {duration: 2000})
        }).catch((e: Error) => {console.log('Errore: ', e)})
    }

    return (
        <Paper variant="outlined" sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
            mb: 1,
            backgroundColor: theme.sagra.panelBackground,
            borderRadius: '10px',
        }}>

            <Box>
                { title && <Typography sx={{ mr: 1, fontSize: "1rem", pt: 1 }}>{title}</Typography> }
            </Box>
            <Box sx={{
                minWidth: '200px',
                display: 'flex',
                justifyContent: 'flex-end', }}
            >
                { toolbarBefore }
                <IconButton disabled>
                    <PrintOutlined  />
                </IconButton>

                <Divider sx={{ml: 1, mr: 1}} orientation="vertical" flexItem />
                <IconButton>
                    <CachedOutlined onClick={() => handleRefreshStats()} />
                </IconButton>
            </Box>
        </Paper>
    )
}

export default StatsToolbar