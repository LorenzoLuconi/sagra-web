import * as React from "react";
import {QueryClientProvider} from "@tanstack/react-query";
import App from "./App.tsx";
import {queryClient} from "./main.tsx";

const MainComponent = (): React.ReactElement => {
    return (

        <QueryClientProvider client={queryClient}>

                <App />

        </QueryClientProvider>

    )
}
export default MainComponent