// import React from 'react'

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  coursesSearchQuery,
  fetchCourseDelete, fetchCourseUpdate,
} from "../../api/sagra/sagraComponents.ts";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField, Typography
} from "@mui/material";
import {
  Course,
  CourseRequest
} from "../../api/sagra/sagraSchemas.ts";
import * as React from "react";
import {
  Check,
  Close,
  DeleteOutlined,
  EditOutlined,
} from "@mui/icons-material";
import { queryClient } from "../../main.tsx";
import { green, red } from "@mui/material/colors";
import toast from "react-hot-toast";

const CoursesList = () => {

  const [selected, setSelected] = React.useState(-1);
  const [nameEdit, setNameEdit] = React.useState("");

  const resetState = () => {
    setSelected(-1);
    setNameEdit("");
  };

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
      setNameEdit(event.currentTarget.value);
    },
    [setNameEdit],
  );

  const coursesSearchConf = coursesSearchQuery({});
  const coursesQuery = useQuery({
    queryKey: coursesSearchConf.queryKey,
    queryFn: coursesSearchConf.queryFn,
  });

  const coursesDelete = useMutation({
    mutationFn: (courseId: number) => {
      return fetchCourseDelete({
        pathParams: { id: courseId },
      });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: coursesSearchConf.queryKey })
        .then(() => {
          toast.success('Portata cancellata');
        });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const courseUpdate = useMutation({
    mutationFn: ({ courseId, courseRequest }: { courseId: number, courseRequest: CourseRequest }) => {
      return fetchCourseUpdate({
        body: courseRequest,
        pathParams: { id: courseId },
      });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: coursesSearchConf.queryKey })
        .then(() => {
          console.log("Nome portata modificata");
          toast.success('Nome portata modificato');
        });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (coursesQuery.isFetched) {

    const courses = coursesQuery.data;

    if (courses) {
      if (courses.length < 1) {
        return <Typography>Nessuna portata presente</Typography>
      }

      return (
        <form>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome Portata</TableCell>
                <TableCell>Azione</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {courses.map((course: Course) => {
                return (
                  <TableRow key={course.id} selected={selected == course.id}>
                    {(() => {
                      if (selected == course.id) {
                        return (
                          <TableCell>
                            <TextField
                              required
                              value={nameEdit}
                              size="small"
                              onChange={handleChange}
                              slotProps={{ htmlInput: { size: 32 } }}
                            />
                            <IconButton
                              aria-label="Salva modifica"
                              onClick={() => {
                                const request: CourseRequest = {
                                  name: nameEdit,
                                };
                                courseUpdate.mutate({
                                  courseId: course.id,
                                  courseRequest: request,
                                });
                                resetState();
                              }}
                            >
                              <Check sx={{ color: green[700] }} />
                            </IconButton>
                            <IconButton
                              aria-label="Annulla modifica"
                              onClick={() => {
                                resetState();
                              }}
                            >
                              <Close sx={{ color: red[700] }} />
                            </IconButton>
                          </TableCell>
                        );
                      } else {
                        return <TableCell sx={{ fontSize: '1.2em' }}>{course.name}</TableCell>;
                      }
                    })()}
                    <TableCell>
                      <IconButton
                        aria-label="edit"
                        onClick={() => {
                          setSelected(course.id);
                          setNameEdit(course.name);
                        }}
                      >
                        <EditOutlined />
                      </IconButton>

                      <IconButton
                        aria-label="delete"
                        onClick={() => {
                          resetState();
                          coursesDelete.mutate(course.id as number);
                        }}
                      >
                        <DeleteOutlined />
                      </IconButton>

                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </form>
      );
    }
  }

  if (coursesQuery.isError) {
    return <Alert severity="error">Si è verificato un errore prelevando la lista delle portate: {coursesQuery.error.message}</Alert>
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CircularProgress />
    </Box>
  );
};

export default CoursesList;
