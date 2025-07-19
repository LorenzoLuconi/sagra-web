// import React from 'react'

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  departmentsSearchQuery,
  fetchDepartmentDelete,
  fetchDepartmentUpdate,
} from "../../api/sagra/sagraComponents.ts";
import {
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { Department, DepartmentRequest } from "../../api/sagra/sagraSchemas.ts";
import * as React from "react";
import {
  Check,
  Close,
  DeleteOutlined,
  EditOutlined,
} from "@mui/icons-material";
import { queryClient } from "../../main.tsx";
import { green, red } from "@mui/material/colors";
import toast from "react-hot-toast";

const DepartmentsList = () => {
  const departmentsSearchConf = departmentsSearchQuery({});

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

  if (departmentsQuery.isFetched) {

    const departments = departmentsQuery.data;

    if (departments === undefined) {
      return <span>Errore inattesa nel prelevamento dei reparti</span>;
    }

    if ( departments.length < 1 ) {
      return <></>
    }

    return (
      <form>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome Reparto</TableCell>
              <TableCell>Azione</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {departments?.map((department: Department) => {
              return (
                <TableRow key={department.id}>
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
                      return <TableCell sx={{fontSize: '1.2em'}}>{department.name}</TableCell>;
                    }
                  })()}
                  <TableCell>
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
      </form>
    );
  }

  if (departmentsQuery.isError) {
    return <span>Si è verificato un errore</span>;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CircularProgress />
    </Box>
  );
};

export default DepartmentsList;
