import * as React from "react";
import {orderStatsQuery} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";
import {Alert, CircularProgress} from "@mui/material";
import StatsView from "./StatsView.tsx";
import {isEmpty} from "lodash";
import { AssessmentOutlined } from "@mui/icons-material";
import PageTitle from "../../view/PageTitle.tsx";

const StatsContainer = (): React.ReactElement => {
    const statsConf = orderStatsQuery({});
    const statsData = useQuery({
        queryKey: statsConf.queryKey,
        queryFn: statsConf.queryFn,
        refetchInterval: 1000 * 60 * 3
    });

    if (statsData.isError) {
        return (
            <StatsTitle>
                <Alert severity="error">Errore durante il prelevamento dei dati statistici</Alert>
            </StatsTitle>
        )
    }

    if (statsData.isFetched) {
        const stats = statsData.data
        if (stats !== undefined && !isEmpty(stats)) {
            return (
                <StatsTitle>
                    <StatsView stats={stats}/>
                </StatsTitle>
            )
        }

        return ( <StatsTitle> <Alert severity="warning">Nessun dato statistico al momento disponibile</Alert></StatsTitle>)
    }

    return <CircularProgress title={"Caricamento Statistiche"}/>;
};

const StatsTitle = (props: React.PropsWithChildren) => {
    return (
        <>
            <PageTitle title="Statistiche" icon={<AssessmentOutlined/>}/>
            {props.children}
        </>
    )
}
export default StatsContainer;