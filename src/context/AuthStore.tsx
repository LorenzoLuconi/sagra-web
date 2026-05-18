import * as React from "react";
import {useLogin, useLogout, useMe, meQuery} from "../api/sagra/sagraComponents.ts";
import type {AuthenticatedUser, LoginRequest} from "../api/sagra/sagraSchemas.ts";
import {useQueryClient} from "@tanstack/react-query";
import {unauthorizedEventName} from "../api/sagra/sagraFetcher.ts";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

interface AuthContextValue {
    user?: AuthenticatedUser;
    status: AuthStatus;
    errorMessage?: string;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    isLoginPending: boolean;
    isLogoutPending: boolean;
}

const AuthContext = React.createContext<AuthContextValue>({
    status: "loading",
    login: async () => undefined,
    logout: async () => undefined,
    refresh: async () => undefined,
    isLoginPending: false,
    isLogoutPending: false,
});

const getErrorStatus = (error: unknown): number | undefined => {
    if (error && typeof error === "object" && "status" in error) {
        const status = (error as {status?: unknown}).status;
        return typeof status === "number" ? status : undefined;
    }

    return undefined;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error && typeof error === "object") {
        if ("payload" in error) {
            const payload = (error as {payload?: unknown}).payload;
            if (payload && typeof payload === "object" && "message" in payload) {
                const message = (payload as {message?: unknown}).message;
                if (typeof message === "string" && message.length > 0) {
                    return message;
                }
            }
        }

        if ("message" in error) {
            const message = (error as {message?: unknown}).message;
            if (typeof message === "string" && message.length > 0) {
                return message;
            }
        }
    }

    return fallback;
};

const AuthStore: React.FC<React.PropsWithChildren> = ({children}) => {
    const queryClient = useQueryClient();
    const me = useMe({});
    const loginMutation = useLogin();
    const logoutMutation = useLogout();
    const [sessionExpired, setSessionExpired] = React.useState(false);

    const user = loginMutation.data ?? me.data;
    const meStatus = getErrorStatus(me.error);
    const loginErrorMessage = loginMutation.error ? getErrorMessage(loginMutation.error, "Login non riuscito") : undefined;
    const meErrorMessage = undefined;

    const status: AuthStatus = React.useMemo(() => {
        if (user) {
            return "authenticated";
        }

        if (sessionExpired) {
            return "unauthenticated";
        }

        if (me.isPending) {
            return "loading";
        }

        if (meStatus === 401) {
            return "unauthenticated";
        }

        if (me.error) {
            return "error";
        }

        return "unauthenticated";
    }, [me.error, me.isPending, meStatus, sessionExpired, user]);

    React.useEffect(() => {
        const handleUnauthorized = () => {
            setSessionExpired(true);
            loginMutation.reset();
            queryClient.removeQueries({queryKey: meQuery({}).queryKey});
        };

        window.addEventListener(unauthorizedEventName, handleUnauthorized);
        return () => {
            window.removeEventListener(unauthorizedEventName, handleUnauthorized);
        };
    }, [loginMutation, queryClient]);

    const refresh = React.useCallback(async () => {
        await queryClient.invalidateQueries({queryKey: meQuery({}).queryKey});
    }, [queryClient]);

    const login = React.useCallback(async (credentials: LoginRequest) => {
        const authenticatedUser = await loginMutation.mutateAsync({body: credentials});
        setSessionExpired(false);
        queryClient.setQueryData(meQuery({}).queryKey, authenticatedUser);
        await queryClient.invalidateQueries({queryKey: meQuery({}).queryKey});
    }, [loginMutation, queryClient]);

    const logout = React.useCallback(async () => {
        await logoutMutation.mutateAsync({});
        setSessionExpired(true);
        loginMutation.reset();
        queryClient.removeQueries({queryKey: meQuery({}).queryKey});
    }, [loginMutation, logoutMutation, queryClient]);

    const value = React.useMemo<AuthContextValue>(() => ({
        user,
        status,
        errorMessage: loginErrorMessage ?? meErrorMessage,
        login,
        logout,
        refresh,
        isLoginPending: loginMutation.isPending,
        isLogoutPending: logoutMutation.isPending,
    }), [
        user,
        status,
        loginErrorMessage,
        meErrorMessage,
        login,
        logout,
        refresh,
        loginMutation.isPending,
        logoutMutation.isPending,
    ]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthStore;

export const useAuth = () => React.useContext(AuthContext);
