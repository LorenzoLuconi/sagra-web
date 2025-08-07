import * as React from "react";
import { departmentByIdQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";

export interface IDepartmentName {
  departmentId: number;
}

export const DepartmentName: React.FC<IDepartmentName> = (props) => {
  const departmentQuery = departmentByIdQuery({
    pathParams: { departmentId: props.departmentId },
  });

  const departmentData = useQuery({
    queryKey: departmentQuery.queryKey,
    queryFn: departmentQuery.queryFn
  });

  if (departmentData.isFetched) {
    const product = departmentData.data;

    if (product) {
      return <>{product.name}</>;
    }
    return <></>;
  }

  if (departmentData.isError) {
    return <>Error</>;
  }

  return <>Loading</>;
};