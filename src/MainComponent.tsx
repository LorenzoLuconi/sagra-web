import * as React from "react";
import {QueryClientProvider} from "@tanstack/react-query";
import App from "./App.tsx";
import {queryClient} from "./main.tsx";
import { ConfirmProvider } from "material-ui-confirm";
import ApplicationStore from "./context/ApplicationStore.tsx";

const MainComponent = (): React.ReactElement => {

    return (

        <QueryClientProvider client={queryClient}>
        <ConfirmProvider defaultOptions={{ confirmationText: 'Si', cancellationText: 'No'}}>
            <ApplicationStore initValues={{}}>
                <App />
            </ApplicationStore>
        </ConfirmProvider>
        </QueryClientProvider>

    )
}
export default MainComponent