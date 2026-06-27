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
    getConfiguredBooleanValue,
    getConfiguredNumberValue,
    getConfiguredStringValue,
    indexConfigurationGroups,
} from "../configuration/appConfigurationMetadata.ts";
import type {AppConfigurationValueByGroup} from "../configuration/appConfigurationMetadata.ts";

export type PrintSplitBy = "none" | "course" | "department";
export type PrintFormat = "A4" | "A5";

interface AppConfigurationContextValue {
    groups: AppConfigurationGroup[];
    valuesByGroup: AppConfigurationValueByGroup;
    isLoading: boolean;
    isRefreshing: boolean;
    canReadConfigurations: boolean;
    eventTitle: string;
    logoSvg?: string;
    order: {
        nameMandatory: boolean;
        takeAwayEnabled: boolean;
        serviceEnabled: boolean;
        serviceCost: number;
    };
    print: {
        customerCopy: boolean;
        splitBy: PrintSplitBy;
        format: PrintFormat;
    };
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
    order: {
        nameMandatory: true,
        takeAwayEnabled: true,
        serviceEnabled: true,
        serviceCost: 0.5,
    },
    print: {
        customerCopy: true,
        splitBy: "department",
        format: "A4",
    },
    reload: async () => [],
});

const emptyConfigurationGroups: AppConfigurationGroup[] = [];

const getConfiguredPrintSplitBy = (valuesByGroup: AppConfigurationValueByGroup): PrintSplitBy => {
    const value = getConfiguredStringValue("print", "split-by", valuesByGroup, "department");
    return value === "none" || value === "course" || value === "department" ? value : "department";
};

const getConfiguredPrintFormat = (valuesByGroup: AppConfigurationValueByGroup): PrintFormat => {
    const value = getConfiguredStringValue("print", "format", valuesByGroup, "A4");
    return value === "A4" || value === "A5" ? value : "A4";
};

const AppConfigurationStore: React.FC<React.PropsWithChildren> = ({children}) => {
    const queryClient = useQueryClient();
    const {status} = useAuth();
    const canReadConfigurations = status === "authenticated";
    const configurations = useGetAll({}, {
        enabled: canReadConfigurations,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    const groups = configurations.data ?? emptyConfigurationGroups;
    const valuesByGroup = React.useMemo(() => indexConfigurationGroups(groups), [groups]);
    const eventTitle = React.useMemo(() => (
        getConfiguredStringValue("general", "event-title", valuesByGroup, defaultEventTitle)
    ), [valuesByGroup]);
    const logoSvg = React.useMemo(() => (
        getConfiguredStringValue("general", "logo-svg", valuesByGroup)
    ), [valuesByGroup]);
    const orderConfiguration = React.useMemo(() => ({
        nameMandatory: getConfiguredBooleanValue("order", "name-mandatory", valuesByGroup, true),
        takeAwayEnabled: getConfiguredBooleanValue("order", "take-away-enabled", valuesByGroup, true),
        serviceEnabled: getConfiguredBooleanValue("order", "service-enabled", valuesByGroup, true),
        serviceCost: getConfiguredNumberValue("order", "service-cost", valuesByGroup, 0.5),
    }), [valuesByGroup]);
    const printConfiguration = React.useMemo(() => ({
        customerCopy: getConfiguredBooleanValue("print", "customer-copy", valuesByGroup, true),
        splitBy: getConfiguredPrintSplitBy(valuesByGroup),
        format: getConfiguredPrintFormat(valuesByGroup),
    }), [valuesByGroup]);

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
        order: orderConfiguration,
        print: printConfiguration,
        reload,
    }), [
        groups,
        valuesByGroup,
        canReadConfigurations,
        eventTitle,
        logoSvg,
        orderConfiguration,
        printConfiguration,
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

export const useOrderConfiguration = () => useAppConfiguration().order;

export const usePrintConfiguration = () => useAppConfiguration().print;
