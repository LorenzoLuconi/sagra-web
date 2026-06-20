import * as React from "react";
import { useDepartmentName } from "./useDepartmentName.ts";

export interface IDepartmentName {
  departmentId: number;
}

export const DepartmentName: React.FC<IDepartmentName> = (props) => {
  const departmentData = useDepartmentName(props.departmentId);

  if (departmentData.isFetched) {
    return <>{departmentData.data}</>;
  }

  if (departmentData.isError) {
    return <></>;
  }

  return <>Loading</>;
};
