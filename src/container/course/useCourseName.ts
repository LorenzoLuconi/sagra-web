import { useCourseById } from "../../api/sagra/sagraComponents.ts";

export const useCourseName = (courseId: number) => {
  return useCourseById(
    { pathParams: { id: courseId } },
    {
      select: (course) => course?.name ?? "",
    },
  );
};
