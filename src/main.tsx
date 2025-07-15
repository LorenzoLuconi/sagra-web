import { initThemeMode } from "flowbite-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const queryClient = new QueryClient()

const Main = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    )
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
        <Main/>
  </StrictMode>,
);

initThemeMode();
