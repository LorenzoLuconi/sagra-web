import * as React from "react";
import {QueryClientProvider} from "@tanstack/react-query";
import App from "./App.tsx";
import {queryClient} from "./main.tsx";
import { ConfirmProvider } from "material-ui-confirm";
import AuthStore from "./context/AuthStore.tsx";

const MainComponent = (): React.ReactElement => {
    return (

        <QueryClientProvider client={queryClient}>
            <ConfirmProvider defaultOptions={{ confirmationText: 'Si', cancellationText: 'No'}}>
                <AuthStore>
                    <App />
                </AuthStore>
            </ConfirmProvider>
        </QueryClientProvider>

    )
}
export default MainComponent
