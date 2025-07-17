import * as React from "react";
import {QueryClientProvider} from "@tanstack/react-query";
import {Box} from "@mui/material";
import {grey} from "@mui/material/colors";
import App from "./App.tsx";
import {queryClient} from "./main.tsx";

const MainComponent = (): React.ReactElement => {
    return (

        <QueryClientProvider client={queryClient}>
            <Box sx={{padding: 2, paddingRight: 4, paddingLeft: 4, backgroundColor: grey[100], minWidth: '500px'}}>
                <App />
            </Box>
        </QueryClientProvider>

    )
}
export default MainComponent