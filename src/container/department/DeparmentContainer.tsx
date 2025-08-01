import { Box, Paper, Typography, useTheme } from "@mui/material";
import { DepartmentEdit } from "./DepartmentEdit";
import DepartmentsList from "./DepartmentsList.tsx";
import { WorkspacesOutlined } from "@mui/icons-material";

const DepartmentContainer = () => {
    const theme =  useTheme();
  return (
    <Box sx={{mt :1}}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1, alignItems: 'center'}}>
        <WorkspacesOutlined />
        <Typography sx={{fontWeight: 700, fontSize: '1.5em'}}>Reparti</Typography>
      </Box>

      <Paper variant="outlined" sx={{padding: 2, backgroundColor: theme.sagra.panelBackground }}
             className="paper-top">
        <DepartmentEdit />
      </Paper>

      <Paper variant="outlined" sx={{mt: 1, p: 2, backgroundColor: theme.sagra.panelBackground}}
        className="paper-bottom">
        <DepartmentsList />
      </Paper>
    </Box>
  );
};

export default DepartmentContainer