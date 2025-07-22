import {departmentsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {Department} from "../../api/sagra/sagraSchemas.ts";
import {Button, Paper, Stack} from "@mui/material";
import {useState} from "react";
import ProductsInDepartment from "../product/ProductsInDepartment.tsx";

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
          <Stack direction="column" spacing={2}>
            <Paper>

              <Stack direction="row" spacing={2}>
                <>
                  {
                    departments.map( (d : Department) => {
                      return (
                          <Button
                              sx={{
                                borderBottom: (selected === d.id? '1px solid red': 'none'),

                                borderBottomLeftRadius: '0px',
                                borderBottomRightRadius: '0px'
                              }}
                              key={d.id} onClick={() => {setSelected(d.id)}}
                          >
                            {d.name}
                          </Button>
                      )
                    })
                  }



                </>

              </Stack>
            </Paper>
            <Paper sx={{padding: '10px'}}>
              <>
                {selected && <ProductsInDepartment departmentId={selected}/>}
              </>
            </Paper>
          </Stack>


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