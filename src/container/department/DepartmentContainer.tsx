import * as React from 'react'
import {IconButton, Paper, useTheme} from "@mui/material";
import {DepartmentEdit} from "./DepartmentEdit";
import DepartmentsList from "./DepartmentsList.tsx";
import {CachedOutlined, WorkspacesOutlined} from "@mui/icons-material";
import PageTitle from "../../view/PageTitle.tsx";
import {departmentsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {queryClient} from "../../main.tsx";
import toast from "react-hot-toast";

const DepartmentContainer = (): React.ReactElement => {
    const theme = useTheme();

    const searchConf = departmentsSearchQuery({});
    const handleRefresh = () => {
        queryClient.invalidateQueries({queryKey: searchConf.queryKey}).then(() => {
            toast.success("Elenco reparti aggiornato", {duration: 2000})
        }).catch((e: Error) => {console.log('Errore: ', e)})
    }

    return (
        <>
            <PageTitle title="Reparti" icon={<WorkspacesOutlined/>}/>

            <Paper variant="outlined"
                   sx={{
                       display: "flex",
                       justifyContent: "space-between",
                       padding: 2,
                       flexWrap: "wrap",
                       gap: 1,
                       backgroundColor: theme.sagra.panelBackground}}
                   className="paper-top">
                <DepartmentEdit/>
                <IconButton sx={{ width: '40px'}}>
                    <CachedOutlined onClick={handleRefresh} />
                </IconButton>
            </Paper>

            <Paper variant="outlined" sx={{mt: 1, p: 2, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-bottom">
                <DepartmentsList/>
            </Paper>
        </>
    );
};

export default DepartmentContainer