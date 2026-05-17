import * as React from "react";
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import {
    CachedOutlined,
    DeleteOutlineOutlined,
    FileUploadOutlined,
    RestartAltOutlined,
    SaveOutlined,
    TuneOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import PageTitle from "../../view/PageTitle.tsx";
import {appConfigurationMetadata} from "../../configuration/appConfigurationMetadata.ts";
import type {AppConfigurationFieldMetadata} from "../../configuration/appConfigurationMetadata.ts";
import type {
    AppConfigurationGroup,
    AppConfigurationValue,
} from "../../api/sagra/sagraSchemas.ts";
import {
    getAllQuery,
    useUpdateGroup,
} from "../../api/sagra/sagraComponents.ts";
import {useAppConfiguration} from "../../context/AppConfigurationStore.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {manageError} from "../../utils";

type ConfigurationDraft = Record<string, Record<string, string>>;

const groupLabels = appConfigurationMetadata.reduce<Record<string, string>>((labels, metadata) => {
    labels[metadata.group] = metadata.label;
    return labels;
}, {});

const toDraft = (groups: AppConfigurationGroup[]): ConfigurationDraft => {
    return groups.reduce<ConfigurationDraft>((draft, group) => {
        draft[group.group] = group.keys.reduce<Record<string, string>>((values, key) => {
            values[key.key] = key.value ?? "";
            return values;
        }, {});
        return draft;
    }, {});
};

const findValue = (
    group?: AppConfigurationGroup,
    field?: AppConfigurationFieldMetadata,
): AppConfigurationValue | undefined => {
    if (!group || !field) {
        return undefined;
    }
    return group.keys.find((value) => value.key === field.key);
};

const getDisplayValue = (
    draft: ConfigurationDraft,
    group: string,
    key: string,
): string => draft[group]?.[key] ?? "";

const svgToPreviewUrl = (value: string): string => {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}`;
};

const ConfigurationContainer = (): React.ReactElement => {
    const queryClient = useQueryClient();
    const configuration = useAppConfiguration();
    const updateGroup = useUpdateGroup();
    const [selectedGroupIndex, setSelectedGroupIndex] = React.useState(0);
    const [draft, setDraft] = React.useState<ConfigurationDraft>({});

    React.useEffect(() => {
        setDraft(toDraft(configuration.groups));
    }, [configuration.groups]);

    const selectedGroupMetadata = appConfigurationMetadata[selectedGroupIndex] ?? appConfigurationMetadata[0];
    const selectedGroup = configuration.groups.find((group) => group.group === selectedGroupMetadata.group);

    const updateDraftValue = (group: string, key: string, value: string) => {
        setDraft((previous) => ({
            ...previous,
            [group]: {
                ...previous[group],
                [key]: value,
            },
        }));
    };

    const resetDraftGroup = () => {
        if (!selectedGroup) {
            return;
        }
        setDraft((previous) => ({
            ...previous,
            [selectedGroup.group]: toDraft([selectedGroup])[selectedGroup.group],
        }));
    };

    const handleRefresh = async () => {
        try {
            await configuration.reload();
            toast.success("Configurazioni rilette", {duration: 2000});
        } catch (e) {
            manageError(e as Parameters<typeof manageError>[0]);
        }
    };

    const handleSaveGroup = async () => {
        if (!selectedGroup) {
            return;
        }

        try {
            const updatedGroup = await updateGroup.mutateAsync({
                pathParams: {group: selectedGroup.group},
                body: {
                    keys: selectedGroupMetadata.fields.map((field) => {
                        const value = getDisplayValue(draft, selectedGroup.group, field.key);
                        return {
                            key: field.key,
                            value: value.length > 0 ? value : undefined,
                        };
                    }),
                },
            });

            queryClient.setQueryData<AppConfigurationGroup[]>(
                getAllQuery({}).queryKey,
                (previous) => previous?.map((group) => (
                    group.group === updatedGroup.group ? updatedGroup : group
                )) ?? [updatedGroup],
            );
            await configuration.reload();
            toast.success(`Configurazioni ${groupLabels[updatedGroup.group] ?? updatedGroup.group} salvate`, {duration: 2500});
        } catch (e) {
            manageError(e as Parameters<typeof manageError>[0]);
        }
    };

    const renderField = (field: AppConfigurationFieldMetadata) => {
        const configurationValue = findValue(selectedGroup, field);
        const value = getDisplayValue(draft, selectedGroupMetadata.group, field.key);
        const disabled = updateGroup.isPending || configuration.isRefreshing;
        const allowedValues = configurationValue?.allowedValues ?? [];

        if (field.control === "boolean") {
            return (
                <FormControlLabel
                    key={field.key}
                    control={(
                        <Switch
                            checked={value.toLowerCase() === "true"}
                            disabled={disabled}
                            onChange={(_, checked) => updateDraftValue(
                                selectedGroupMetadata.group,
                                field.key,
                                checked ? "true" : "false",
                            )}
                        />
                    )}
                    label={field.label}
                />
            );
        }

        if (field.control === "radio") {
            return (
                <FormControl key={field.key} fullWidth>
                    <FormLabel>{field.label}</FormLabel>
                    <RadioGroup
                        row
                        value={value}
                        onChange={(event) => updateDraftValue(
                            selectedGroupMetadata.group,
                            field.key,
                            event.target.value,
                        )}
                    >
                        {allowedValues.map((allowedValue) => (
                            <FormControlLabel
                                key={allowedValue}
                                value={allowedValue}
                                control={<Radio disabled={disabled}/>}
                                label={field.allowedValueLabels?.[allowedValue] ?? allowedValue}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            );
        }

        if (field.control === "file") {
            const hasUploadedLogo = value.length > 0;

            return (
                <FormControl key={field.key} fullWidth>
                    <FormLabel>{field.label}</FormLabel>
                    <Stack spacing={1.5} sx={{mt: 1}}>
                        {hasUploadedLogo && (
                            <Box
                                sx={{
                                    alignItems: "center",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                    minHeight: 120,
                                    p: 2,
                                }}
                            >
                                <Box
                                    component="img"
                                    alt="Logo configurato"
                                    src={svgToPreviewUrl(value)}
                                    sx={{maxHeight: 96, maxWidth: "100%"}}
                                />
                            </Box>
                        )}
                        <Box sx={{display: "flex", gap: 1, flexWrap: "wrap"}}>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<FileUploadOutlined/>}
                                disabled={disabled}
                            >
                                Carica SVG
                                <input
                                    hidden
                                    type="file"
                                    accept="image/svg+xml,.svg"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        event.target.value = "";
                                        if (!file) {
                                            return;
                                        }
                                        if (file.type && file.type !== "image/svg+xml") {
                                            toast.error("Seleziona un file SVG");
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            const content = typeof reader.result === "string" ? reader.result : "";
                                            if (!content.includes("<svg")) {
                                                toast.error("Il file selezionato non sembra un SVG valido");
                                                return;
                                            }
                                            updateDraftValue(selectedGroupMetadata.group, field.key, content);
                                        };
                                        reader.readAsText(file);
                                    }}
                                />
                            </Button>
                            <Button
                                startIcon={<DeleteOutlineOutlined/>}
                                disabled={disabled || !hasUploadedLogo}
                                onClick={() => updateDraftValue(selectedGroupMetadata.group, field.key, "")}
                            >
                                Rimuovi
                            </Button>
                        </Box>
                        {field.helperText && <FormHelperText>{field.helperText}</FormHelperText>}
                    </Stack>
                </FormControl>
            );
        }

        return (
            <TextField
                key={field.key}
                fullWidth
                size="small"
                label={field.label}
                value={value}
                type={field.control === "number" ? "number" : field.control === "date" ? "date" : undefined}
                disabled={disabled}
                helperText={field.helperText}
                slotProps={{
                    inputLabel: field.control === "date" ? {shrink: true} : undefined,
                    htmlInput: field.control === "number" ? {step: "0.01"} : undefined,
                }}
                onChange={(event) => updateDraftValue(
                    selectedGroupMetadata.group,
                    field.key,
                    event.target.value,
                )}
            />
        );
    };

    return (
        <>
            <PageTitle title="Configurazioni" icon={<TuneOutlined/>}/>

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                }}
                className="paper-top"
            >
                <Box sx={{display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap"}}>
                    <Tabs
                        value={selectedGroupIndex}
                        onChange={(_, index: number) => setSelectedGroupIndex(index)}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {appConfigurationMetadata.map((metadata) => (
                            <Tab key={metadata.group} label={metadata.label}/>
                        ))}
                    </Tabs>
                    <Button
                        startIcon={<CachedOutlined/>}
                        onClick={() => void handleRefresh()}
                        disabled={configuration.isRefreshing || updateGroup.isPending}
                    >
                        Rileggi
                    </Button>
                </Box>
            </Paper>

            <Paper
                variant="outlined"
                sx={{
                    mt: 1,
                    p: 2,
                }}
                className="paper-bottom"
            >
                {configuration.isLoading ? (
                    <Box sx={{display: "flex", justifyContent: "center", p: 4}}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        <Box>
                            <Typography sx={{fontWeight: 700, fontSize: "1.1rem"}}>
                                {selectedGroupMetadata.label}
                            </Typography>
                        </Box>

                        <Stack spacing={2} sx={{maxWidth: "760px"}}>
                            {selectedGroupMetadata.fields.map(renderField)}
                        </Stack>

                        <Box sx={{display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap"}}>
                            <Button
                                startIcon={<RestartAltOutlined/>}
                                onClick={resetDraftGroup}
                                disabled={!selectedGroup || updateGroup.isPending || configuration.isRefreshing}
                            >
                                Ripristina
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveOutlined/>}
                                onClick={() => void handleSaveGroup()}
                                disabled={!selectedGroup || updateGroup.isPending || configuration.isRefreshing}
                            >
                                Salva
                            </Button>
                        </Box>
                    </Stack>
                )}
            </Paper>
        </>
    );
};

export default ConfigurationContainer;
