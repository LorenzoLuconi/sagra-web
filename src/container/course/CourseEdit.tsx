import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { CourseRequest } from "../../api/sagra/sagraSchemas.ts";
import {
  coursesSearchQuery,
  fetchCourseCreate,
} from "../../api/sagra/sagraComponents.ts";
import { queryClient } from "../../main.tsx";
import toast from "react-hot-toast";
import { Box, Button, TextField } from "@mui/material";
import { AddCircle } from "@mui/icons-material";

export const CourseEdit = () => {

  const [name, setName] = React.useState("");
  const [submitDisabled, setSubmitDisabled] = React.useState(true);

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {

    setName(event.currentTarget.value);

    if (event.currentTarget.value && event.currentTarget.value.trim().length > 0)
      setSubmitDisabled(false);
    else
      setSubmitDisabled(true);

  }, [setName, setSubmitDisabled]);

  const courseCreate = useMutation({
    mutationFn: (request: CourseRequest) => {
      return fetchCourseCreate({ body: request });
    },
    onSuccess: (data) => {
      const coursesSearchConf = coursesSearchQuery({});
      queryClient.invalidateQueries({ queryKey: coursesSearchConf.queryKey }).then(() => {
        toast.success(`Tipo portata ${data.name} creato con successo`);
        setName('')
        setSubmitDisabled(true)
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return (
    <form>
      <Box sx={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <TextField
          size="small"
          required
          value={name}
          id="outlined-required"
          label="Nome Portata"
          onChange={handleChange}
          slotProps={{ htmlInput: { size: 32 } }}
        />
        <Button variant="contained" startIcon={<AddCircle />} disabled={submitDisabled} onClick={() => {
          courseCreate.mutate({ name: name } as CourseRequest);
        }}>Crea Portata</Button>
      </Box>
    </form>
  );
};