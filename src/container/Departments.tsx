// import React from 'react'

import { useMutation, useQuery } from "@tanstack/react-query";
import { departmentsSearchQuery } from "../api/sagra/sagraComponents.ts";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Department } from "../api/sagra/sagraSchemas.ts";
import * as React from "react";

const Departments = () => {
  const departmentsConf = departmentsSearchQuery({});

  const departments = useQuery({
    queryKey: departmentsConf.queryKey,
    queryFn: departmentsConf.queryFn,
  });

  // const departmentDelete = useMutation({
  //   mutationFn: async (id : number) => {
  //     const response = await fetch(`http://localhost:8080/v1/departments/${id}`, { method: "DELETE"})
  //     if ( ! response.ok ) {
  //       throw new Error("Errore")
  //     }
  //   },
  //   onSuccess: async () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["departments"]}).then(() =>
  //       console.log("Reparto Cancellato")
  //     )
  //   },
  //   onError: async (error) => {
  //     console.log("Reparto NON Cancellato per error: " + error.message)
  //   }
  // })

  const departmentsData = departments.data;
  console.log("Departments: ", departmentsData);


  if (departments.isFetched) {

    if (departmentsData === undefined) {
      return <span>Nessun reparto trovato</span>;
    }

    return (
      <>
        <span>Reparti</span>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {departmentsData?.map((department: Department, idx) => {
                return (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>
                      <Button>Delete</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </>
    );
  }

  if (departments.isError) {
    return <span>Si è verificato un errore</span>;
  }

  return <span>Caricamento in corso</span>;
};

export default Departments;
