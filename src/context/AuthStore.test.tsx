import {act, render, screen} from "@testing-library/react";
import {skipToken, QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {beforeEach, describe, expect, it, vi} from "vitest";
import AuthStore, {useAuth} from "./AuthStore.tsx";
import {unauthorizedEventName} from "../api/sagra/sagraFetcher.ts";

const useMeMock = vi.fn();
const useLoginMock = vi.fn();
const useLogoutMock = vi.fn();
const meQueryMock = vi.fn();

vi.mock("../api/sagra/sagraComponents.ts", () => ({
    useMe: (variables: unknown, options: unknown) => useMeMock(variables, options),
    useLogin: () => useLoginMock(),
    useLogout: () => useLogoutMock(),
    meQuery: () => meQueryMock(),
}));

const StatusView = () => {
    const {status} = useAuth();
    return <div>{status}</div>;
};

const renderAuthStore = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <AuthStore>
                <StatusView/>
            </AuthStore>
        </QueryClientProvider>,
    );
};

describe("AuthStore", () => {
    beforeEach(() => {
        useMeMock.mockReset();
        useLoginMock.mockReset();
        useLogoutMock.mockReset();
        meQueryMock.mockReset();
        useMeMock.mockReturnValue({
            data: undefined,
            error: undefined,
            isPending: true,
        });
        useLoginMock.mockReturnValue({
            data: undefined,
            error: undefined,
            isPending: false,
            mutateAsync: vi.fn(),
            reset: vi.fn(),
        });
        useLogoutMock.mockReturnValue({
            isPending: false,
            mutateAsync: vi.fn(),
        });
        meQueryMock.mockReturnValue({queryKey: ["me"]});
    });

    it("disabilita la query me dopo un evento unauthorized", async () => {
        renderAuthStore();

        expect(useMeMock).toHaveBeenLastCalledWith({}, expect.objectContaining({retry: false}));

        act(() => {
            window.dispatchEvent(new CustomEvent(unauthorizedEventName));
        });

        expect(await screen.findByText("unauthenticated")).toBeInTheDocument();
        expect(useMeMock).toHaveBeenLastCalledWith(skipToken, expect.objectContaining({retry: false}));
    });
});
