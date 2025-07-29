import * as React from "react";
import { orderStatsQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import StatsView from "./StatsView.tsx";

const StatsContainer = (): React.ReactElement => {
  const statsConf = orderStatsQuery({});
  const statsData = useQuery({
    queryKey: statsConf.queryKey,
    queryFn: statsConf.queryFn,
  });

  if (statsData.isError) {
    return <span>Error</span>;
  }

  if (statsData.isFetched) {
    console.log("Stats ", statsData.data);
    if (statsData.data !== undefined) {
      return <StatsView stats={statsData.data}/>;
    }
    return <span>No data</span>
  }

  return <CircularProgress title={"Caricamento Statistiche"} />;
};
export default StatsContainer;