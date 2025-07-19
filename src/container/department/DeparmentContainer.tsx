import { Box, Paper, Typography } from "@mui/material";
import { DepartmentEdit } from "./DepartmentEdit";
import DepartmentsList from "./DepartmentsList.tsx";

const DepartmentContainer = () => {
  return (
    <Box sx={{margin: 2}}>
      <Typography sx={{fontWeight: 700, fontSize: '1.5em', m: 1}}>
        Reparti
      </Typography>
      <Paper variant="outlined" sx={{padding: 2}}>
        <DepartmentEdit />
      </Paper>
      <Box sx={{mt: 1}}>
        <DepartmentsList />
      </Box>
    </Box>
  );
};

export default DepartmentContainer