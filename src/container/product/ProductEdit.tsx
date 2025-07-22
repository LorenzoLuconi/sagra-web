import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../main.tsx";
import toast from "react-hot-toast";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { AddCircle, LinkOutlined, SaveOutlined } from "@mui/icons-material";
import { Product, ProductRequest } from "../../api/sagra/sagraSchemas.ts";
import {
  coursesSearchQuery,
  departmentsSearchQuery,
  fetchProductCreate,
  fetchProductUpdate,
  productsSearchQuery,
} from "../../api/sagra/sagraComponents.ts";

interface IProductEdit {
  selected?: Product;
  setSelected: (product: Product | undefined) => void;
}

interface ErrorMessages {
  name?: string;
  price?: string;
  department?: string;
  course?: string;
}

const ProductEdit = (props: IProductEdit) => {
  const [name, setName] = React.useState(props.selected?.name ?? "");
  const [price, setPrice] = React.useState<number>(props.selected?.price ?? 0);
  const [departmentId, setDepartmentId] = React.useState<number>(
    props.selected?.departmentId ?? 0,
  );
  const [courseId, setCourseId] = React.useState<number>(
    props.selected?.courseId ?? 0,
  );
  const [parentId, setParentId] = React.useState<number>(
    props.selected?.parentId ?? 0,
  );
  const [errorMessage, setErrorMessage] = React.useState<ErrorMessages>({});

  const resetState = () => {
    setName("");
    setPrice(0);
    setDepartmentId(0);
    setCourseId(0);
    setParentId(0);
    setErrorMessage({});
    props.setSelected(undefined);
  };

  const departmentsSearchConf = departmentsSearchQuery({});
  const departmentsQuery = useQuery({
    queryKey: departmentsSearchConf.queryKey,
    queryFn: departmentsSearchConf.queryFn,
  });

  const coursesSearchConf = coursesSearchQuery({});
  const coursesQuery = useQuery({
    queryKey: coursesSearchConf.queryKey,
    queryFn: coursesSearchConf.queryFn,
  });

  const productSearchConf = productsSearchQuery({});
  const productsQuery = useQuery({
    queryKey: productSearchConf.queryKey,
    queryFn: productSearchConf.queryFn,
  });

  const handleChangeName = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (event) => {
      setName(event.currentTarget.value);
    },
    [setName],
  );

  const handleChangePrice = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (event) => {
      if (event.currentTarget.value) {
        console.log(event.currentTarget.value);
        const value = Number.parseFloat(event.currentTarget.value);
        if (value) setPrice(value);
      } else {
        setPrice(0);
      }
    },
    [setPrice],
  );

  const handleChangeDepartment = (event: SelectChangeEvent) => {
    setDepartmentId(+event.target.value);
  };

  const handleChangeCourse = (event: SelectChangeEvent) => {
    setCourseId(+event.target.value);
  };

  const handleChangeProduct = (event: SelectChangeEvent) => {
    setParentId(+event.target.value);
  };

  const createProductRequest = () => {
    return {
      name,
      price,
      departmentId,
      courseId,
      parentId: parentId != 0 ? parentId : undefined,
    } as ProductRequest;
  };

  const productCreate = useMutation({
    mutationFn: (request: ProductRequest) => {
      return fetchProductCreate({ body: request });
    },
    onSuccess: (data) => {
      const discountSearchConf = productsSearchQuery({});
      resetState();
      queryClient
        .invalidateQueries({ queryKey: discountSearchConf.queryKey })
        .then(() => {
          toast.success(`Prodotto '${data.name}' creato con successo`);
          resetState();
        });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const productUpdate = useMutation({
    mutationFn: ({
      productId,
      request,
    }: {
      productId: number;
      request: ProductRequest;
    }) => {
      return fetchProductUpdate({
        body: request,
        pathParams: { productId },
      });
    },
    onSuccess: (data) => {
      const productSearchConf = productsSearchQuery({});
      resetState();
      queryClient
        .invalidateQueries({ queryKey: productSearchConf.queryKey })
        .then(() => {
          toast.success(`Prodotto '${data.name}' modificato con successo`);
          resetState();
        });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isValid = () => {
    let valid = true;

    const errorMessages: ErrorMessages = {};

    if (!name || name.trim().length < 1) {
      errorMessages.name = "Nome prodotto obbligatorio";
      valid = false;
    }

    if (!price) {
      // FIXME validazione più accurata
      errorMessages.price = "Prezzo obbligatorio";
      valid = false;
    }

    if (!departmentId || departmentId === 0) {
      errorMessages.department = "Seleziona un reparto";
      valid = false;
    }

    if (!courseId || courseId === 0) {
      errorMessages.course = "Seleziona una portata";
      valid = false;
    }

    // setErrorName("");
    // setErrorRate("");
    // if (rate === undefined || rate < 1 || rate > 100) {
    //   setErrorRate("Percentuale di sconto deve essere compresa tra 1 e 100");
    //   valid = false;
    // }
    //

    setErrorMessage(errorMessages);

    return valid;
  };

  const handleCreate = () => {
    if (isValid()) {
      productCreate.mutate(createProductRequest());
    }
  };

  const handleUpdate = () => {
    if (props.selected) {
      if (isValid())
        productUpdate.mutate({
          productId: props.selected.id,
          request: createProductRequest(),
        });
    }
  };

  if (
    departmentsQuery.isFetched &&
    coursesQuery.isFetched &&
    productsQuery.isFetched
  ) {
    const departments = departmentsQuery.data;
    const courses = coursesQuery.data;
    const products = productsQuery.data;

    if (departments && courses && products) {
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
            label="Nome Prodotto"
            onChange={handleChangeName}
            slotProps={{ htmlInput: { size: 64 } }}
            error={!!errorMessage.name}
            helperText={errorMessage.name}
          />
          <TextField
            size="small"
            required
            value={price}
            label="Prezzo"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">€</InputAdornment>
                ),
              },
              htmlInput: { size: 10 },
            }}
            onChange={handleChangePrice}
            error={!!errorMessage.price}
            helperText={errorMessage.price}
          />
          <Box sx={{ mb: 2, display: "block" }}>
            <FormControl sx={{ mr: 2 }}>
              <InputLabel id="courses-select-label-id" required>
                Portata
              </InputLabel>
              <Select
                id="course-select-id"
                labelId="courses-select-label-id"
                size="small"
                required
                value={courseId}
                label="Portata"
                sx={{ minWidth: "18em" }}
                onChange={handleChangeCourse}
                error={!!errorMessage.course}
              >
                <MenuItem value="0">
                  <em>Seleziona una portata</em>
                </MenuItem>
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
              {(() => {
                if (errorMessage.course)
                  return (
                    <FormHelperText error>{errorMessage.course}</FormHelperText>
                  );
              })()}
            </FormControl>
            <FormControl>
              <InputLabel id="departments-select-label-id" required>
                Reparto
              </InputLabel>
              <Select
                id="epartments-select-id"
                labelId="departments-select-label-id"
                size="small"
                required
                value={departmentId}
                label="Reparto"
                sx={{ minWidth: "18em" }}
                onChange={handleChangeDepartment}
                error={!!errorMessage.department}
              >
                <MenuItem value="0">
                  <em>Seleziona un reparto</em>
                </MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
              {(() => {
                if (errorMessage.department)
                  return (
                    <FormHelperText error>
                      {errorMessage.department}
                    </FormHelperText>
                  );
              })()}
            </FormControl>
          </Box>

          <Box sx={{ display: "block", mb: 2 }}>
            <LinkOutlined sx={{ mr: 1 }} />
            <FormControl>
              <InputLabel id="linked-select-label-id">
                Prodotto collegato
              </InputLabel>
              <Select
                disabled={!!props.selected}
                id="linked-select-id"
                labelId="linked-select-label-id"
                size="small"
                value={parentId}
                label="Prodotto collegato"
                sx={{ minWidth: "36em" }}
                onChange={handleChangeProduct}
              >
                <MenuItem value="0">
                  <em>Selezione un prodotto collegato</em>
                </MenuItem>
                {products
                  .filter((p) => !p.parentId)
                  .map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
              </Select>
              <FormHelperText>
                Se necessario, selezionare un prodotto collegato con cui
                condividere la quantità in giacenza
              </FormHelperText>
            </FormControl>
          </Box>

          {(() => {
            if (props.selected !== undefined)
              return (
                <>
                  <Button
                    sx={{ mr: 1 }}
                    variant="contained"
                    startIcon={<SaveOutlined />}
                    onClick={handleUpdate}
                  >
                    Modifica Prodotto
                  </Button>
                  <Button variant="contained" onClick={() => resetState()}>
                    Annulla Modifica
                  </Button>
                </>
              );
            else
              return (
                <Button
                  variant="contained"
                  startIcon={<AddCircle />}
                  onClick={handleCreate}
                >
                  Crea Prodotto
                </Button>
              );
          })()}
        </Box>
      );
    }
  }

  if (
    departmentsQuery.isError ||
    coursesQuery.isError ||
    productsQuery.isError
  ) {
    return (
      <Alert severity="error">
        Si è verificato un errore prelevando reparti, portate o prodotti
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CircularProgress />
    </Box>
  );
};

export default ProductEdit;