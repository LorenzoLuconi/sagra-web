import {Box, IconButton, Paper, useTheme} from "@mui/material";
import {CachedOutlined, FormatListNumberedOutlined} from "@mui/icons-material";
import {CourseEdit} from "./CourseEdit.tsx";
import CoursesList from "./CoursesList.tsx";
import PageTitle from "../../view/PageTitle.tsx";
import { coursesSearchQuery } from "../../api/sagra/sagraComponents.ts";
import {queryClient} from "../../main.tsx";
import toast from "react-hot-toast";

const CourseContainer = () => {
    const theme = useTheme();

    const searchConf = coursesSearchQuery({});
    const handleRefresh = () => {
        queryClient.invalidateQueries({queryKey: searchConf.queryKey}).then(() => {
            toast.success("Elenco portate aggiornato", {duration: 2000})
        }).catch((e: Error) => {console.log('Errore: ', e)})
    }


    return (
        <>
            <PageTitle title="Portate" icon={<FormatListNumberedOutlined/>}/>
            <Paper variant="outlined"
                   sx={{
                       display: "flex",
                       justifyContent: "space-between",
                       padding: 2,
                       flexWrap: "wrap",
                       gap: 1,
                       backgroundColor: theme.sagra.panelBackground}}
                   className='paper-top'>
                <CourseEdit/>
                <Box>
                    <IconButton sx={{ width: '40px'}}>
                        <CachedOutlined onClick={handleRefresh} />
                    </IconButton>
                </Box>
            </Paper>
            <Paper variant="outlined"
                   sx={{padding: 2, backgroundColor: theme.sagra.panelBackground}}
                   className='paper-bottom'>
                <CoursesList/>
            </Paper>
        </>
    );
};

export default CourseContainer