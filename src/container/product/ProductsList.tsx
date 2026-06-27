import { useMutation, useQuery } from "@tanstack/react-query";
import {
  coursesSearchQuery,
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
import { Course, Product } from "../../api/sagra/sagraSchemas.ts";
import {AddCircle, DeleteOutlined, EditOutlined, LinkOutlined, PrintOutlined, SettingsOutlined} from "@mui/icons-material";
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
import {useEventTitle} from "../../context/AppConfigurationStore.tsx";


const invalidateProducts = () => {
  void queryClient.invalidateQueries({ queryKey: ["v1", "products"] });
};

interface IProductList {
  selected: Product | undefined
  setSelected(product: Product | undefined) : void
  searchParam : ProductsSearchQueryParams
  onCreateProduct(): void
}


const ProductsList = (props : IProductList) => {
  const printContentRef = React.useRef<HTMLDivElement>(null);
  const [printMenuAnchor, setPrintMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [selectedPrintCourseId, setSelectedPrintCourseId] = React.useState<number | undefined>(undefined);

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

  const coursesSearchConf = coursesSearchQuery({});
  const coursesQuery = useQuery({
    queryKey: coursesSearchConf.queryKey,
    queryFn: coursesSearchConf.queryFn,
  });

  const reactToPrintFn = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: "Elenco prodotti",
  });

  const sortedCourses = (coursesQuery.data ?? [])
    .slice()
    .sort((a, b) => a.id - b.id);

  const printDisabled =
    printProductsQuery.isLoading ||
    printProductsQuery.isError ||
    coursesQuery.isLoading ||
    coursesQuery.isError;

  const handleOpenPrintMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPrintMenuAnchor(event.currentTarget);
  };

  const handleClosePrintMenu = () => {
    setPrintMenuAnchor(null);
  };

  const handlePrint = (courseId?: number) => {
    flushSync(() => {
      setSelectedPrintCourseId(courseId);
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
      toast.success("Prodotto rimosso");
      invalidateProducts();
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
        <Box sx={{display: "flex", justifyContent: "flex-end", gap: 1, mb: 1}}>
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={props.onCreateProduct}
          >
            Nuovo prodotto
          </Button>
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
            <MenuItem onClick={() => handlePrint()}>Tutte le portate</MenuItem>
            <Divider />
            {sortedCourses.map((course) => (
              <MenuItem key={course.id} onClick={() => handlePrint(course.id)}>
                {course.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
        <div ref={printContentRef} className="printContent products-print">
          <ProductsPrint
            products={printProductsQuery.data ?? []}
            courses={coursesQuery.data ?? []}
            courseId={selectedPrintCourseId}
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
  courses: Course[];
  courseId?: number;
}

const ProductsPrint = (props: ProductsPrintProps) => {
  const eventTitle = useEventTitle();

  const coursesById = props.courses.reduce<Record<number, Course>>((acc, course) => {
    acc[course.id] = course;
    return acc;
  }, {});

  const unlinkedProducts = props.products.filter((product) => !product.parentId);

  const productsToPrint = props.courseId === undefined
    ? unlinkedProducts
    : unlinkedProducts.filter((product) => product.courseId === props.courseId);

  const groups = productsToPrint.reduce<Record<number, Product[]>>((acc, product) => {
    acc[product.courseId] = [...(acc[product.courseId] ?? []), product];
    return acc;
  }, {});

  const courseIds = Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Box>
      <Typography className="products-print-title">{eventTitle}</Typography>
      {courseIds.map((courseId) => (
        <Box key={courseId} className="products-print-section">
          <Typography className="products-print-department">
            {coursesById[courseId]?.name ?? `Portata ${courseId}`}
          </Typography>
          <Table size="small" className="products-print-table">
            <TableBody>
              {groups[courseId]
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
