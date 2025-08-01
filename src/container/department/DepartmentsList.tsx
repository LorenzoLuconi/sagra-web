// import React from 'react'

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  departmentsSearchQuery,
  fetchDepartmentDelete,
  fetchDepartmentUpdate,
} from "../../api/sagra/sagraComponents.ts";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Department, DepartmentRequest } from "../../api/sagra/sagraSchemas.ts";
import * as React from "react";
import {
  Check,
  Close,
  DeleteOutlined,
  EditOutlined, SettingsOutlined,
} from "@mui/icons-material";
import { queryClient } from "../../main.tsx";
import { green, red } from "@mui/material/colors";
import toast from "react-hot-toast";

const DepartmentsList = () => {

  const [selected, setSelected] = React.useState(-1);
  const [nameEdit, setNameEdit] = React.useState("");

  const resetState = () => {
    setSelected(-1);
    setNameEdit("");
  };

  const handleChange = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (event) => {
      setNameEdit(event.currentTarget.value);
    },
    [setNameEdit],
  );

  const departmentsSearchConf = departmentsSearchQuery({});
  const departmentsQuery = useQuery({
    queryKey: departmentsSearchConf.queryKey,
    queryFn: departmentsSearchConf.queryFn,
  });

  const departmentDelete = useMutation({
    mutationFn: (departmentId: number) => {
      return fetchDepartmentDelete({
        pathParams: { departmentId: departmentId },
      });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: departmentsSearchConf.queryKey })
        .then(() => {
          toast.success('Reparto cancellato');
        });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const departmentUpdate = useMutation({
    mutationFn: ({
      departmentId,
      departmentRequest,
    }: {
      departmentId: number;
      departmentRequest: DepartmentRequest;
    }) => {
      return fetchDepartmentUpdate({
        body: departmentRequest,
        pathParams: { departmentId: departmentId },
      });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: departmentsSearchConf.queryKey })
        .then(() => {
          console.log("Nome reparto modificato");
          toast.success('Nome reparto modificato');
        });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (departmentsQuery.isError) {
    return <Alert severity="error">Si è verificato un errore prelevando la lista dei reparti: {departmentsQuery.error.message}</Alert>
  }

  if (departmentsQuery.isPending) {
    return (
        <Box sx={{alignItems: 'center', justifyItems: 'center', m: 2}}>
          <CircularProgress/>
        </Box>
    );
  }


  const departments = departmentsQuery.data;

  if (! departments || departments.length < 1) {
    return <Typography>Nessuno reparto presente</Typography>
  }

  return (
      <>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "background.default" }}>
            <TableCell>Nome Reparto</TableCell>
            <TableCell sx={{ width: '100px'}} align="center"><SettingsOutlined /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ backgroundColor: "background.default" }}>
        {departments?.map((department: Department) => {
            return (
              <TableRow key={department.id} selected={selected == department.id}>
                {(() => {
                  if (selected == department.id) {
                    return (
                      <TableCell>
                        <TextField
                          required
                          value={nameEdit}
                          size="small"
                          onChange={handleChange}
                          slotProps={{ htmlInput: { size: 32 } }}
                        />
                        <IconButton
                          aria-label="Salva modifica"
                          onClick={() => {
                            const request: DepartmentRequest = {
                              name: nameEdit,
                            };
                            departmentUpdate.mutate({
                              departmentId: department.id,
                              departmentRequest: request,
                            });
                            resetState();
                          }}
                        >
                          <Check sx={{ color: green[700] }} />
                        </IconButton>
                        <IconButton
                          aria-label="Annulla modifica"
                          onClick={() => {
                            resetState();
                          }}
                        >
                          <Close sx={{ color: red[700] }} />
                        </IconButton>
                      </TableCell>
                    );
                  } else {
                    return <TableCell sx={{ fontSize: '1.2em' }}>{department.name}</TableCell>;
                  }
                })()}
                <TableCell align="center">
                  <IconButton
                    aria-label="edit"
                    onClick={() => {
                      setSelected(department.id);
                      setNameEdit(department.name);
                    }}
                  >
                    <EditOutlined />
                  </IconButton>

                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      resetState();
                      departmentDelete.mutate(department.id as number);
                    }}
                  >
                    <DeleteOutlined />
                  </IconButton>

                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );


};

export default DepartmentsList;
