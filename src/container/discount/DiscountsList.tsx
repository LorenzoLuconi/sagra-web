// import React from 'react'

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  discountsSearchQuery,
  fetchDiscountDelete,
} from "../../api/sagra/sagraComponents.ts";
import {
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Discount } from "../../api/sagra/sagraSchemas.ts";
import { DeleteOutlined, EditOutlined } from "@mui/icons-material";
import { queryClient } from "../../main.tsx";
import toast from "react-hot-toast";
import { useConfirm } from "material-ui-confirm";

const DiscountsList = () => {
  const discountsSearchConf = discountsSearchQuery({});
  const discountsQuery = useQuery({
    queryKey: discountsSearchConf.queryKey,
    queryFn: discountsSearchConf.queryFn,
  });

  const discountDelete = useMutation({
    mutationFn: (discountId: number) => {
      return fetchDiscountDelete({
        pathParams: { id: discountId },
      });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: discountsSearchConf.queryKey })
        .then(() => {
          toast.success("Sconto cancellato");
        });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const confirm = useConfirm()

  const handleDelete = (discount: Discount) => {
    confirm({
      title: "Conferma cancellazione",
      description: `Vuoi procedere con la cancellazione dello sconto: ${discount.name}?`,
    }).then((confirm  ) => {
      if ( confirm.confirmed )
        discountDelete.mutate(discount.id)
    });
  }

  if (discountsQuery.isFetched) {
    const discounts = discountsQuery.data;

    if (discounts === undefined) {
      return <span>Errore inatteso nel prelevamento degli sconti</span>;
    }

    if (discounts.length < 1) {
      return <></>;
    }

    return (
      <form>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome Sconto</TableCell>
              <TableCell>Percentuale</TableCell>
              <TableCell>Azione</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {discounts?.map((discount: Discount) => {
              return (
                <TableRow key={discount.id}>
                  <TableCell sx={{ fontSize: "1.2em" }}>{discount.name}</TableCell>
                  <TableCell sx={{ fontSize: "1.2em" }}>{discount.rate}%</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="edit"
                      onClick={() => {
                        // setSelected(discount.id);
                        // setNameEdit(discount.name);
                      }}
                    >
                      <EditOutlined />
                    </IconButton>

                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDelete(discount)}
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

  if (discountsQuery.isError) {
    return <span>Si è verificato un errore</span>;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CircularProgress />
    </Box>
  );
};

export default DiscountsList;
