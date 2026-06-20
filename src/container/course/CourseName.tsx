import * as React from "react";
import { useCourseName } from "./useCourseName.ts";

export interface ICourseName {
  courseId: number;
}

export const CourseName: React.FC<ICourseName> = (props) => {
  const courseData = useCourseName(props.courseId);

  if (courseData.isFetched) {
    return <>{courseData.data}</>;
  }

  if (courseData.isError) {
    return <></>;
  }

  return <>Loading</>;
};
