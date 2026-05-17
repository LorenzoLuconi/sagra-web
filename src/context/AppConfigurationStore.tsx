import * as React from "react";
import {useQueryClient} from "@tanstack/react-query";
import {
    fetchGetAll,
    getAllQuery,
    useGetAll,
} from "../api/sagra/sagraComponents.ts";
import type {AppConfigurationGroup} from "../api/sagra/sagraSchemas.ts";
import {useAuth} from "./AuthStore.tsx";
import {
    defaultEventTitle,
    getConfiguredStringValue,
    indexConfigurationGroups,
} from "../configuration/appConfigurationMetadata.ts";
import type {AppConfigurationValueByGroup} from "../configuration/appConfigurationMetadata.ts";

interface AppConfigurationContextValue {
    groups: AppConfigurationGroup[];
    valuesByGroup: AppConfigurationValueByGroup;
    isLoading: boolean;
    isRefreshing: boolean;
    canReadConfigurations: boolean;
    eventTitle: string;
    logoSvg?: string;
    reload: () => Promise<AppConfigurationGroup[]>;
}

const AppConfigurationContext = React.createContext<AppConfigurationContextValue>({
    groups: [],
    valuesByGroup: {},
    isLoading: false,
    isRefreshing: false,
    canReadConfigurations: false,
    eventTitle: defaultEventTitle,
    logoSvg: undefined,
    reload: async () => [],
});

const AppConfigurationStore: React.FC<React.PropsWithChildren> = ({children}) => {
    const queryClient = useQueryClient();
    const {status} = useAuth();
    const canReadConfigurations = status === "authenticated";
    const configurations = useGetAll({}, {
        enabled: canReadConfigurations,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    const groups = configurations.data ?? [];
    const valuesByGroup = React.useMemo(() => indexConfigurationGroups(groups), [groups]);
    const eventTitle = React.useMemo(() => (
        getConfiguredStringValue("general", "event-title", valuesByGroup, defaultEventTitle)
    ), [valuesByGroup]);
    const logoSvg = React.useMemo(() => (
        getConfiguredStringValue("general", "logo-svg", valuesByGroup)
    ), [valuesByGroup]);

    React.useEffect(() => {
        document.title = eventTitle;
    }, [eventTitle]);

    React.useEffect(() => {
        if (!logoSvg) {
            return;
        }

        const iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (iconLink) {
            iconLink.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;
        }
    }, [logoSvg]);

    const reload = React.useCallback(async () => {
        const freshConfigurations = await fetchGetAll({});
        queryClient.setQueryData(getAllQuery({}).queryKey, freshConfigurations);
        return freshConfigurations;
    }, [queryClient]);

    const value = React.useMemo<AppConfigurationContextValue>(() => ({
        groups,
        valuesByGroup,
        isLoading: canReadConfigurations && configurations.isPending,
        isRefreshing: configurations.isFetching,
        canReadConfigurations,
        eventTitle,
        logoSvg: logoSvg.length > 0 ? logoSvg : undefined,
        reload,
    }), [
        groups,
        valuesByGroup,
        canReadConfigurations,
        eventTitle,
        logoSvg,
        configurations.isPending,
        configurations.isFetching,
        reload,
    ]);

    return (
        <AppConfigurationContext.Provider value={value}>
            {children}
        </AppConfigurationContext.Provider>
    );
};

export default AppConfigurationStore;

export const useAppConfiguration = () => React.useContext(AppConfigurationContext);

export const useEventTitle = () => useAppConfiguration().eventTitle;
