import { coursesSearchQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { Course } from "../../api/sagra/sagraSchemas.ts";
import { useState } from "react";

interface ICourseSelector {
  handleClick: (course?: Course) => void;
}

const CoursesSelector = (props : ICourseSelector) => {

  const [selected, setSelected] = useState<Course | undefined>(undefined);

  const coursesSearchConf = coursesSearchQuery({});
  const coursesQuery = useQuery({
    queryKey: coursesSearchConf.queryKey,
    queryFn: coursesSearchConf.queryFn,
  });

  if ( coursesQuery.isLoading ) {
    return (
      <Box sx={{alignItems: 'center', justifyItems: 'center', m: 2 }}>
        <CircularProgress />
      </Box>
    )
  }

  if ( coursesQuery.isError ) {
    return <Alert severity="error">Si è verificato un errore prelevando la lista delle portate</Alert>
  }

  return (
    <Box
      sx={{ display: "flex", gap: 1, rowGap: 1, flexWrap: 'wrap', alignContent: 'flex-start' }}
    >
      <Button key={-1} color={!selected ? 'secondary' : 'primary'}
              onClick={() => props.handleClick(undefined)}
              variant="contained" disableElevation >
        Tutte le portate
      </Button>
      {
        coursesQuery.data?.map((course) => {
          return (
            <Button key={course.id}
                    onClick={() => {
                      setSelected(course);
                      props.handleClick(course)
                    }}
                    color={selected?.id === course.id ? 'secondary' : 'primary'}
                    variant="contained" disableElevation >
              {course.name}
            </Button>
          )
        })
      }
    </Box>
  )
}

export default CoursesSelector;