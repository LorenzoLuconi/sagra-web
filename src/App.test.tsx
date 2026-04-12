import {render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import App from "./App.tsx";

const useAuthMock = vi.fn();
const protectedRoutes = [
    "/",
    "/home",
    "/products",
    "/products/updateQuantity",
    "/orders",
    "/orders/new",
    "/orders/1",
    "/users",
    "/departments",
    "/courses",
    "/discounts",
    "/stats",
    "/monitors",
    "/qualcosa-che-non-esiste",
];

vi.mock("./context/AuthStore.tsx", () => ({
    useAuth: () => useAuthMock(),
}));

vi.mock("./view/LoginView.tsx", () => ({
    default: () => <div>Login Mock</div>,
}));

vi.mock("./container/monitor/MonitorView.tsx", () => ({
    default: () => <div>Monitor View Mock</div>,
}));

describe("App public routes", () => {
    beforeEach(() => {
        useAuthMock.mockReset();
        Object.defineProperty(window, "localStorage", {
            writable: true,
            value: {
                getItem: vi.fn(() => null),
                setItem: vi.fn(),
                removeItem: vi.fn(),
                clear: vi.fn(),
            },
        });
    });

    it("mostra MonitorView anche senza autenticazione sulla route pubblica", async () => {
        window.history.pushState({}, "", "/monitors/1/view");
        useAuthMock.mockReturnValue({
            status: "unauthenticated",
        });

        render(<App />);

        expect(await screen.findByText("Monitor View Mock")).toBeInTheDocument();
        expect(screen.queryByText("Login Mock")).not.toBeInTheDocument();
    });

    it("mostra LoginView senza autenticazione sulle route protette", async () => {
        window.history.pushState({}, "", "/orders");
        useAuthMock.mockReturnValue({
            status: "unauthenticated",
        });

        render(<App />);

        expect(await screen.findByText("Login Mock")).toBeInTheDocument();
        expect(screen.queryByText("Monitor View Mock")).not.toBeInTheDocument();
    });

    it.each(protectedRoutes)("richiede autenticazione per %s", async (route) => {
        window.history.pushState({}, "", route);
        useAuthMock.mockReturnValue({
            status: "unauthenticated",
        });

        render(<App />);

        expect(await screen.findByText("Login Mock")).toBeInTheDocument();
        expect(screen.queryByText("Monitor View Mock")).not.toBeInTheDocument();
    });
});
