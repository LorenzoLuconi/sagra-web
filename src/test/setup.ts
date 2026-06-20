import "@testing-library/jest-dom/vitest";
import {initializeAppConf} from "../AppConf.ts";

initializeAppConf({
    apiUrl: "http://localhost:8080",
    showProductImages: false,
    showThemeSwitcher: true,
});
