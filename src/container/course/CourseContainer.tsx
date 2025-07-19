import { Box, Paper, Stack, Typography } from "@mui/material";
import { FormatListNumberedOutlined } from "@mui/icons-material";
import { CourseEdit } from "./CourseEdit.tsx";
import CoursesList from "./CoursesList.tsx";

const CourseContainer = () => {
  return (
    <Box sx={{margin: 2}}>
      <Stack direction="row" spacing={1} sx={{mb: 1, alignItems: 'center'}}>
        <FormatListNumberedOutlined />
        <Typography sx={{fontWeight: 700, fontSize: '1.5em'}}>Portate</Typography>
      </Stack>
      <Paper variant="outlined" sx={{padding: 2}}>
        <CourseEdit />
      </Paper>
      <Box sx={{mt: 1}}>
        <CoursesList />
      </Box>
    </Box>
  );
};

export default CourseContainer