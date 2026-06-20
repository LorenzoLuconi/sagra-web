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

vi.mock("../department/useDepartmentName.ts", () => ({
    useDepartmentName: (departmentId: number) => ({data: `Reparto ${departmentId}`}),
}));

vi.mock("../course/useCourseName.ts", () => ({
    useCourseName: (courseId: number) => ({data: `Portata ${courseId}`}),
}));

const product = (overrides: Partial<Product> = {}): Product => ({
    id: overrides.id ?? 1,
    name: overrides.name ?? "Panino",
    departmentId: overrides.departmentId ?? 1,
    courseId: overrides.courseId ?? 1,
    price: 5,
    sellLocked: false,
    initialQuantity: 100,
    availableQuantity: 100,
    created: "2026-05-18T10:00:00Z",
    lastUpdate: "2026-05-18T10:00:00Z",
});

const panino = product();
const pasta = product({id: 2, name: "Pasta", departmentId: 2, courseId: 2});

const order = (products: Product[] = [panino]): Order => ({
    id: 12,
    customer: "Mario Rossi",
    takeAway: false,
    serviceNumber: 2,
    serviceCost: 1,
    totalAmount: 12,
    username: "admin",
    created: "2026-05-18T10:00:00Z",
    lastUpdate: "2026-05-18T10:00:00Z",
    products: products.map((product) => (
        {
            productId: product.id,
            quantity: 2,
            price: product.price,
        }
    )),
});

const renderOrderPrint = (orderedProducts: Product[] = [panino]) => render(
    <ThemeProvider theme={sagraTheme.light}>
        <OrderPrint
            order={order(orderedProducts)}
            products={orderedProducts.reduce<Record<number, Product>>((acc, product) => {
                acc[product.id] = product;
                return acc;
            }, {})}
        />
    </ThemeProvider>,
);

describe("OrderPrint", () => {
    it("stampa la copia cliente quando abilitata da configurazione", () => {
        usePrintConfigurationMock.mockReturnValue({customerCopy: true, splitBy: "department"});

        renderOrderPrint();

        expect(screen.getByText("Copia Cliente")).toBeInTheDocument();
        expect(screen.getByText("Reparto 1")).toBeInTheDocument();
    });

    it("non stampa la copia cliente quando disabilitata da configurazione", () => {
        usePrintConfigurationMock.mockReturnValue({customerCopy: false, splitBy: "department"});

        const {container} = renderOrderPrint();

        expect(screen.queryByText("Copia Cliente")).not.toBeInTheDocument();
        expect(screen.getByText("Reparto 1")).toBeInTheDocument();
        expect(container.querySelector(".page-break")).not.toBeInTheDocument();
    });

    it("non suddivide i prodotti quando split-by e' none", () => {
        usePrintConfigurationMock.mockReturnValue({customerCopy: false, splitBy: "none"});

        const {container} = renderOrderPrint([panino, pasta]);

        expect(screen.getByText("Prodotti")).toBeInTheDocument();
        expect(screen.queryByText("Reparto 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Reparto 2")).not.toBeInTheDocument();
        expect(screen.queryByText("Portata 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Portata 2")).not.toBeInTheDocument();
        expect(container.querySelector(".page-break")).not.toBeInTheDocument();
    });

    it("suddivide i prodotti per portata quando split-by e' course", () => {
        usePrintConfigurationMock.mockReturnValue({customerCopy: false, splitBy: "course"});

        const {container} = renderOrderPrint([panino, pasta]);

        expect(screen.getByText("Portata 1")).toBeInTheDocument();
        expect(screen.getByText("Portata 2")).toBeInTheDocument();
        expect(screen.queryByText("Reparto 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Reparto 2")).not.toBeInTheDocument();
        expect(container.querySelectorAll(".page-break")).toHaveLength(1);
    });

    it("suddivide i prodotti per reparto quando split-by e' department", () => {
        usePrintConfigurationMock.mockReturnValue({customerCopy: false, splitBy: "department"});

        const {container} = renderOrderPrint([panino, pasta]);

        expect(screen.getByText("Reparto 1")).toBeInTheDocument();
        expect(screen.getByText("Reparto 2")).toBeInTheDocument();
        expect(screen.queryByText("Portata 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Portata 2")).not.toBeInTheDocument();
        expect(container.querySelectorAll(".page-break")).toHaveLength(1);
    });
});
