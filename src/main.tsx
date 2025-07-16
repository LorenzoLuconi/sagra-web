import { initThemeMode } from "flowbite-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box } from "@mui/material";
import { grey } from "@mui/material/colors";

export const queryClient = new QueryClient()

const Main = () => {
    return (
        <QueryClientProvider client={queryClient}>
          <Box sx={{padding: 3, backgroundColor: grey[100]}}>
            <App />
          </Box>
        </QueryClientProvider>
    )
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
        <Main/>
  </StrictMode>,
);

initThemeMode();
