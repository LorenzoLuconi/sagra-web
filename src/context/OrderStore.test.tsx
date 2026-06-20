import {act, render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Order, Product} from "../api/sagra/sagraSchemas.ts";
import {createEmptyOrder, OrderStore, useOrderStore} from "./OrderStore.tsx";

const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock("react-hot-toast", () => ({
    default: {
        error: (message: unknown, options?: unknown) => toastErrorMock(message, options),
        success: (message: unknown, options?: unknown) => toastSuccessMock(message, options),
    },
}));

const product = (overrides: Partial<Product> = {}): Product => ({
    id: 1,
    name: "Panino",
    departmentId: 1,
    courseId: 1,
    price: 5,
    sellLocked: false,
    initialQuantity: 10,
    availableQuantity: 5,
    created: "2026-01-01T00:00:00Z",
    lastUpdate: "2026-01-01T00:00:00Z",
    ...overrides,
});

const order = (overrides: Partial<Order> = {}): Order => ({
    id: 12,
    customer: "Mario",
    takeAway: false,
    serviceNumber: 2,
    serviceCost: 1,
    totalAmount: 10,
    username: "admin",
    created: "2026-01-01T00:00:00Z",
    lastUpdate: "2026-01-01T00:00:00Z",
    products: [],
    ...overrides,
});

const StoreProbe = ({selectedProduct}: {selectedProduct: Product}) => {
    const store = useOrderStore();

    return (
        <div>
            <output data-testid="order">{JSON.stringify(store.order)}</output>
            <output data-testid="products">{JSON.stringify(store.products)}</output>
            <output data-testid="errors">{JSON.stringify(store.errors)}</output>
            <output data-testid="is-new">{String(store.isNewOrder())}</output>
            <button type="button" onClick={() => store.addProduct(selectedProduct, 2)}>add-two</button>
            <button type="button" onClick={() => store.addProduct(selectedProduct, 6)}>add-six</button>
            <button type="button" onClick={() => store.setProduct(selectedProduct, 4)}>set-four</button>
            <button type="button" onClick={() => store.setProduct(selectedProduct, 8)}>set-eight</button>
            <button type="button" onClick={() => store.deleteProduct(selectedProduct)}>delete</button>
            <button type="button" onClick={() => store.updateOrderField("customer", "Luigi")}>update-customer</button>
            <button type="button" onClick={() => store.setFieldError("customer", "Nome obbligatorio")}>set-error</button>
            <button type="button" onClick={() => store.resetStore()}>reset-store</button>
            <button type="button" onClick={() => store.resetErrors()}>reset-errors</button>
        </div>
    );
};

const renderOrderStore = (initialOrder: Order, products: Product[]) => {
    const selectedProduct = products[0];

    return render(
        <OrderStore products={products} order={initialOrder}>
            <StoreProbe selectedProduct={selectedProduct}/>
        </OrderStore>,
    );
};

const currentOrder = (): Order => JSON.parse(screen.getByTestId("order").textContent ?? "{}");
const currentProducts = (): Record<number, Product> => JSON.parse(screen.getByTestId("products").textContent ?? "{}");
const currentErrors = (): Record<string, string> => JSON.parse(screen.getByTestId("errors").textContent ?? "{}");

describe("createEmptyOrder", () => {
    it("crea un ordine vuoto completo con il costo servizio indicato", () => {
        expect(createEmptyOrder(1.5)).toEqual({
            id: -1,
            customer: "",
            takeAway: false,
            serviceNumber: 0,
            serviceCost: 1.5,
            totalAmount: 0,
            username: "",
            created: "",
            lastUpdate: "",
            products: [],
        });
    });
});

describe("OrderStore", () => {
    beforeEach(() => {
        toastErrorMock.mockClear();
        toastSuccessMock.mockClear();
    });

    it("espone i prodotti come tabella indicizzata per id", async () => {
        const panino = product();
        const bibita = product({id: 2, name: "Bibita", price: 2, availableQuantity: 10});

        renderOrderStore(order(), [panino, bibita]);

        await waitFor(() => {
            expect(currentProducts()).toEqual({
                1: panino,
                2: bibita,
            });
        });
    });

    it("aggiunge un prodotto rispettando la disponibilita'", async () => {
        const panino = product();
        renderOrderStore(order(), [panino]);

        await act(async () => {
            screen.getByRole("button", {name: "add-two"}).click();
        });

        expect(currentOrder().products).toEqual([
            {
                productId: panino.id,
                quantity: 2,
                price: panino.price,
            },
        ]);
        expect(toastSuccessMock).toHaveBeenCalledWith(
            "Inserito/aggiunto 'Panino' all'ordine",
            expect.objectContaining({position: "top-right"}),
        );
    });

    it("blocca l'aggiunta di un nuovo prodotto oltre la disponibilita'", async () => {
        const panino = product({availableQuantity: 5});
        renderOrderStore(order(), [panino]);

        await act(async () => {
            screen.getByRole("button", {name: "add-six"}).click();
        });

        expect(currentOrder().products).toEqual([]);
        expect(toastErrorMock).toHaveBeenCalledWith(
            "Impossibile aggiungere il prodotto 'Panino' all'ordine: quantità massima raggiunta (5)",
            expect.objectContaining({position: "top-right"}),
        );
    });

    it("considera la quantita' originale quando modifica un ordine esistente", async () => {
        const panino = product({availableQuantity: 2});
        renderOrderStore(order({
            products: [{productId: panino.id, quantity: 2, price: panino.price}],
        }), [panino]);

        await act(async () => {
            screen.getByRole("button", {name: "set-four"}).click();
        });

        expect(currentOrder().products).toEqual([
            {
                productId: panino.id,
                quantity: 4,
                price: panino.price,
            },
        ]);

        await act(async () => {
            screen.getByRole("button", {name: "set-eight"}).click();
        });

        expect(currentOrder().products).toEqual([
            {
                productId: panino.id,
                quantity: 4,
                price: panino.price,
            },
        ]);
        expect(toastErrorMock).toHaveBeenCalledWith(
            "Impossibile aggiungere il prodotto 'Panino': quantità massima raggiunta (2)",
            expect.objectContaining({position: "top-right"}),
        );
    });

    it("aggiorna campi, errori e resetta allo stato iniziale", async () => {
        const initialOrder = order({
            customer: "Mario",
            products: [{productId: 1, quantity: 1, price: 5}],
        });
        renderOrderStore(initialOrder, [product()]);

        await act(async () => {
            screen.getByRole("button", {name: "update-customer"}).click();
            screen.getByRole("button", {name: "set-error"}).click();
        });

        expect(currentOrder().customer).toBe("Luigi");
        expect(currentErrors()).toEqual({customer: "Nome obbligatorio"});

        await act(async () => {
            screen.getByRole("button", {name: "reset-store"}).click();
        });

        expect(currentOrder()).toEqual(initialOrder);
        expect(currentErrors()).toEqual({});
    });

    it("rimuove prodotti e riconosce gli ordini nuovi", async () => {
        const panino = product();
        renderOrderStore(createEmptyOrder(1), [panino]);

        expect(screen.getByTestId("is-new")).toHaveTextContent("true");

        await act(async () => {
            screen.getByRole("button", {name: "add-two"}).click();
        });

        expect(currentOrder().products).toEqual([
            {
                productId: panino.id,
                quantity: 2,
                price: panino.price,
            },
        ]);

        await act(async () => {
            screen.getByRole("button", {name: "delete"}).click();
        });

        expect(currentOrder().products).toEqual([]);
    });
});
