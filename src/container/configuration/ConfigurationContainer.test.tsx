import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import ConfigurationContainer from "./ConfigurationContainer.tsx";

const useAppConfigurationMock = vi.fn();
const mutateAsyncMock = vi.fn();
const setQueryDataMock = vi.fn();

vi.mock("../../context/AppConfigurationStore.tsx", () => ({
    useAppConfiguration: () => useAppConfigurationMock(),
}));

vi.mock("../../api/sagra/sagraComponents.ts", () => ({
    getAllQuery: () => ({queryKey: ["v1", "configurations"]}),
    useUpdateGroup: () => ({
        mutateAsync: mutateAsyncMock,
        isPending: false,
    }),
}));

vi.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({
        setQueryData: setQueryDataMock,
    }),
}));

const configurationGroups = [
    {
        group: "general",
        keys: [
            {key: "event-title", value: "Sagra", type: "STRING", allowedValues: []},
            {key: "date-start", value: "2026-06-01", type: "DATE", allowedValues: []},
            {key: "date-end", value: "2026-06-10", type: "DATE", allowedValues: []},
            {key: "logo-svg", value: "", type: "STRING", allowedValues: []},
        ],
    },
    {
        group: "order",
        keys: [
            {key: "name-mandatory", value: "true", type: "BOOLEAN", allowedValues: []},
            {key: "take-away-enabled", value: "true", type: "BOOLEAN", allowedValues: []},
            {key: "service-enabled", value: "true", type: "BOOLEAN", allowedValues: []},
            {key: "service-cost", value: "1.0", type: "DECIMAL", allowedValues: []},
        ],
    },
    {
        group: "print",
        keys: [
            {key: "split-by", value: "none", type: "STRING", allowedValues: ["none", "course", "department"]},
            {key: "format", value: "A4", type: "STRING", allowedValues: ["A4", "A5"]},
            {key: "customer-copy", value: "true", type: "BOOLEAN", allowedValues: []},
        ],
    },
];

describe("ConfigurationContainer", () => {
    beforeEach(() => {
        useAppConfigurationMock.mockReset();
        mutateAsyncMock.mockReset();
        setQueryDataMock.mockReset();
        useAppConfigurationMock.mockReturnValue({
            groups: configurationGroups,
            isLoading: false,
            isRefreshing: false,
            canReadConfigurations: true,
            reload: vi.fn(),
        });
    });

    it("mostra gruppi e parametri previsti", () => {
        render(<ConfigurationContainer/>);

        expect(screen.getByText("Configurazioni")).toBeInTheDocument();
        expect(screen.getByRole("tab", {name: "Generale"})).toBeInTheDocument();
        expect(screen.getByRole("tab", {name: "Ordini"})).toBeInTheDocument();
        expect(screen.getByRole("tab", {name: "Stampa"})).toBeInTheDocument();
        expect(screen.getByLabelText("Titolo evento")).toHaveValue("Sagra");
        expect(screen.getByLabelText("Data inizio sagra")).toHaveValue("2026-06-01");
        expect(screen.getByRole("button", {name: "Carica SVG"})).toBeInTheDocument();
    });

    it("mostra le opzioni di stampa come radio button", async () => {
        const user = userEvent.setup();
        render(<ConfigurationContainer/>);

        await user.click(screen.getByRole("tab", {name: "Stampa"}));

        expect(screen.getByRole("radio", {name: "Nessuna"})).toBeChecked();
        expect(screen.getByRole("radio", {name: "Portata"})).toBeInTheDocument();
        expect(screen.getByRole("radio", {name: "Reparto"})).toBeInTheDocument();
        expect(screen.getByRole("radio", {name: "A4"})).toBeChecked();
        expect(screen.getByRole("radio", {name: "A5"})).toBeInTheDocument();
    });
});
