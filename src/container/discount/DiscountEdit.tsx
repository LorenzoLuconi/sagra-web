import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../main.tsx";
import toast from "react-hot-toast";
import { Box, Button, TextField } from "@mui/material";
import { AddCircle, SaveOutlined } from "@mui/icons-material";
import { Discount, DiscountRequest } from "../../api/sagra/sagraSchemas.ts";
import {
  discountsSearchQuery,
  fetchDiscountCreate,
  fetchUpdateDiscount,
} from "../../api/sagra/sagraComponents.ts";
import {manageError} from "../../utils";
import {ErrorWrapper} from "../../api/sagra/sagraFetcher.ts";

interface IDiscountEdit {
  selected?: Discount;
  setSelected: (discount: Discount | undefined) => void;
}

export const DiscountEdit = (props: IDiscountEdit) => {
  const [name, setName] = React.useState(props.selected?.name?? "");
  const [errorName, setErrorName] = React.useState("");
  const [rate, setRate] = React.useState(props.selected?.rate?? 0 );
  const [errorRate, setErrorRate] = React.useState("");

  const resetState = () => {
    setName("");
    setErrorName("");
    setRate(0);
    setErrorRate("");
    props.setSelected(undefined);
  };

  const handleChangeName =
    React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
      setName(event.currentTarget.value);
    }, [setName],
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
      resetState();
      queryClient
        .invalidateQueries({ queryKey: discountSearchConf.queryKey })
        .then(() => {
          toast.success(`Sconto '${data.name}' creato con successo`);
          resetState();
        });
    },
    onError: (error: Error) => {
      manageError(error as ErrorWrapper<unknown>)
    },
  });

  const discountUpdate = useMutation({
    mutationFn: ({
      discountId,
      request,
    }: {
      discountId: number;
      request: DiscountRequest;
    }) => {
      return fetchUpdateDiscount({
        body: request,
        pathParams: { discountId: discountId },
      });
    },
    onSuccess: (data) => {
      const discountSearchConf = discountsSearchQuery({});
      resetState();
      queryClient
        .invalidateQueries({ queryKey: discountSearchConf.queryKey })
        .then(() => {
          toast.success(`Sconto '${data.name}' modificato con successo`);
          resetState();
        });
    },
    onError: (error: Error) => {
      manageError(error as ErrorWrapper<unknown>)
    },
  });

  const isValid = () => {
    let valid = true;
    setErrorName("");
    setErrorRate("");
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

  const handleUpdate = () => {
    if (props.selected) {
      if (isValid())
        discountUpdate.mutate({
          discountId: props.selected.id,
          request: { name, rate } as DiscountRequest,
        });
    }
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
        slotProps={{ htmlInput: { size: 48 } }}
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
      {(() => {
        if (props.selected !== undefined)
          return (
            <>
              <Button sx={{mr: 1}}
                variant="contained"
                startIcon={<SaveOutlined />}
                onClick={handleUpdate}
              >
                Modifica Sconto
              </Button>
              <Button
                variant="contained"
                onClick={() => resetState()}
              >
                Annulla Modifica
              </Button>
            </>
          );
        else
          return (
            <Button
              variant="contained"
              startIcon={<AddCircle /> }
              onClick={handleCreate}
            >
              Crea Sconto
            </Button>
          )
      })()}
    </Box>
  );
};