import * as React from "react";

export interface AppConf {
    apiUrl: string;
    showProductImages: boolean;
    showThemeSwitcher: boolean;
}

const AppConfContext = React.createContext<AppConf | undefined>(undefined);

let appConf: AppConf | undefined;

export const loadAppConf = async (): Promise<AppConf> => {
    const response = await fetch("/configuration.json", {cache: "no-store"});

    if (!response.ok) {
        throw new Error(`Cannot load application configuration: ${response.status}`);
    }

    return parseAppConf(await response.json());
};

export const initializeAppConf = (configuration: AppConf) => {
    appConf = configuration;
};

export const getAppConf = (): AppConf => {
    if (!appConf) {
        throw new Error("Application configuration has not been initialized");
    }

    return appConf;
};

export const AppConfProvider: React.FC<React.PropsWithChildren<{value: AppConf}>> = ({value, children}) => {
    initializeAppConf(value);

    return React.createElement(AppConfContext.Provider, {value}, children);
};

export const useAppConf = (): AppConf => {
    const configuration = React.useContext(AppConfContext);

    if (!configuration) {
        throw new Error("useAppConf must be used within AppConfProvider");
    }

    return configuration;
};

const parseAppConf = (value: unknown): AppConf => {
    if (!value || typeof value !== "object") {
        throw new Error("Application configuration must be an object");
    }

    const configuration = value as Record<string, unknown>;

    if (typeof configuration.apiUrl !== "string") {
        throw new Error("Application configuration apiUrl must be a string");
    }

    if (typeof configuration.showProductImages !== "boolean") {
        throw new Error("Application configuration showProductImages must be a boolean");
    }

    if (typeof configuration.showThemeSwitcher !== "boolean") {
        throw new Error("Application configuration showThemeSwitcher must be a boolean");
    }

    return {
        apiUrl: configuration.apiUrl,
        showProductImages: configuration.showProductImages,
        showThemeSwitcher: configuration.showThemeSwitcher,
    };
};
