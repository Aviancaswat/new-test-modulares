import type { Page } from "@playwright/test";

declare module '@playwright/test' {
    interface Page {
        //#region Métodos generales
        getTimestamp(): string;
        takeScreenshot(label: string): Promise<void>;
        getLangPage(): Promise<Lang>;
        getPageTestConfiguration(): Promise<Page>;
        getRandomDelay(): number;
        //#endregion
    }
}