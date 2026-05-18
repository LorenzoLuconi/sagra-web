import type {AppConfigurationValue} from "../api/sagra/sagraSchemas.ts";

type ConfigurationControl = "text" | "date" | "boolean" | "number" | "radio" | "file";

export interface AppConfigurationFieldMetadata {
    key: string;
    label: string;
    control: ConfigurationControl;
    helperText?: string;
    allowedValueLabels?: Record<string, string>;
}

export interface AppConfigurationGroupMetadata {
    group: string;
    label: string;
    fields: AppConfigurationFieldMetadata[];
}

export const appConfigurationMetadata: AppConfigurationGroupMetadata[] = [
    {
        group: "general",
        label: "Generale",
        fields: [
            {
                key: "event-title",
                label: "Titolo evento",
                control: "text",
            },
            {
                key: "date-start",
                label: "Data inizio sagra",
                control: "date",
            },
            {
                key: "date-end",
                label: "Data fine sagra",
                control: "date",
            },
            {
                key: "logo-svg",
                label: "Logo SVG",
                control: "file",
                helperText: "Carica un file SVG oppure rimuovi il logo salvato per usare quello predefinito.",
            },
        ],
    },
    {
        group: "order",
        label: "Ordini",
        fields: [
            {
                key: "name-mandatory",
                label: "Nome cliente obbligatorio",
                control: "boolean",
            },
            {
                key: "take-away-enabled",
                label: "Asporto abilitato",
                control: "boolean",
            },
            {
                key: "service-enabled",
                label: "Servizio al tavolo abilitato",
                control: "boolean",
            },
            {
                key: "service-cost",
                label: "Costo servizio",
                control: "number",
            },
        ],
    },
    {
        group: "print",
        label: "Stampa",
        fields: [
            {
                key: "split-by",
                label: "Suddivisione stampa",
                control: "radio",
                allowedValueLabels: {
                    none: "Nessuna",
                    course: "Portata",
                    department: "Reparto",
                },
            },
            {
                key: "format",
                label: "Formato",
                control: "radio",
            },
            {
                key: "customer-copy",
                label: "Copia cliente",
                control: "boolean",
            },
        ],
    },
];

export const appConfigurationGroupOrder = appConfigurationMetadata.map((metadata) => metadata.group);

export const defaultEventTitle = "Sagra";

export const getConfiguredValue = (
    group: string,
    key: string,
    configurations?: AppConfigurationValueByGroup,
) => configurations?.[group]?.[key];

export const getConfiguredStringValue = (
    group: string,
    key: string,
    configurations?: AppConfigurationValueByGroup,
    fallback = "",
): string => {
    const value = getConfiguredValue(group, key, configurations)?.value;
    return value && value.length > 0 ? value : fallback;
};

export const getConfiguredBooleanValue = (
    group: string,
    key: string,
    configurations?: AppConfigurationValueByGroup,
    fallback = false,
): boolean => {
    const value = getConfiguredValue(group, key, configurations)?.value;
    return value ? value.toLowerCase() === "true" : fallback;
};

export type AppConfigurationValueByGroup = Record<string, Record<string, AppConfigurationValue>>;

export const indexConfigurationGroups = (
    groups: {group: string; keys: AppConfigurationValue[]}[] = [],
): AppConfigurationValueByGroup => {
    return groups.reduce<AppConfigurationValueByGroup>((groupAcc, group) => {
        groupAcc[group.group] = group.keys.reduce<Record<string, AppConfigurationValue>>((keyAcc, value) => {
            keyAcc[value.key] = value;
            return keyAcc;
        }, {});
        return groupAcc;
    }, {});
};
