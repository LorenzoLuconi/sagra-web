import { Box, Paper, Stack, Typography } from "@mui/material";
import { WarehouseOutlined } from "@mui/icons-material";
import { useState } from "react";
import { Course } from "../../api/sagra/sagraSchemas.ts";
import CoursesSelector from "../course/CoursesSelector.tsx";
import ProductsQuantityUpdateList from "./ProductsQuantityUpdateList.tsx";

const ProductQuantityUpdateContainer = () => {
  const [course, setCourse] = useState<Course | undefined>(undefined);

  const handleSelectCourse = (course?: Course) => {
    setCourse(course);
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
        <WarehouseOutlined />
        <Typography sx={{ fontWeight: 700, fontSize: "1.5em" }}>
          Giacenze Magazzino
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 1 }}>
        <CoursesSelector handleClick={handleSelectCourse} />
      </Paper>

      <ProductsQuantityUpdateList
        courseId={course?.id}
      />
      <Box sx={{ mt: 1 }}></Box>
    </>
  );
};

export default ProductQuantityUpdateContainer;