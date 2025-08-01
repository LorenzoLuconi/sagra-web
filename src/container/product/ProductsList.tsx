import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchProductDelete, productsSearchQuery, ProductsSearchQueryParams } from "../../api/sagra/sagraComponents.ts";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { Product } from "../../api/sagra/sagraSchemas.ts";
import {DeleteOutlined, EditOutlined, LinkOutlined, SettingsOutlined} from "@mui/icons-material";
import { queryClient } from "../../main.tsx";
import toast from "react-hot-toast";
import { useConfirm } from "material-ui-confirm";
import { currency } from "../../utils";
import { ProductName } from "./ProductName.tsx";
import { DepartmentName } from "../department/DepartmentName.tsx";
import { CourseName } from "../course/CourseName.tsx";


interface IProductList {
  selected: Product | undefined
  setSelected(product: Product | undefined) : void
  courseId?: number
}


const ProductsList = (props : IProductList) => {

  const searchParam = () => {
    const params = {} as ProductsSearchQueryParams;
    if (props.courseId !== undefined) {
      params.courseId = props.courseId;
    }

    return params;
  }

  const productsSearchConf = productsSearchQuery({
    queryParams: searchParam()
  });

  const productsQuery = useQuery({
    queryKey: productsSearchConf.queryKey,
    queryFn: productsSearchConf.queryFn,
  });

  const productDelete = useMutation({
    mutationFn: (productId: number) => {
      return fetchProductDelete({
        pathParams: { productId },
      });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: productsSearchConf.queryKey })
        .then(() => {
          toast.success("Prodotto rimosso");
        });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const confirm = useConfirm()

  const handleDelete = (product: Product) => {
    props.setSelected(undefined)
    confirm({
      title: `Cancellazione prodotto '${product.name}'`,
      description: product.parentId ?
        "Vuoi procedere alla cancellazione del prodotto?"
        : "Vuoi procedere alla cancellazione del prodotto e di tutti gli eventuali prodotti a questo collegati?",
    }).then((confirm) => {
      if (confirm.confirmed)
        productDelete.mutate(product.id)
    });
  }

  if (productsQuery.isLoading) {
    return (<Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (productsQuery.isError) {
    return <Alert severity="error">Si è verificato un errore prelevando la lista degli
      sconti: {productsQuery.error.message}</Alert>
  }

  const products = productsQuery.data;

  if (products) {
    if (products.length < 1) {
      return <Typography>Nessuno prodotto presente</Typography>
    }

    return (
      <form>
        <Table>
          <TableHead sx={{ backgroundColor: 'background.default' }}>
            <TableRow>
              <TableCell>Nome Prodotto</TableCell>
              <TableCell>Portata</TableCell>
              <TableCell>Reparto</TableCell>
              <TableCell align='right'>Prezzo</TableCell>
              <TableCell>Prodotto Collegato</TableCell>
              <TableCell align='center' sx={{ width: '90px'}}><SettingsOutlined /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ backgroundColor: 'background.default' }}>
            {products.map((product: Product) => {
              return (
                <TableRow key={product.id} selected={props.selected?.id === product.id}>
                  <TableCell sx={{ fontSize: "1.0em" }}>{product.name}</TableCell>
                  <TableCell sx={{ fontSize: "1.0em" }}><CourseName courseId={product.courseId} /></TableCell>
                  <TableCell sx={{ fontSize: "1.0em" }}><DepartmentName
                    departmentId={product.departmentId} /></TableCell>
                  <TableCell align='right' sx={{ fontSize: "1.0em" }}>{currency(product.price)}</TableCell>
                  <TableCell sx={{ fontSize: "0.9em" }}>{product.parentId ? <><LinkOutlined
                    sx={{ mr: 0.8, verticalAlign: 'middle' }} /><ProductName
                    productId={product.parentId} /></> : ''}</TableCell>
                  <TableCell align='center'>
                    <IconButton
                      aria-label="edit"
                      onClick={() => props.setSelected(product)}
                    >
                      <EditOutlined />
                    </IconButton>

                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDelete(product)}
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
}



export default ProductsList;
