import * as React from 'react'
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box } from "@mui/material";
import { grey } from "@mui/material/colors";

export const queryClient = new QueryClient()

const Main = (): React.ReactElement => {
    return (

        <QueryClientProvider client={queryClient}>
          <Box sx={{padding: 2, paddingRight: 4, paddingLeft: 4, backgroundColor: grey[100], minWidth: '500px'}}>
            <App />
          </Box>
        </QueryClientProvider>

    )
}


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
        <Main/>
  </React.StrictMode>,
);
