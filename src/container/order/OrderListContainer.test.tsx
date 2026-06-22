import {fireEvent, screen, waitFor} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {useLocation} from "react-router";
import {renderWithProviders} from "../../test/renderWithProviders.tsx";
import OrderListContainer from "./OrderListContainer.tsx";

vi.mock("../../context/AuthStore.tsx", () => ({
  useAuth: () => ({
    user: {
      username: "admin",
      name: "Admin",
      role: "admin",
    },
  }),
}));

vi.mock("./OrderList.tsx", () => ({
  default: () => {
    const location = useLocation();
    return <div data-testid="orders-query">{location.search}</div>;
  },
}));

vi.mock("@mui/x-date-pickers", () => ({
  DatePicker: () => <input aria-label="Data ordine" readOnly />,
}));

describe("OrderListContainer", () => {
  it("filtra di default gli ordini per utente autenticato", async () => {
    renderWithProviders(<OrderListContainer />, {route: "/orders"});

    await waitFor(() => {
      expect(screen.getByTestId("orders-query")).toHaveTextContent("username=admin");
    });
  });

  it("rimuove username dalla ricerca quando lo switch viene disattivato", async () => {
    renderWithProviders(<OrderListContainer />, {route: "/orders"});

    await waitFor(() => {
      expect(screen.getByTestId("orders-query")).toHaveTextContent("username=admin");
    });

    fireEvent.click(screen.getByRole("checkbox", {name: "Solo ordini utente"}));

    await waitFor(() => {
      expect(screen.getByTestId("orders-query")).not.toHaveTextContent("username=");
    });
  });
});
