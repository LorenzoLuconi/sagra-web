import { coursesSearchQuery, departmentsSearchQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Course, Department } from "../../api/sagra/sagraSchemas.ts";
import { Button, Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";

const ProductToOrderCourses = () => {
  const coursesSearchConf = coursesSearchQuery({});

  const [selected, setSelected] = useState(-1);

  const coursesData = useQuery({
    queryKey: coursesSearchConf.queryKey,
    queryFn: coursesSearchConf.queryFn,
  });


  if ( coursesData.isFetched ) {
    const courses = coursesData.data;



    if ( courses ) {
      if ( selected < 0 && courses.length > 0) {
        setSelected(courses[0].id);
      }

      return (
        <Paper>
          <Stack direction="row" spacing={2}>
        {
          courses.map( (c : Course) => {
            return (
              <Button key={c.id}>{c.name}</Button>
            )
          })
        }
          </Stack>
        </Paper>
      )

    } else {
      toast.error("Nesusn tipo di portata trovato")
    }
  }

  if ( coursesData.isError ) {
    toast("Errore prelevando portate");
    return <></>
  }
}

export default ProductToOrderCourses