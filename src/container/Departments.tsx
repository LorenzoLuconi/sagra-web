// import React from 'react'

import { useMutation, useQuery } from "@tanstack/react-query";
import { departmentsSearchQuery, fetchDepartmentCreate, fetchDepartmentDelete } from "../api/sagra/sagraComponents.ts";
import {
  Box,
  Button, IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField, Typography
} from "@mui/material";
import { Department, DepartmentRequest } from "../api/sagra/sagraSchemas.ts";
import * as React from "react";
import { DeleteOutlined } from "@mui/icons-material";
import { queryClient } from "../main.tsx";

const DepartmentEdit = () => {

  const [state, setState] = React.useState('')

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
    setState(event.currentTarget.value);
  }, [setState])

  const departmentCreate = useMutation({
    mutationFn: ( request: DepartmentRequest ) => {
      return fetchDepartmentCreate({ body: request})
    },
    onSuccess: (data) => {
      const departmentsSearchConf = departmentsSearchQuery({});
      queryClient.invalidateQueries({ queryKey: departmentsSearchConf.queryKey }).then(() => {
      console.log("Reparto creato: " + data.name);
      })
    }
  })

  return (
    <form>
      <TextField required
                 value={state}
                 id="outlined-required"
                 label="Nome Reparto"
                 placeholder="Cucina"
                 onChange={handleChange}
      />
      <Button variant="contained" onClick={ () => {
        departmentCreate.mutate({name: state} as DepartmentRequest);
      }}>Crea Reparto</Button>
    </form>
  );
};

const DepartmentsContainer = () => {
  return (
    <Box sx={{margin: 2, padding: 2, background: '#FAFAFA'}}>
      <Typography variant="h3">
        Reparti
      </Typography>
      <Paper variant="outlined" sx={{padding: 2}}>
        <DepartmentEdit />
      </Paper>
      <Paper variant="outlined" sx={{marginTop: 1}}>
        <Departments />
      </Paper>
    </Box>
  );
};

const Departments = () => {
  const departmentsSearchConf = departmentsSearchQuery({});

  const departments = useQuery({
    queryKey: departmentsSearchConf.queryKey,
    queryFn: departmentsSearchConf.queryFn,
  });

  const departmentDelete = useMutation(({
    mutationFn: ( departmentId: number ) => {
      return fetchDepartmentDelete({ pathParams: { departmentId: departmentId}})
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentsSearchConf.queryKey }).then(() => {
        console.log("Reparto Cancellato: " + data);
      })
    }
  }))

  const departmentsData = departments.data;
  console.log("Loaded Departments: ", departmentsData);

  if (departments.isFetched) {
    if (departmentsData === undefined) {
      return <span>Nessun reparto trovato</span>;
    }

    return (
      <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome Reparto</TableCell>
                <TableCell>Azione</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {departmentsData?.map((department: Department, idx) => {
                return (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>
                      <IconButton aria-label="delete"
                            onClick={() => {
                              departmentDelete.mutate(department.id as number)
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
  }

  if (departments.isError) {
    return <span>Si è verificato un errore</span>;
  }

  return <span>Caricamento in corso</span>;
};

export default DepartmentsContainer;
