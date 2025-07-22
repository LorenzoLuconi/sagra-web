import { Typography } from "@mui/material";
import { Product } from "../../api/sagra/sagraSchemas.ts";
import { ErrorOutlined, WarningOutlined } from "@mui/icons-material";

const ProductQuantity = (props) => {

  if (!props.product) {
    return <Typography>0</Typography>;
  }

  const product = props.product as Product;

  const alertIcon = () => {
    if (product.availableQuantity < 10)
      return <WarningOutlined sx={(theme) => ({
        cursor: "pointer",
        color: theme.palette.warning.light,
        ml: 1, verticalAlign: "middle"
      })}
      />;

    if (product.availableQuantity < 1)
      return <ErrorOutlined sx={{ ml: 1, verticalAlign: "middle" }} />;
  };

  return (
    <Typography>
      {product.availableQuantity}
      {alertIcon()}
    </Typography>
  );
};

export default ProductQuantity;