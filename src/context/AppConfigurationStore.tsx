import * as React from "react";
import {useQueryClient} from "@tanstack/react-query";
import {
    fetchGetAll,
    getAllQuery,
    useGetAll,
} from "../api/sagra/sagraComponents.ts";
import type {AppConfigurationGroup} from "../api/sagra/sagraSchemas.ts";
import {useAuth} from "./AuthStore.tsx";
import {indexConfigurationGroups} from "../configuration/appConfigurationMetadata.ts";
import type {AppConfigurationValueByGroup} from "../configuration/appConfigurationMetadata.ts";

interface AppConfigurationContextValue {
    groups: AppConfigurationGroup[];
    valuesByGroup: AppConfigurationValueByGroup;
    isLoading: boolean;
    isRefreshing: boolean;
    canReadConfigurations: boolean;
    reload: () => Promise<AppConfigurationGroup[]>;
}

const AppConfigurationContext = React.createContext<AppConfigurationContextValue>({
    groups: [],
    valuesByGroup: {},
    isLoading: false,
    isRefreshing: false,
    canReadConfigurations: false,
    reload: async () => [],
});

const AppConfigurationStore: React.FC<React.PropsWithChildren> = ({children}) => {
    const queryClient = useQueryClient();
    const {status, user} = useAuth();
    const canReadConfigurations = status === "authenticated" && user?.role === "admin";
    const configurations = useGetAll({}, {
        enabled: canReadConfigurations,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    const groups = configurations.data ?? [];
    const valuesByGroup = React.useMemo(() => indexConfigurationGroups(groups), [groups]);

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
        reload,
    }), [
        groups,
        valuesByGroup,
        canReadConfigurations,
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
