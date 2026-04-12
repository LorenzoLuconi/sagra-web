import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {vi} from "vitest";
import {renderWithProviders} from "../../test/renderWithProviders.tsx";
import {UserEdit} from "./UserEdit.tsx";

const fetchCreateUserMock = vi.fn();
const listUsersQueryMock = vi.fn();
const invalidateQueriesMock = vi.fn(() => Promise.resolve());

vi.mock("../../api/sagra/sagraComponents.ts", () => ({
    fetchCreateUser: (...args: unknown[]) => fetchCreateUserMock(...args),
    listUsersQuery: (...args: unknown[]) => listUsersQueryMock(...args),
}));

vi.mock("../../main.tsx", () => ({
    queryClient: {
        invalidateQueries: (...args: unknown[]) => invalidateQueriesMock(...args),
    },
}));

describe("UserEdit", () => {
    beforeEach(() => {
        fetchCreateUserMock.mockReset();
        listUsersQueryMock.mockReset();
        invalidateQueriesMock.mockClear();
        listUsersQueryMock.mockReturnValue({queryKey: ["users"]});
        fetchCreateUserMock.mockResolvedValue({username: "admin01"});
    });

    it("valida username con minimo 6 caratteri", async () => {
        renderWithProviders(<UserEdit />);

        await userEvent.type(screen.getByRole("textbox", {name: /Username/i}), "user1");

        expect(screen.getByText("Minimo 6 caratteri")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Crea Utente"})).toBeDisabled();
    });

    it("crea l'utente con il ruolo selezionato", async () => {
        renderWithProviders(<UserEdit />);

        await userEvent.type(screen.getByRole("textbox", {name: /Username/i}), "admin01");
        await userEvent.type(screen.getByRole("textbox", {name: /Nome/i}), "Mario Rossi");
        await userEvent.click(screen.getByRole("combobox", {name: /Ruolo/i}));
        await userEvent.click(screen.getByRole("option", {name: "Admin"}));
        await userEvent.type(screen.getByLabelText(/Password/i, {selector: "input"}), "password123");
        await userEvent.click(screen.getByRole("button", {name: "Crea Utente"}));

        await waitFor(() => {
            expect(fetchCreateUserMock).toHaveBeenCalledWith({
                body: {
                    username: "admin01",
                    name: "Mario Rossi",
                    role: "admin",
                    password: "password123",
                },
            });
        });
    });
});
