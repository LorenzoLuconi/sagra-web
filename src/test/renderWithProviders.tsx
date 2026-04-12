import * as React from "react";
import {render, RenderOptions} from "@testing-library/react";
import {ThemeProvider} from "@mui/material";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {MemoryRouter} from "react-router-dom";
import {ConfirmProvider} from "material-ui-confirm";
import {sagraTheme} from "../SagraTheme.ts";

interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
    route?: string;
}

export const renderWithProviders = (
    ui: React.ReactElement,
    {route = "/", ...options}: ExtendedRenderOptions = {},
) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    const Wrapper: React.FC<React.PropsWithChildren> = ({children}) => (
        <MemoryRouter initialEntries={[route]}>
            <QueryClientProvider client={queryClient}>
                <ConfirmProvider defaultOptions={{confirmationText: "Si", cancellationText: "No"}}>
                    <ThemeProvider theme={sagraTheme.light}>
                        {children}
                    </ThemeProvider>
                </ConfirmProvider>
            </QueryClientProvider>
        </MemoryRouter>
    );

    return render(ui, {wrapper: Wrapper, ...options});
};
