import {fireEvent, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {useLocation} from "react-router";
import Header from "./Header.tsx";
import {renderWithProviders} from "../test/renderWithProviders.tsx";

vi.mock("../context/AuthStore.tsx", () => ({
    useAuth: () => ({
        user: {
            username: "admin",
            name: "Admin",
            role: "admin",
        },
        logout: vi.fn(),
        isLogoutPending: false,
    }),
}));

const CurrentLocation = () => {
    const location = useLocation();
    return <div data-testid="current-location">{location.pathname}{location.search}</div>;
};

describe("Header", () => {
    beforeEach(() => {
        vi.useFakeTimers({shouldAdvanceTime: true});
        vi.setSystemTime(new Date("2026-06-22T10:00:00+02:00"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("apre l'elenco ordini filtrando per la data odierna", () => {
        renderWithProviders(
            <>
                <Header changeTheme={vi.fn()} />
                <CurrentLocation />
            </>,
            {route: "/"},
        );

        fireEvent.click(screen.getByRole("button", {name: /Elenco Ordini/i}));

        expect(screen.getByTestId("current-location")).toHaveTextContent("/orders?created=2026-06-22");
    });
});
