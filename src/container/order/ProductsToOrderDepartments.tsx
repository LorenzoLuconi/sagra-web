import { departmentsSearchQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Department } from "../../api/sagra/sagraSchemas.ts";
import { Button, Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";

const ProductToOrderDepartments = () => {
  const departmentsSearchConf = departmentsSearchQuery({});

  const [selected, setSelected] = useState(-1);

  const departmentsData = useQuery({
    queryKey: departmentsSearchConf.queryKey,
    queryFn: departmentsSearchConf.queryFn,
  });


  if ( departmentsData.isFetched ) {
    const departments = departmentsData.data;



    if ( departments ) {
      if ( selected < 0 && departments.length > 0) {
        setSelected(departments[0].id);
      }

      return (
        <Paper>
          <Stack direction="row" spacing={2}>
        {
          departments.map( (d : Department) => {
            return (
              <Button key={d.id}>{d.name}</Button>
            )
          })
        }
          </Stack>
        </Paper>
      )

    } else {
      toast.error("Nessun Reparto trovato")
    }
  }

  if ( departmentsData.isError ) {
    toast("Errore prelevando i reparti");
    return <></>
  }
}

export default ProductToOrderDepartments