import * as React from "react";
import { productByIdQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";

export interface ProductNameI {
  productId: number;
}

export const ProductName: React.FC<ProductNameI> = (props) => {
  const productConf = productByIdQuery({
    pathParams: { productId: props.productId }
  });

  const productData = useQuery({
    queryKey: productConf.queryKey,
    queryFn: productConf.queryFn,
    staleTime: 1000 * 60 * 10
  });

  if (productData.isFetched) {
    const product = productData.data;

    if (product) {
      return <>{product.name}</>;
    }
    return <></>;
  }

  if (productData.isError) {
    return <>Error</>;
  }

  return <>Loading</>;
};