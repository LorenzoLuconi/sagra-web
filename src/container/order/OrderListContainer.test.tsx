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
  DatePicker: ({onChange, value}: {
    onChange: (value: null | {format: () => string}) => void;
    value: null | {format: (format: string) => string};
  }) => (
      <div>
        <span data-testid="date-picker-value">{value ? value.format("YYYY-MM-DD") : ""}</span>
        <button type="button" aria-label="Rimuovi data ordine" onClick={() => onChange(null)}>
          Rimuovi data
        </button>
        <button type="button" aria-label="Imposta data ordine" onClick={() => onChange({format: () => "2026-06-23"})}>
          Imposta data
        </button>
      </div>
  ),
}));

describe("OrderListContainer", () => {
  it("filtra di default gli ordini per utente autenticato", async () => {
    renderWithProviders(<OrderListContainer />, {route: "/orders"});

    await waitFor(() => {
      expect(screen.getByTestId("orders-query")).toHaveTextContent("username=admin");
    });

    expect(screen.getByTestId("orders-query")).not.toHaveTextContent("created=");
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

  it("aggiorna la ricerca cliente senza premere la lente", async () => {
    renderWithProviders(<OrderListContainer />, {route: "/orders"});

    await waitFor(() => {
      expect(screen.getByTestId("orders-query")).toHaveTextContent("username=admin");
    });

    fireEvent.change(screen.getByLabelText("search by customer"), {target: {value: "Mario"}});

    expect(screen.getByTestId("orders-query")).not.toHaveTextContent("customer=Mario");

    await waitFor(() => {
      expect(screen.getByTestId("orders-query")).toHaveTextContent("customer=Mario");
    });

    expect(screen.queryByRole("button", {name: "search"})).not.toBeInTheDocument();
  });

  it("non ripristina la data odierna quando la data viene rimossa", async () => {
    renderWithProviders(<OrderListContainer />, {route: "/orders?created=2026-06-22"});

    await waitFor(() => {
      expect(screen.getByTestId("orders-query")).toHaveTextContent("created=2026-06-22");
    });

    fireEvent.click(screen.getByRole("button", {name: "Rimuovi data ordine"}));

    await waitFor(() => {
      expect(screen.getByTestId("orders-query")).not.toHaveTextContent("created=");
    });
  });
});
