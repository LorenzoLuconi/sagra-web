// import React from 'react'

import {useMutation, useQuery} from "@tanstack/react-query";
import {
    discountsSearchQuery,
    fetchDiscountDelete,
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
    Typography,
} from "@mui/material";
import {Discount} from "../../api/sagra/sagraSchemas.ts";
import {DeleteOutlined, EditOutlined, SettingsOutlined} from "@mui/icons-material";
import {queryClient} from "../../main.tsx";
import toast from "react-hot-toast";
import {useConfirm} from "material-ui-confirm";
import {manageError} from "../../utils";
import {ErrorWrapper} from "../../api/sagra/sagraFetcher.ts";


interface IDiscountsList {
    selected: Discount | undefined
    setSelected: (discount: Discount | undefined) => void;
}

const DiscountsList = (props: IDiscountsList) => {
    const discountsSearchConf = discountsSearchQuery({});
    const discountsQuery = useQuery({
        queryKey: discountsSearchConf.queryKey,
        queryFn: discountsSearchConf.queryFn,
    });

    const discountDelete = useMutation({
        mutationFn: (discountId: number) => {
            return fetchDiscountDelete({
                pathParams: {id: discountId},
            });
        },
        onSuccess: () => {
            queryClient
                .invalidateQueries({queryKey: discountsSearchConf.queryKey})
                .then(() => {
                    toast.success("Sconto cancellato");
                });
        },
        onError: (error: Error) => {
            manageError(error as ErrorWrapper<unknown>)
        },
    });

    const confirm = useConfirm()

    const handleDelete = (discount: Discount) => {
        props.setSelected(undefined)
        confirm({
            title: "Conferma cancellazione",
            description: `Vuoi procedere con la cancellazione dello sconto: ${discount.name}?`,
        }).then((confirm) => {
            if (confirm.confirmed)
                discountDelete.mutate(discount.id)
        });
    }

    if (discountsQuery.isError) {
        return <Alert severity="error">Si è verificato un errore prelevando la lista degli
            sconti: {discountsQuery.error.message}</Alert>
    }

    if (discountsQuery.isPending) {
        return (
            <Box sx={{display: "flex"}}>
                <CircularProgress/>
            </Box>
        );
    }

    const discounts = discountsQuery.data;

    if (!discounts || discounts.length < 1) {
        return <Typography>Nessuno sconto presente</Typography>
    }

    return (
        <form>
            <Table sx={{ backgroundColor: 'background.default' }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Nome Sconto</TableCell>
                        <TableCell>Percentuale</TableCell>
                        <TableCell sx={{ width: '100px'}} align="center"><SettingsOutlined /></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: 'background.default' }}>
                    <>
                        {discounts?.map((discount: Discount) => {
                            return (
                                <TableRow key={discount.id} selected={props.selected?.id === discount.id}>
                                    <TableCell sx={{fontSize: "1.2em"}}>{discount.name}</TableCell>
                                    <TableCell sx={{fontSize: "1.2em"}}>{discount.rate}%</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            aria-label="edit"
                                            onClick={() => props.setSelected(discount)}
                                        >
                                            <EditOutlined/>
                                        </IconButton>

                                        <IconButton
                                            aria-label="delete"
                                            onClick={() => handleDelete(discount)}
                                        >
                                            <DeleteOutlined/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </>
                </TableBody>
            </Table>
        </form>
    );
};

export default DiscountsList;
