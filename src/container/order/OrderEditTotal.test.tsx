import {screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import type {Order, Product} from "../../api/sagra/sagraSchemas.ts";
import {OrderStore} from "../../context/OrderStore.tsx";
import {renderWithProviders} from "../../test/renderWithProviders.tsx";
import OrderEditTotal from "./OrderEditTotal.tsx";

vi.mock("../../api/sagra/sagraComponents.ts", () => ({
  discountsSearchQuery: () => ({
    queryKey: ["discounts"],
    queryFn: async () => [],
  }),
}));

const panino: Product = {
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

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 12,
  customer: "Mario Rossi",
  takeAway: false,
  serviceNumber: 2,
  serviceCost: 1,
  totalAmount: 12,
  username: "admin",
  created: "2026-05-18T10:00:00Z",
  lastUpdate: "2026-05-18T10:00:00Z",
  products: [{
    productId: 1,
    quantity: 2,
    price: 5,
  }],
  ...overrides,
});

const renderOrderEditTotal = (orderToRender: Order) => renderWithProviders(
  <OrderStore products={[panino]} order={orderToRender}>
    <OrderEditTotal />
  </OrderStore>,
);

describe("OrderEditTotal", () => {
  it("mostra il totale originale accanto al totale scontato", async () => {
    renderOrderEditTotal(order({discountRate: 10}));

    expect(await screen.findByText(/10,80/)).toBeInTheDocument();
    expect(screen.getByText(/12,00/)).toBeInTheDocument();
  });

  it("non mostra un secondo totale se non e' applicato uno sconto", async () => {
    renderOrderEditTotal(order());

    expect(await screen.findByText(/12,00/)).toBeInTheDocument();
    expect(screen.getAllByText(/12,00/)).toHaveLength(1);
  });
});
