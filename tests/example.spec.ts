import { expect } from '@playwright/test';
import { copys } from "../data/aviancadata";
import { test } from "../extends/extend-tests";
import { GetContext } from '../global';

test.describe('Comenzo prueba avianca', () => {
    test('prueba home avianca', async () => {
        test.setTimeout(300_000);
        
        const context = await GetContext();
        const page = await context.newPage();
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        await page.goto('https://www.avianca.com/', {
            waitUntil: "domcontentloaded",
        });

        await page.waitForSelector("#searchComponentDiv");
        await page.takeScreenshot('01-goto-avianca');

        // página de búsqueda
        await page.verifyCookies();
        await page.selectOriginFlight();
        await page.selectDestinationFlight();
        await page.selectDateInitFlight();
        await page.selectPassengers();
        await page.continueSelectedFlights();

        //página de selección de vuelos
        await page.selectFlightOutbound();
        await page.validateModalFlights();
        await page.selectFlightReturn();
        await page.validateModalFlights();
        await page.continueToServices();

        // página de pasajeros
        await page.pagePassengers();
        await page.continueToSelectServices();
        await page.pageServices();

        //página de asientos
        await page.pageSeats();
        await page.pagePayment();
    });
});