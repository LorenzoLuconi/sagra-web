import { Box, IconButton } from "@mui/material";
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
    console.log("handleAddProduct", product);
    addProduct(product, 1);
  };

  return (
    <Box>
      <CoursesSelector handleClick={handleSelectCourse} />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton>
          <AppsOutlined onClick={() => setType(0)} />
        </IconButton>
        <IconButton>
          <FormatListNumberedOutlined onClick={() => setType(1)} />
        </IconButton>
      </Box>
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
    </Box>
  );
};

export default ProductsToOrder;
