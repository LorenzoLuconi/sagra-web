import {fireEvent, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Order, Product} from "../../api/sagra/sagraSchemas.ts";
import {renderWithProviders} from "../../test/renderWithProviders.tsx";
import {createEmptyOrder, OrderStore} from "../../context/OrderStore.tsx";
import OrderEditForm from "./OrderEditForm.tsx";

const useOrderConfigurationMock = vi.fn();
const fetchOrderCreateMock = vi.fn();
const fetchOrderDeleteMock = vi.fn();
const fetchOrderUpdateMock = vi.fn();
const ordersSearchQueryMock = vi.fn();
const productsSearchQueryMock = vi.fn();
const invalidateQueriesMock = vi.fn(() => Promise.resolve());
const navigateMock = vi.fn();

vi.mock("../../context/AppConfigurationStore.tsx", () => ({
    useOrderConfiguration: () => useOrderConfigurationMock(),
}));

vi.mock("../../api/sagra/sagraComponents.ts", () => ({
    fetchOrderCreate: (...args: unknown[]) => fetchOrderCreateMock(...args),
    fetchOrderDelete: (...args: unknown[]) => fetchOrderDeleteMock(...args),
    fetchOrderUpdate: (...args: unknown[]) => fetchOrderUpdateMock(...args),
    ordersSearchQuery: (...args: unknown[]) => ordersSearchQueryMock(...args),
    productsSearchQuery: (...args: unknown[]) => productsSearchQueryMock(...args),
}));

vi.mock("../../main.tsx", () => ({
    queryClient: {
        invalidateQueries: (...args: unknown[]) => invalidateQueriesMock(...args),
    },
}));

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-router")>();
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

vi.mock("./OrderPrint.tsx", () => ({
    default: () => <div data-testid="order-print"/>,
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

const savedOrder = (overrides: Partial<Order> = {}): Order => ({
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
    ...overrides,
});

const renderOrderEditForm = (order: Order) => renderWithProviders(
    <OrderStore products={[product]} order={order}>
        <OrderEditForm/>
    </OrderStore>,
);

describe("OrderEditForm buttons", () => {
    beforeEach(() => {
        useOrderConfigurationMock.mockReset();
        fetchOrderCreateMock.mockReset();
        fetchOrderDeleteMock.mockReset();
        fetchOrderUpdateMock.mockReset();
        ordersSearchQueryMock.mockReset();
        productsSearchQueryMock.mockReset();
        invalidateQueriesMock.mockClear();
        navigateMock.mockClear();

        useOrderConfigurationMock.mockReturnValue({
            nameMandatory: true,
            takeAwayEnabled: true,
            serviceEnabled: true,
            serviceCost: 1,
        });
        ordersSearchQueryMock.mockReturnValue({queryKey: ["orders"]});
        productsSearchQueryMock.mockReturnValue({queryKey: ["products"]});
    });

    it("mostra solo Crea e Annulla per un nuovo ordine", () => {
        renderOrderEditForm(createEmptyOrder(1));

        expect(screen.getByRole("button", {name: "Crea"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Annulla"})).toBeDisabled();
        expect(screen.queryByRole("button", {name: "Aggiorna"})).not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Stampa"})).not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Elimina"})).not.toBeInTheDocument();
    });

    it("mostra i pulsanti per un ordine salvato invariato anche con configurazioni ordine disattivate", () => {
        useOrderConfigurationMock.mockReturnValue({
            nameMandatory: false,
            takeAwayEnabled: false,
            serviceEnabled: false,
            serviceCost: 1,
        });

        renderOrderEditForm(savedOrder({takeAway: true, serviceNumber: 2}));

        expect(screen.queryByRole("button", {name: "Crea"})).not.toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Aggiorna"})).toBeDisabled();
        expect(screen.getByRole("button", {name: "Stampa"})).toBeEnabled();
        expect(screen.getByRole("button", {name: "Annulla"})).toBeDisabled();
        expect(screen.getByRole("button", {name: "Elimina"})).toBeInTheDocument();
        expect(screen.getByRole("spinbutton", {name: "Coperti"})).toBeInTheDocument();
        expect(screen.getByRole("checkbox", {name: "Asporto"})).toBeChecked();
    });

    it("abilita Aggiorna e Annulla e disabilita Stampa quando un ordine salvato cambia", () => {
        renderOrderEditForm(savedOrder());

        fireEvent.change(screen.getByRole("textbox", {name: "Nome cliente"}), {
            target: {value: "Luigi Bianchi"},
        });

        expect(screen.getByRole("button", {name: "Aggiorna"})).toBeEnabled();
        expect(screen.getByRole("button", {name: "Stampa"})).toBeDisabled();
        expect(screen.getByRole("button", {name: "Annulla"})).toBeEnabled();
        expect(screen.getByRole("button", {name: "Elimina"})).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Crea"})).not.toBeInTheDocument();
    });
});
