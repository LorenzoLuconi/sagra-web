import {describe, expect, it} from "vitest";
import type {Order} from "../api/sagra/sagraSchemas.ts";
import {checkOrderErrors} from "./index.ts";

const order = (partial: Partial<Order> = {}): Order => ({
    id: -1,
    customer: "",
    takeAway: false,
    serviceNumber: 0,
    serviceCost: 0,
    totalAmount: 0,
    username: "test",
    created: "2026-01-01T00:00:00",
    lastUpdate: "2026-01-01T00:00:00",
    products: [{productId: 1, quantity: 1, price: 1}],
    ...partial,
});

describe("checkOrderErrors", () => {
    it("non richiede il nome cliente quando name-mandatory e' disabilitato", () => {
        const errors = checkOrderErrors(order({serviceNumber: 1}), {}, {
            nameMandatory: false,
        });

        expect(errors.customer).toBeUndefined();
    });

    it("non richiede i coperti quando service-enabled e' disabilitato", () => {
        const errors = checkOrderErrors(order({customer: "Mario"}), {}, {
            serviceEnabled: false,
        });

        expect(errors.serviceNumber).toBeUndefined();
    });
});
