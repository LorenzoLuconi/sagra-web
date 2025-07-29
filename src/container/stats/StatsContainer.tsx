import * as React from "react";
import { orderStatsQuery } from "../../api/sagra/sagraComponents.ts";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";

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

    return <>Loadedø</>;
  }

  return <CircularProgress title={"Caricamento Statistiche"} />;
};
export default StatsContainer;