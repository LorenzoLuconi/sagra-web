import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "sagraWeb", {
    writable: true,
    value: {
        apiUrl: "http://localhost:8080",
        sagraStartDay: "2026-01-01",
        sagraEndDay: "2026-12-31",
        showProductImages: false,
        title: "Sagra Web",
        showThemeSwitcher: true,
    },
});
