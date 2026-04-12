import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginView from "./LoginView.tsx";
import {renderWithProviders} from "../test/renderWithProviders.tsx";
import {vi} from "vitest";

const useAuthMock = vi.fn();

vi.mock("../context/AuthStore.tsx", () => ({
    useAuth: () => useAuthMock(),
}));

describe("LoginView", () => {
    beforeEach(() => {
        useAuthMock.mockReset();
    });

    it("invia username e password al login", async () => {
        const login = vi.fn().mockResolvedValue(undefined);
        useAuthMock.mockReturnValue({
            login,
            status: "unauthenticated",
            errorMessage: undefined,
            isLoginPending: false,
        });

        renderWithProviders(<LoginView />);

        await userEvent.type(screen.getByRole("textbox", {name: /Username/i}), "  cashier1  ");
        await userEvent.type(screen.getByLabelText(/Password/i, {selector: "input"}), "password123");
        await userEvent.click(screen.getByRole("button", {name: "Accedi"}));

        await waitFor(() => {
            expect(login).toHaveBeenCalledWith({
                username: "cashier1",
                password: "password123",
            });
        });
    });

    it("mostra il messaggio di errore backend al login fallito", () => {
        useAuthMock.mockReturnValue({
            login: vi.fn(),
            status: "unauthenticated",
            errorMessage: "Credenziali non valide",
            isLoginPending: false,
        });

        renderWithProviders(<LoginView />);

        expect(screen.getByText("Credenziali non valide")).toBeInTheDocument();
        expect(screen.queryByText("Impossibile verificare la sessione")).not.toBeInTheDocument();
    });
});
