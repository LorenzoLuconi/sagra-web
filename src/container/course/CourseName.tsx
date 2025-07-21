import * as React from "react";
import { courseByIdQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";

export interface ICourseName {
  courseId: number;
}

export const CourseName: React.FC<ICourseName> = (props) => {
  const courseQuery = courseByIdQuery({
    pathParams: { id: props.courseId },
  });

  const courseData = useQuery({
    queryKey: courseQuery.queryKey,
    queryFn: courseQuery.queryFn,
    staleTime: 1000 * 60 * 10,
  });

  if (courseData.isFetched) {
    const product = courseData.data;

    if (product) {
      return <>{product.name}</>;
    }
    return <></>;
  }

  if (courseData.isError) {
    return <>Error</>;
  }

  return <>Loading</>;
};