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

        await page.waitForTimeout(1000);

        // Llenar datos de facturación
        await page.waitForSelector('input#email', { timeout: 15_000 });

        // Correo electrónico
        const emailInput = page.locator('input#email');
        await expect(emailInput).toBeVisible();
        await emailInput.fill('monitoreo.digital@avianca.com');

        // Dirección de residencia
        const addressInput = page.locator('input#address');
        await expect(addressInput).toBeVisible();
        await addressInput.fill('Calle 123 #45-67');

        // Ciudad
        const cityInput = page.locator('input#city');
        await expect(cityInput).toBeVisible();
        await cityInput.fill('Bogotá');

        // País
        const countryBtn = page.locator('button#country');
        await expect(countryBtn).toBeVisible();
        await countryBtn.click();

        // Esperar a que aparezcan las opciones
        await page.waitForSelector('div.ds-select-dropdown li button', { timeout: 5_000 });

        // Seleccionar “Colombia”
        const countryOption = page
            .locator('div.ds-select-dropdown li button')
            .filter({ hasText: 'Colombia' });
        await expect(countryOption).toBeVisible();
        await countryOption.click({ delay: getRandomDelay() });

        await page.takeScreenshot('19-country-seleccionado');

        // Aceptar Términos
        const termsCheckbox = page.locator('input#terms');
        await expect(termsCheckbox).toBeVisible();
        await termsCheckbox.check();
        await page.takeScreenshot('20-aceptar-terminos');

        // Captura final de facturación
        await page.takeScreenshot('21-datos-facturacion');

    });
});