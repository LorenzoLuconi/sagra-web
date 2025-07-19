import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../main.tsx";
import toast from "react-hot-toast";
import { Box, Button, TextField } from "@mui/material";
import { AddCircle } from "@mui/icons-material";
import { DiscountRequest } from "../../api/sagra/sagraSchemas.ts";
import {
  discountsSearchQuery,
  fetchDiscountCreate,
} from "../../api/sagra/sagraComponents.ts";

export const DiscountEdit = () => {
  const [name, setName] = React.useState("");
  const [errorName, setErrorName] = React.useState("");
  const [rate, setRate] = React.useState(0);
  const [errorRate, setErrorRate] = React.useState("");

  const resetSate = () => {
    setName("");
    setErrorName("");
    setRate(0);
    setErrorRate("");
  };

  const handleChangeName = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (event) => {
      setName(event.currentTarget.value);
      // if (event.currentTarget.value && event.currentTarget.value.trim().length > 0)
      //   setSubmitDisabled(false);
      // else
      //   setSubmitDisabled(true);
    },
    [setName],
  );

  const handleChangePercent = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (event) => {
      if (event.currentTarget.value) {
        const value = Number.parseInt(event.currentTarget.value);
        if (value) setRate(value);
      } else {
        setRate(0);
      }
    },
    [setRate],
  );

  const discountCreate = useMutation({
    mutationFn: (request: DiscountRequest) => {
      return fetchDiscountCreate({ body: request });
    },
    onSuccess: (data) => {
      const discountSearchConf = discountsSearchQuery({});
      resetSate();
      queryClient
        .invalidateQueries({ queryKey: discountSearchConf.queryKey })
        .then(() => {
          toast.success(`Sconto ${data.name} creato con successo`);
          resetSate();
        });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isValid = () => {
    let valid = true;
    if (rate === undefined || rate < 1 || rate > 100) {
      setErrorRate("Percentuale di sconto deve essere compresa tra 1 e 100");
      valid = false;
    }

    if (!name || name.trim().length < 1) {
      setErrorName("Nome obbligatorio");
      valid = false;
    }

    return valid;
  };

  const handleCreate = () => {
    if (isValid()) discountCreate.mutate({ name, rate } as DiscountRequest);
  };

  return (
    <Box
      component="form"
      sx={{ "& .MuiTextField-root": { mb: 2, display: "block" } }}
    >
      <TextField
        size="small"
        required
        value={name}
        id="outlined-required"
        label="Nome Sconto"
        onChange={handleChangeName}
        slotProps={{ htmlInput: { size: 32 } }}
        error={!!errorName}
        helperText={errorName}
      />
      <TextField
        size="small"
        required
        value={rate}
        id="outlined-required"
        label="Percentuale"
        onChange={handleChangePercent}
        slotProps={{ htmlInput: { size: 10 } }}
        error={!!errorRate}
        helperText={errorRate}
      />
      <Button
        variant="contained"
        startIcon={<AddCircle />}
        onClick={handleCreate}
      >
        Crea Sconto
      </Button>
    </Box>
  );
};