import {Paper, useTheme} from "@mui/material";
import {FormatListNumberedOutlined} from "@mui/icons-material";
import {CourseEdit} from "./CourseEdit.tsx";
import CoursesList from "./CoursesList.tsx";
import PageTitle from "../../view/PageTitle.tsx";

const CourseContainer = () => {
    const theme = useTheme();

    return (
        <>
            <PageTitle title="Portate" icon={<FormatListNumberedOutlined/>}/>
            <Paper variant="outlined"
                   sx={{padding: 2, backgroundColor: theme.sagra.panelBackground}}
                   className='paper-top'>
                <CourseEdit/>
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