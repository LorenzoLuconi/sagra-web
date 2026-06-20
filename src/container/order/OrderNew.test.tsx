import {render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import type {Order} from "../../api/sagra/sagraSchemas.ts";
import OrderNew from "./OrderNew.tsx";

const useAppConfigurationMock = vi.fn();

vi.mock("../../context/AppConfigurationStore.tsx", () => ({
    useAppConfiguration: () => useAppConfigurationMock(),
}));

vi.mock("./OrderEditContainer.tsx", () => ({
    default: ({order}: {order: Order}) => (
        <output data-testid="service-cost">{order.serviceCost}</output>
    ),
}));

describe("OrderNew", () => {
    it("crea il nuovo ordine con il costo servizio ottenuto dalla configurazione", () => {
        useAppConfigurationMock.mockReturnValue({
            isLoading: false,
            order: {
                serviceCost: 1.75,
            },
        });

        render(<OrderNew/>);

        expect(screen.getByTestId("service-cost")).toHaveTextContent("1.75");
    });

    it("attende il caricamento della configurazione prima di creare l'ordine", () => {
        useAppConfigurationMock.mockReturnValue({
            isLoading: true,
            order: {
                serviceCost: 1.75,
            },
        });

        render(<OrderNew/>);

        expect(screen.queryByTestId("service-cost")).not.toBeInTheDocument();
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
});
