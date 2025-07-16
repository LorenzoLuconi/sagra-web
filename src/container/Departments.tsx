// import React from 'react'

import {useMutation, useQuery} from "@tanstack/react-query";
import {departmentsSearchQuery, fetchDepartmentCreate, fetchDepartmentDelete} from "../api/sagra/sagraComponents.ts";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import {Department, DepartmentRequest} from "../api/sagra/sagraSchemas.ts";
import * as React from "react";
import {AddCircle, Check, Close, DeleteOutlined, EditOutlined} from "@mui/icons-material";
import {queryClient} from "../main.tsx";
import {green, red} from "@mui/material/colors";
import toast from "react-hot-toast";

const DepartmentEdit = () => {

  const [state, setState] = React.useState({name: '', submitDisabled: true})

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {

    if ( event.currentTarget.value )
      setState({ name: event.currentTarget.value, submitDisabled: false });
    else
      setState({ name: event.currentTarget.value, submitDisabled: true });

  }, [setState])

  const departmentCreate = useMutation({
    mutationFn: ( request: DepartmentRequest ) => {
      return fetchDepartmentCreate({ body: request})
    },
    onSuccess: (data) => {
      const departmentsSearchConf = departmentsSearchQuery({});
      queryClient.invalidateQueries({ queryKey: departmentsSearchConf.queryKey }).then(() => {
      console.log("Reparto creato: " + data.name);
      toast.success(`Reparto ${data.name} creato con succeso`)
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  return (
    <form>
      <Box sx={{display: 'flex', alignItems: 'center', gap: '20px'}}>
      <TextField
          size={"small"}
          required
          value={state.name}
          id="outlined-required"
          label="Nome Reparto"
          placeholder="Cucina"
          onChange={handleChange}
      />
      <Button variant="contained" startIcon={<AddCircle/>} disabled={state.submitDisabled} onClick={ () => {
        if ( ! state.name ) {
          setState({...state, error: true})
        } else {
          departmentCreate.mutate({ name: state.name } as DepartmentRequest);
        }
      }}>Crea Reparto</Button>
      </Box>
    </form>
  );
};

const DepartmentsContainer = () => {
  return (
    <Box sx={{margin: 2}}>
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

  const [state, setState] = React.useState({selected: -1})


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
        <form>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome Reparto</TableCell>
                <TableCell>Azione</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {departmentsData?.map((department: Department) => {
                return (
                  <TableRow key={department.id}>
                    {(() => {
                      if ( state.selected == department.id){
                        return (
                          <>
                            <TextField required value={department.name} />
                            <IconButton aria-label="confirm-edit"
                                        onClick={() => {
                                          setState({selected: department.id as number})
                                        }}
                            >
                            <Check sx={{ color: green[700] }}/>
                            </IconButton>
                            <IconButton aria-label="cancel-edit"
                                        onClick={() => {
                                          setState({selected: -1})
                                        }}
                            >
                              <Close sx={{ color: red[700] }}/>
                            </IconButton>
                        </>

                        )
                      } else {
                        return (
                          <TableCell>{department.name}</TableCell>
                        )
                      }
                    })()}
                    <TableCell>
                      <IconButton aria-label="delete"
                            onClick={() => {
                              setState({selected: -1})
                              departmentDelete.mutate(department.id as number)
                            }}
                      >
                        <DeleteOutlined />
                      </IconButton>
                        <IconButton aria-label="edit"
                                    onClick={() => {
                                      setState({selected: department.id as number})
                                    }}
                        >
                        <EditOutlined />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </form>
      </>
    );
  }

  if (departments.isError) {
    return <span>Si è verificato un errore</span>;
  }

  return <span>Caricamento in corso</span>;
};

export default DepartmentsContainer;
