import {render, screen} from "@testing-library/react";
import {ThemeProvider} from "@mui/material";
import {describe, expect, it, vi} from "vitest";
import type {Order, Product} from "../../api/sagra/sagraSchemas.ts";
import {sagraTheme} from "../../SagraTheme.ts";
import OrderPrint from "./OrderPrint.tsx";

const usePrintConfigurationMock = vi.fn();

vi.mock("../../context/AppConfigurationStore.tsx", () => ({
    useAppConfiguration: () => ({logoSvg: undefined}),
    useEventTitle: () => "Sagra",
    usePrintConfiguration: () => usePrintConfigurationMock(),
}));

vi.mock("../department/DepartmentName.tsx", () => ({
    DepartmentName: () => <>Cucina</>,
}));

const product: Product = {
    id: 1,
    name: "Panino",
    departmentId: 1,
    courseId: 1,
    price: 5,
    sellLocked: false,
    initialQuantity: 100,
    availableQuantity: 100,
    created: "2026-05-18T10:00:00Z",
    lastUpdate: "2026-05-18T10:00:00Z",
};

const order: Order = {
    id: 12,
    customer: "Mario Rossi",
    takeAway: false,
    serviceNumber: 2,
    serviceCost: 1,
    totalAmount: 12,
    username: "admin",
    created: "2026-05-18T10:00:00Z",
    lastUpdate: "2026-05-18T10:00:00Z",
    products: [
        {
            productId: product.id,
            quantity: 2,
            price: product.price,
        },
    ],
};

const renderOrderPrint = () => render(
    <ThemeProvider theme={sagraTheme.light}>
        <OrderPrint order={order} products={{[product.id]: product}}/>
    </ThemeProvider>,
);

describe("OrderPrint", () => {
    it("stampa la copia cliente quando abilitata da configurazione", () => {
        usePrintConfigurationMock.mockReturnValue({customerCopy: true});

        renderOrderPrint();

        expect(screen.getByText("Copia Cliente")).toBeInTheDocument();
        expect(screen.getByText("Cucina")).toBeInTheDocument();
    });

    it("non stampa la copia cliente quando disabilitata da configurazione", () => {
        usePrintConfigurationMock.mockReturnValue({customerCopy: false});

        const {container} = renderOrderPrint();

        expect(screen.queryByText("Copia Cliente")).not.toBeInTheDocument();
        expect(screen.getByText("Cucina")).toBeInTheDocument();
        expect(container.querySelector(".page-break")).not.toBeInTheDocument();
    });
});
