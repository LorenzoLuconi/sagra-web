import * as React from 'react'
import {createRoot} from "react-dom/client";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import "./index.css";

import {QueryClient} from '@tanstack/react-query'
import Main from "./Main.tsx";

export const queryClient = new QueryClient()


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
        <Main/>
  </React.StrictMode>,
);
