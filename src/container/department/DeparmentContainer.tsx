import {Paper, useTheme} from "@mui/material";
import {DepartmentEdit} from "./DepartmentEdit";
import DepartmentsList from "./DepartmentsList.tsx";
import {WorkspacesOutlined} from "@mui/icons-material";
import PageTitle from "../../view/PageTitle.tsx";

const DepartmentContainer = () => {
    const theme = useTheme();

    return (
        <>
            <PageTitle title="Reparti" icon={<WorkspacesOutlined/>}/>

            <Paper variant="outlined" sx={{padding: 2, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-top">
                <DepartmentEdit/>
            </Paper>

            <Paper variant="outlined" sx={{mt: 1, p: 2, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-bottom">
                <DepartmentsList/>
            </Paper>
        </>
    );
};

export default DepartmentContainer