import * as React from 'react'
import {createRoot} from "react-dom/client";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import "./index.css";

import {QueryClient} from '@tanstack/react-query'
import MainComponent from "./MainComponent.tsx";
import ApplicationStore from "./context/ApplicationStore.tsx";
import {
    coursesSearchQuery,
    departmentsSearchQuery,
    discountsSearchQuery
} from "./api/sagra/sagraComponents.ts";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 2,
    },
  },
})

const defaultLongStale = 1000 * 60 * 60 * 4

queryClient.setQueryDefaults( departmentsSearchQuery({}).queryKey, { staleTime: defaultLongStale })
queryClient.setQueryDefaults( coursesSearchQuery({}).queryKey, { staleTime: defaultLongStale })
queryClient.setQueryDefaults( discountsSearchQuery({}).queryKey, { staleTime: defaultLongStale })


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApplicationStore initValues={{}}>
        <MainComponent/>
    </ApplicationStore>
  </React.StrictMode>,
);
