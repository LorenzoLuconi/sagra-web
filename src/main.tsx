/**
 * Copyright (C) 2026 Lorenzo Luconi Trombacchi
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
import {AppConfProvider, loadAppConf} from "./AppConf.ts";

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

const bootstrap = async () => {
  const appConf = await loadAppConf();

  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <AppConfProvider value={appConf}>
          <ApplicationStore initValues={{}}>
              <MainComponent/>
          </ApplicationStore>
      </AppConfProvider>
    </React.StrictMode>,
  );
};

void bootstrap();
