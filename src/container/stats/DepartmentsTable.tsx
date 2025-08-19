import * as React from "react";
import {SummaryI} from "./Summary.ts";
import {SxProps, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {departmentsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";
import {currency} from "../../utils";

const DepartmentsTable: React.FC<{ summary: SummaryI, sx?: SxProps }> = (props) => {
    const {summary} = props;


    const departmentsSearchConf = departmentsSearchQuery({});
    const departmentsQuery = useQuery({
        queryKey: departmentsSearchConf.queryKey,
        queryFn: departmentsSearchConf.queryFn,
    });

    if (departmentsQuery.isError) {
        return <></>
    }

    if (departmentsQuery.isPending) {
        return <></>
    }


    const departments = departmentsQuery.data;

    if (!departments) {
        return <></>
    }

    const departmentMap: Record<string, string> = {}
    departments.forEach(department => {
        departmentMap[department.id] = department.name;
    })

    return (
        <Table size="small" sx={{...props.sx}}>
            <TableHead>
                <TableRow>
                    <TableCell>Reparto</TableCell>
                    <TableCell align="center">Incasso del Reporto</TableCell>
                    <TableCell align="center">Percentuale Incasso</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {Object.entries(summary.departments).map((entry, idx) =>
                    <TableRow key={idx}  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{departmentMap[entry[0]] ?? entry[0]}</TableCell>
                        <TableCell align="center">{currency(entry[1])}</TableCell>
                        <TableCell align="center">{Math.round(entry[1] / summary.totalDepartments * 100)}%</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

export default DepartmentsTable;