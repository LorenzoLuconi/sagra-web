import {beforeEach, describe, expect, it, vi} from "vitest";
import {sagraFetch, unauthorizedEventName} from "./sagraFetcher.ts";

describe("sagraFetch", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("emette un evento globale in caso di errore 401", async () => {
        const unauthorizedHandler = vi.fn();
        window.addEventListener(unauthorizedEventName, unauthorizedHandler);
        vi.spyOn(window, "fetch").mockResolvedValue(new Response(
            JSON.stringify({message: "Non autorizzato"}),
            {
                status: 401,
                headers: {"Content-Type": "application/json"},
            },
        ));

        await expect(sagraFetch({
            url: "/v1/test",
            method: "get",
        })).rejects.toMatchObject({
            status: 401,
            payload: {
                message: "Non autorizzato",
            },
        });

        expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
        window.removeEventListener(unauthorizedEventName, unauthorizedHandler);
    });

    it("non emette l'evento globale per un login fallito con 401", async () => {
        const unauthorizedHandler = vi.fn();
        window.addEventListener(unauthorizedEventName, unauthorizedHandler);
        vi.spyOn(window, "fetch").mockResolvedValue(new Response(
            JSON.stringify({message: "Credenziali non valide"}),
            {
                status: 401,
                headers: {"Content-Type": "application/json"},
            },
        ));

        await expect(sagraFetch({
            url: "/v1/auth/login",
            method: "post",
        })).rejects.toMatchObject({
            status: 401,
            payload: {
                message: "Credenziali non valide",
            },
        });

        expect(unauthorizedHandler).not.toHaveBeenCalled();
        window.removeEventListener(unauthorizedEventName, unauthorizedHandler);
    });
});
