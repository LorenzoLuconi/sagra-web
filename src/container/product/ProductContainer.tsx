import { Box, Paper, Stack, Typography } from "@mui/material";
import { RestaurantOutlined } from "@mui/icons-material";
import { useState } from "react";
import ProductEdit from "./ProductEdit.tsx";
import { Course, Product } from "../../api/sagra/sagraSchemas.ts";
import ProductsList from "./ProductsList.tsx";
import CoursesSelector from "../course/CoursesSelector.tsx";

const ProductContainer = () => {
  const [selected, setSelected] = useState<Product | undefined>(undefined);
  const [course, setCourse] = useState<Course | undefined>(undefined);

  const selectProduct = (product: Product | undefined) => {
    setSelected(product);
  };

  const handleSelectCourse = (course?: Course) => {
    setCourse(course);
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
        <RestaurantOutlined />
        <Typography sx={{ fontWeight: 700, fontSize: "1.5em" }}>
          Prodotti
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ padding: 2 }}>
        <ProductEdit
          key={selected?.id}
          selected={selected}
          setSelected={selectProduct}
        />
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 1 }}>
        <CoursesSelector handleClick={handleSelectCourse} />
      </Paper>

      <ProductsList
        selected={selected}
        setSelected={selectProduct}
        courseId={course?.id}
      />
      <Box sx={{ mt: 1 }}></Box>
    </>
  );
};

export default ProductContainer;