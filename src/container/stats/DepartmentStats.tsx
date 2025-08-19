import {SummaryI} from "./Summary.ts";
import {currency} from "../../utils";
import {PieChart, PieSeries} from "@mui/x-charts/PieChart";
import * as React from "react";
import {departmentsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";
import {Alert, Box, CircularProgress} from "@mui/material";
import {DefaultizedPieValueType, PieValueType} from "@mui/x-charts";

interface DepartmentStatsProps {
    summary: SummaryI
    width?: number
    height?: number
}

const DepartmentStats : React.FC<DepartmentStatsProps> = (props: DepartmentStatsProps) => {
    const { summary } = props;


    const departmentsSearchConf = departmentsSearchQuery({});
    const departmentsQuery = useQuery({
        queryKey: departmentsSearchConf.queryKey,
        queryFn: departmentsSearchConf.queryFn,
    });

    if (departmentsQuery.isError) {
        return <Alert severity="error">Error</Alert>
    }

    if (departmentsQuery.isPending) {
        return (
            <Box sx={{alignItems: 'center', justifyItems: 'center'}}>
                <CircularProgress/>
            </Box>
        );
    }


    const departments = departmentsQuery.data;

    if ( ! departments) {
        return <></>
    }

    const departmentMap : Record<string, string> = {}
    departments.forEach(department => {
        departmentMap[department.id] = department.name;
    })

    const getArcLabel = (params: DefaultizedPieValueType) => {
        const percent = params.value / summary.totalDepartments;
        return `${(percent * 100).toFixed(0)}%`;
    };


    const departmentsSeries = Object.entries(summary.departments)
        .map( (entry) => {
                return {
                    label: departmentMap[entry[0]] ?? entry[0],
                    value: entry[1],
                } as PieValueType
            }
        );

    return (
        <>
        <PieChart
            width={props.width}
            height={props.height}
            hideLegend
            sx={{ fontFamily: 'Roboto'}}
            series={[
                {
                    innerRadius: 30,
                    data: departmentsSeries,
                    arcLabel: getArcLabel,
                    valueFormatter: (v) => currency(v.value)
                } as PieSeries
            ]}
        />
        </>
    )

}

export default DepartmentStats