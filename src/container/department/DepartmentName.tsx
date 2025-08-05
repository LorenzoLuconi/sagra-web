import * as React from "react";
import { departmentByIdQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";
import {CircularProgress} from "@mui/material";
import ApiError from "../../view/ApiError.tsx";
import {ErrorWrapper} from "../../api/sagra/sagraFetcher.ts";

export interface IDepartmentName {
  departmentId: number;
}

export const DepartmentName: React.FC<IDepartmentName> = (props) => {
  const departmentQuery = departmentByIdQuery({
    pathParams: { departmentId: props.departmentId },
  });

  const departmentData = useQuery({
    queryKey: departmentQuery.queryKey,
    queryFn: departmentQuery.queryFn,
    staleTime: 1000 * 60 * 10,
  });

  if (departmentData.isFetched) {
    const product = departmentData.data;

    if (product) {
      return <>{product.name}</>;
    }
    return <></>;
  }

  if (departmentData.isError) {
    return <ApiError error={ departmentData.error as ErrorWrapper<Error>}/>
  }

  return <CircularProgress/>;
};