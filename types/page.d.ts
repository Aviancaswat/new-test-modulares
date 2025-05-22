import type { Page } from "@playwright/test";

declare module '@playwright/test' {
    interface Page {
        //#region Métodos generales
        getTimestamp(): string;
        takeScreenshot(label: string): Promise<void>;
        getLangPage(): Promise<Lang>;
        getPageTestConfiguration(): Promise<Page>;
        getRandomDelay(): number;
        verifyCookies(): Promise<void>;
        //#endregion

        //#region Home methods
        selectOriginFlight(): Promise<void>;
        selectDestinationFlight(): Promise<void>;
        selectDateInitFlight(): Promise<void>;
        selectDateEndFlight(): Promise<void>;
        selectPassengers(): Promise<void>;
        searchFlights(): Promise<void>;
        //#endregion

        //#region Selección de vuelos
        selectFlightOutbound(): Promise<void>;
        selectFlightReturn(): Promise<void>;
        validateModalFlights(): Promise<void>;
        continueToServices(): Promise<void>;
        //#endregion
    }
}