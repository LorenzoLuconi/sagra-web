import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import UsersList from "./UsersList.tsx";
import {renderWithProviders} from "../../test/renderWithProviders.tsx";

const fetchDeleteUserMock = vi.fn();
const fetchUpdateUserMock = vi.fn();
const listUsersQueryMock = vi.fn();
const invalidateQueriesMock = vi.fn((...args: unknown[]) => {
    void args;
    return Promise.resolve();
});
const confirmMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("../../api/sagra/sagraComponents.ts", () => ({
    fetchDeleteUser: (...args: unknown[]) => fetchDeleteUserMock(...args),
    fetchUpdateUser: (...args: unknown[]) => fetchUpdateUserMock(...args),
    listUsersQuery: (...args: unknown[]) => listUsersQueryMock(...args),
}));

vi.mock("../../main.tsx", () => ({
    queryClient: {
        invalidateQueries: (...args: unknown[]) => invalidateQueriesMock(...args),
    },
}));

vi.mock("material-ui-confirm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("material-ui-confirm")>();
    return {
        ...actual,
        useConfirm: () => confirmMock,
    };
});

vi.mock("../../context/AuthStore.tsx", () => ({
    useAuth: () => useAuthMock(),
}));

describe("UsersList", () => {
    beforeEach(() => {
        fetchDeleteUserMock.mockReset();
        fetchUpdateUserMock.mockReset();
        listUsersQueryMock.mockReset();
        invalidateQueriesMock.mockClear();
        confirmMock.mockReset();
        useAuthMock.mockReset();

        listUsersQueryMock.mockReturnValue({
            queryKey: ["users"],
            queryFn: async () => [
                {username: "admin01", name: "Admin", role: "admin"},
                {username: "cashier1", name: "Cashier", role: "cashier"},
            ],
        });
        useAuthMock.mockReturnValue({
            user: {username: "admin01", name: "Admin", role: "admin"},
        });
        fetchDeleteUserMock.mockResolvedValue(undefined);
        fetchUpdateUserMock.mockResolvedValue(undefined);
    });

    it("chiede conferma prima di cancellare un utente", async () => {
        confirmMock.mockResolvedValue({confirmed: true});

        renderWithProviders(<UsersList />);

        await screen.findByText("cashier1");
        const deleteButtons = screen.getAllByLabelText("delete");
        await userEvent.click(deleteButtons[1]);

        await waitFor(() => {
            expect(confirmMock).toHaveBeenCalledWith({
                title: "Cancellazione utente 'cashier1'",
                description: "Vuoi procedere alla cancellazione dell'utente?",
            });
        });
        await waitFor(() => {
            expect(fetchDeleteUserMock).toHaveBeenCalledWith({
                pathParams: {username: "cashier1"},
            });
        });
    });

    it("salva la modifica del ruolo selezionato", async () => {
        renderWithProviders(<UsersList />);

        await screen.findByText("cashier1");
        const editButtons = screen.getAllByLabelText("edit");
        await userEvent.click(editButtons[1]);
        await userEvent.click(screen.getByRole("combobox"));
        await userEvent.click(screen.getByRole("option", {name: "Admin"}));
        await userEvent.click(screen.getByLabelText("Salva modifica"));

        await waitFor(() => {
            expect(fetchUpdateUserMock).toHaveBeenCalledWith({
                body: {
                    name: "Cashier",
                    role: "admin",
                },
                pathParams: {username: "cashier1"},
            });
        });
    });
});
