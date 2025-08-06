import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { DepartmentRequest } from "../../api/sagra/sagraSchemas.ts";
import { departmentsSearchQuery, fetchDepartmentCreate } from "../../api/sagra/sagraComponents.ts";
import { queryClient } from "../../main.tsx";
import toast from "react-hot-toast";
import { Box, Button, TextField } from "@mui/material";
import { AddCircle } from "@mui/icons-material";
import {manageError} from "../../utils";
import {ErrorWrapper} from "../../api/sagra/sagraFetcher.ts";

export const DepartmentEdit = () => {

  const [name, setName] = React.useState("");
  const [submitDisabled, setSubmitDisabled] = React.useState(true);

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {

    setName(event.currentTarget.value);

    if (event.currentTarget.value && event.currentTarget.value.trim().length > 0)
      setSubmitDisabled(false);
    else
      setSubmitDisabled(true);

  }, [setName, setSubmitDisabled]);

  const departmentCreate = useMutation({
    mutationFn: (request: DepartmentRequest) => {
      return fetchDepartmentCreate({ body: request });
    },
    onSuccess: (data) => {
      const departmentsSearchConf = departmentsSearchQuery({});
      queryClient.invalidateQueries({ queryKey: departmentsSearchConf.queryKey }).then(() => {
        toast.success(`Reparto ${data.name} creato con successo`);
        setName('')
        setSubmitDisabled(true)
      });
    },
    onError: (error: Error) => {
      manageError(error as ErrorWrapper<unknown>)
    }
  });

  return (
      <Box sx={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <TextField
          size="small"
          required
          value={name}
          id="outlined-required"
          label="Nome Reparto"
          onChange={handleChange}
          slotProps={{ htmlInput: { size: 32 } }}
        />
        <Button variant="contained" startIcon={<AddCircle />} disabled={submitDisabled} onClick={() => {
          departmentCreate.mutate({ name: name } as DepartmentRequest);
        }}>Crea Reparto</Button>
      </Box>
  );
};