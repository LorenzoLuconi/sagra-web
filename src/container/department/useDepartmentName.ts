import { useDepartmentById } from "../../api/sagra/sagraComponents.ts";

export const useDepartmentName = (departmentId: number) => {
  return useDepartmentById(
    { pathParams: { departmentId } },
    {
      select: (department) => department?.name ?? "",
    },
  );
};
