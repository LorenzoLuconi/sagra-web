import {Box, Typography} from "@mui/material";
import { Product } from "../../api/sagra/sagraSchemas.ts";
import { ErrorOutlined, LockOutlined, WarningOutlined } from "@mui/icons-material";

interface ProductQuantityProps {
  product: Product;
}
const ProductQuantity = (props: ProductQuantityProps) => {

  const {product} = props;

  const alertIcon = () => {

    if ( product.sellLocked ) {
      return <LockOutlined sx={(theme) => ({
        cursor: "pointer",
        color: theme.palette.error.light,
        ml: 1, verticalAlign: "middle"
      })}
      />;
    }

    if (product.availableQuantity < 1)
      return <ErrorOutlined sx={(theme) => ({
        cursor: "pointer",
        color: theme.palette.error.light,
        ml: 1, verticalAlign: "middle"
      })}
      />;

    if (product.availableQuantity < 10)
      return <WarningOutlined sx={(theme) => ({
        cursor: "pointer",
        color: theme.palette.warning.light,
        ml: 1, verticalAlign: "middle"
      })}
      />;


  };

  return (
      <Box sx={{display: 'flex', alignItems: 'center', gap: '5px'}}>
        <Typography >
          {product.availableQuantity}
        </Typography>
          <Typography>
            <>{alertIcon()}</>
          </Typography>
      </Box>
  );
};

export default ProductQuantity;