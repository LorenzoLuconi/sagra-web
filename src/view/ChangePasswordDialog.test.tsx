import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangePasswordDialog from "./ChangePasswordDialog.tsx";
import {renderWithProviders} from "../test/renderWithProviders.tsx";
import {vi} from "vitest";

const useChangePasswordMock = vi.fn();

vi.mock("../api/sagra/sagraComponents.ts", () => ({
    useChangePassword: () => useChangePasswordMock(),
}));

describe("ChangePasswordDialog", () => {
    beforeEach(() => {
        useChangePasswordMock.mockReset();
    });

    it("mostra il messaggio di ErrorResource in caso di errore", () => {
        useChangePasswordMock.mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
            reset: vi.fn(),
            error: {
                payload: {
                    message: "Password corrente non valida",
                },
            },
        });

        renderWithProviders(<ChangePasswordDialog open onClose={vi.fn()} />);

        expect(screen.getByText("Password corrente non valida")).toBeInTheDocument();
    });

    it("blocca il salvataggio con password nuova più corta di 8 caratteri", async () => {
        const mutate = vi.fn();
        useChangePasswordMock.mockReturnValue({
            mutate,
            isPending: false,
            reset: vi.fn(),
            error: null,
        });

        renderWithProviders(<ChangePasswordDialog open onClose={vi.fn()} />);

        const passwordInputs = screen.getAllByLabelText(/password/i, {selector: "input"});
        await userEvent.type(passwordInputs[0], "oldpassword");
        await userEvent.type(passwordInputs[1], "short");
        await userEvent.type(passwordInputs[2], "short");

        expect(screen.getByText("La password deve contenere almeno 8 caratteri")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Salva"})).toBeDisabled();
        expect(mutate).not.toHaveBeenCalled();
    });
});
