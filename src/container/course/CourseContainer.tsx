import {Box, Paper, Typography, useTheme} from "@mui/material";
import { FormatListNumberedOutlined } from "@mui/icons-material";
import { CourseEdit } from "./CourseEdit.tsx";
import CoursesList from "./CoursesList.tsx";

const CourseContainer = () => {
  const theme = useTheme();

  return (
    <>
      <Box sx={{display: 'flex', justifyContent: 'flex-start', mb: 1, mt: 1, alignItems: 'center'}}>
        <FormatListNumberedOutlined />
        <Typography sx={{fontWeight: 700, fontSize: '1.5em'}}>Portate</Typography>
      </Box>
      <Paper variant="outlined"
             sx={{padding: 2, backgroundColor: theme.sagra.panelBackground}}
            className='paper-top'>
        <CourseEdit />
      </Paper>
      <Paper variant="outlined"
             sx={{padding: 2, backgroundColor: theme.sagra.panelBackground}}
             className='paper-bottom'>
        <CoursesList />
      </Paper>
    </>
  );
};

export default CourseContainer