import { Box, Paper, Stack, Typography } from "@mui/material";
import { DepartmentEdit } from "./DepartmentEdit";
import DepartmentsList from "./DepartmentsList.tsx";
import { WorkspacesOutlined } from "@mui/icons-material";

const DepartmentContainer = () => {
  return (
    <>
      <Stack direction="row" spacing={1} sx={{mb: 1, alignItems: 'center'}}>
        <WorkspacesOutlined />
        <Typography sx={{fontWeight: 700, fontSize: '1.5em'}}>Reparti</Typography>
      </Stack>

      <Paper variant="outlined" sx={{padding: 2}}>
        <DepartmentEdit />
      </Paper>

      <Box sx={{mt: 1}}>
        <DepartmentsList />
      </Box>
    </>
  );
};

export default DepartmentContainer