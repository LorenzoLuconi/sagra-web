import { useMutation, useQuery } from "@tanstack/react-query";
import {
  departmentsSearchQuery,
  fetchProductDelete,
  productsSearchQuery,
  ProductsSearchQueryParams
} from "../../api/sagra/sagraComponents.ts";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { Department, Product } from "../../api/sagra/sagraSchemas.ts";
import {DeleteOutlined, EditOutlined, LinkOutlined, PrintOutlined, SettingsOutlined} from "@mui/icons-material";
import { queryClient } from "../../main.tsx";
import toast from "react-hot-toast";
import { useConfirm } from "material-ui-confirm";
import {currency, manageError} from "../../utils";
import { ProductName } from "./ProductName.tsx";
import { DepartmentName } from "../department/DepartmentName.tsx";
import { CourseName } from "../course/CourseName.tsx";
import {ErrorWrapper} from "../../api/sagra/sagraFetcher.ts";
import * as React from "react";
import {useReactToPrint} from "react-to-print";
import "./ProductsPrint.css";
import {flushSync} from "react-dom";


interface IProductList {
  selected: Product | undefined
  setSelected(product: Product | undefined) : void
  searchParam : ProductsSearchQueryParams
}


const ProductsList = (props : IProductList) => {
  const printContentRef = React.useRef<HTMLDivElement>(null);
  const [printMenuAnchor, setPrintMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [selectedPrintDepartmentId, setSelectedPrintDepartmentId] = React.useState<number | undefined>(undefined);

  const productsSearchConf = productsSearchQuery({
    queryParams: props.searchParam
  });

  const productsQuery = useQuery({
    queryKey: productsSearchConf.queryKey,
    queryFn: productsSearchConf.queryFn,
  });

  const printProductsSearchConf = productsSearchQuery({});
  const printProductsQuery = useQuery({
    queryKey: printProductsSearchConf.queryKey,
    queryFn: printProductsSearchConf.queryFn,
  });

  const departmentsSearchConf = departmentsSearchQuery({});
  const departmentsQuery = useQuery({
    queryKey: departmentsSearchConf.queryKey,
    queryFn: departmentsSearchConf.queryFn,
  });

  const reactToPrintFn = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: "Elenco prodotti",
  });

  const sortedDepartments = (departmentsQuery.data ?? [])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "it"));

  const printDisabled =
    printProductsQuery.isLoading ||
    printProductsQuery.isError ||
    departmentsQuery.isLoading ||
    departmentsQuery.isError;

  const handleOpenPrintMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPrintMenuAnchor(event.currentTarget);
  };

  const handleClosePrintMenu = () => {
    setPrintMenuAnchor(null);
  };

  const handlePrint = (departmentId?: number) => {
    flushSync(() => {
      setSelectedPrintDepartmentId(departmentId);
      setPrintMenuAnchor(null);
    });
    reactToPrintFn();
  };

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
      manageError(error as ErrorWrapper<unknown>)
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
      <>
        <Box sx={{display: "flex", justifyContent: "flex-end", mb: 1}}>
          <Button
            variant="outlined"
            startIcon={<PrintOutlined />}
            onClick={handleOpenPrintMenu}
            disabled={printDisabled}
          >
            Stampa
          </Button>
          <Menu
            anchorEl={printMenuAnchor}
            open={Boolean(printMenuAnchor)}
            onClose={handleClosePrintMenu}
          >
            <MenuItem onClick={() => handlePrint()}>Tutti i reparti</MenuItem>
            <Divider />
            {sortedDepartments.map((department) => (
              <MenuItem key={department.id} onClick={() => handlePrint(department.id)}>
                {department.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
        <div ref={printContentRef} className="printContent products-print">
          <ProductsPrint
            products={printProductsQuery.data ?? []}
            departments={departmentsQuery.data ?? []}
            departmentId={selectedPrintDepartmentId}
          />
        </div>
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
      </>
    );
  }
}

interface ProductsPrintProps {
  products: Product[];
  departments: Department[];
  departmentId?: number;
}

const ProductsPrint = (props: ProductsPrintProps) => {
  const departmentsById = props.departments.reduce<Record<number, Department>>((acc, department) => {
    acc[department.id] = department;
    return acc;
  }, {});

  const unlinkedProducts = props.products.filter((product) => !product.parentId);

  const productsToPrint = props.departmentId === undefined
    ? unlinkedProducts
    : unlinkedProducts.filter((product) => product.departmentId === props.departmentId);

  const groups = productsToPrint.reduce<Record<number, Product[]>>((acc, product) => {
    acc[product.departmentId] = [...(acc[product.departmentId] ?? []), product];
    return acc;
  }, {});

  const departmentIds = Object.keys(groups)
    .map(Number)
    .sort((a, b) => {
      const departmentA = departmentsById[a]?.name ?? `Reparto ${a}`;
      const departmentB = departmentsById[b]?.name ?? `Reparto ${b}`;
      return departmentA.localeCompare(departmentB, "it");
    });

  return (
    <Box>
      <Typography className="products-print-title">Elenco prodotti</Typography>
      {departmentIds.map((departmentId) => (
        <Box key={departmentId} className="products-print-section">
          <Typography className="products-print-department">
            {departmentsById[departmentId]?.name ?? `Reparto ${departmentId}`}
          </Typography>
          <Table size="small" className="products-print-table">
            <TableBody>
              {groups[departmentId]
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, "it"))
                .map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Typography component="div">{product.name}</Typography>
                      {product.note?.trim() && (
                        <Typography component="div" className="products-print-note">
                          {product.note}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{currency(product.price)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      ))}
    </Box>
  );
};



export default ProductsList;
