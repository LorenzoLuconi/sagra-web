import { Box, IconButton, Paper } from "@mui/material";
import { Course, Product } from "../../api/sagra/sagraSchemas.ts";
import { useState } from "react";
import CoursesSelector from "../course/CoursesSelector.tsx";
import { AppsOutlined, FormatListNumberedOutlined } from "@mui/icons-material";
import ProductsOrderCard from "../product/ProductsOrderCard.tsx";
import { useOrderStore } from "../../context/OrderStore.tsx";
import ProductsOrderList from "../product/ProductsOrderList.tsx";

const ProductsToOrder = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(
    undefined,
  );

  const [type, setType] = useState(0);

  const handleSelectCourse = (course?: Course) => {
    setSelectedCourse(course);
  };

  const { addProduct } = useOrderStore();

  const handleAddProduct = (product: Product) => {
    addProduct(product, 1);
  };

  return (
    <Box>
      <Paper variant="outlined" sx={{p:2}}>
        <CoursesSelector handleClick={handleSelectCourse} />
      </Paper>
      <Paper variant="outlined" sx={{ display: "flex", justifyContent: "flex-end", mt: 1}} className="paper-top">
        <IconButton>
          <AppsOutlined onClick={() => setType(0)} />
        </IconButton>
        <IconButton>
          <FormatListNumberedOutlined onClick={() => setType(1)} />
        </IconButton>
      </Paper>
      <Paper variant="outlined" className="paper-bottom">
        {type == 0 ? (
          <ProductsOrderCard
            addToOrder={handleAddProduct}
            courseId={selectedCourse?.id}
          />
        ) : (
          <ProductsOrderList
            addToOrder={handleAddProduct}
            courseId={selectedCourse?.id}
          />
        )}
      </Paper>
    </Box>
  );
};

export default ProductsToOrder;
