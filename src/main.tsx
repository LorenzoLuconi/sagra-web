import * as React from 'react'
import {createRoot} from "react-dom/client";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import "./index.css";

import {QueryClient} from '@tanstack/react-query'
import MainComponent from "./MainComponent.tsx";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      //staleTime: 1000 * 60 * 3,
    },
  },
})


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
        <MainComponent/>
  </React.StrictMode>,
);
