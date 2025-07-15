// import React from 'react'

import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { queryClient } from "../main.tsx";
import {departmentsSearchQuery} from "../api/sagra/sagraComponents.ts";


interface IDepartment {
  id: number
  name: string
}

const Department = () => {

  const departments = departmentsSearchQuery({queryParams: })


  const departmentsList = useQuery<IDepartment[]>({
    queryKey: departments.queryKey,
    queryFn: departments.queryFn
  });

  const departmentDelete = useMutation({
    mutationFn: async (id : number) => {
      const response = await fetch(`http://localhost:8080/v1/departments/${id}`, { method: "DELETE"})
      if ( ! response.ok ) {
        throw new Error("Errore")
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({queryKey: ["departments"]}).then(() =>
        console.log("Reparto Cancellato")
      )
    },
    onError: async (error) => {
      console.log("Reparto NON Cancellato per error: " + error.message)
    }
  })

  if ( departmentsList.isFetched ) {
    const departments:IDepartment[]|undefined = departmentsList.data

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Id</TableHeadCell>
            <TableHeadCell>Nome</TableHeadCell>
            <TableHeadCell>Action</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody  className="divide-y">
          {
            departments?.map(( d:IDepartment, idx)=> {
              return (
                <TableRow key={idx}>
                  <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">{d.id}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell><Button color="red" onClick={() => {
                      departmentDelete.mutate(d.id)
                  }}>Delete</Button></TableCell>
                </TableRow>
              )
            } )
          }
        </TableBody>
      </Table>
    );
  }

  if ( departmentsList.isError ) {
    return (
      <span>ERROR Department</span>
    );
  }

  return (
    <span>....loading Department</span>
  );


};

export default Department;

