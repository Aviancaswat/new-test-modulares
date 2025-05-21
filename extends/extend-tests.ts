import { test as base, expect } from "@playwright/test";
import type { Lang } from "../types/aviancatype";
import type { Page } from "playwright";
import { GetContext } from "../global/index";
import { copys } from "../data/aviancadata";
export { expect } from "@playwright/test";

export const test = base.extend({
    page: async ({ page }, use, testInfo) => {
        //#region métodos generales
        let step = 0;
        page.getTimestamp = (): string => {
            const now = new Date();
            const pad = (n: number) => n.toString().padStart(2, '0');
            const dd = pad(now.getDate());
            const mm = pad(now.getMonth() + 1);
            const yyyy = now.getFullYear();
            const hh = pad(now.getHours());
            const mi = pad(now.getMinutes());
            const ss = pad(now.getSeconds());
            return `fecha-${dd}-${mm}-${yyyy}_hora-${hh}-${mi}-${ss}`;
        }

        page.takeScreenshot = async (label: string): Promise<void> => {
            step++;
            const timestamp = page.getTimestamp();
            const name = `step${step}-${label}-${timestamp}.png`;
            const buffer = await page.screenshot({ path: `./image.test/${name}` });
            await testInfo.attach(`${label} (${timestamp})`, {
                body: buffer,
                contentType: 'image/png',
            });
        }

        page.getLangPage = async (): Promise<Lang> => {
            const languagePage = await page.evaluate(() => {
                let langResult: string | undefined = "";
                let lang = document.querySelector("html")?.getAttribute("lang")?.toLowerCase();
                lang?.includes("-") ? langResult = lang.split("-")[1] : langResult = lang;
                return langResult;
            }) as Lang;
            return languagePage;
        }

        page.getPageTestConfiguration = async (): Promise<Page> => {
            const context = await GetContext();
            const page = await context.newPage();
            return page;
        }

        page.getRandomDelay = (): number => {
            return Math.random() * (200 - 50) + 50;
        }

        page.verifyCookies = async (): Promise<void> => {
            const consentBtn = page.locator('#onetrust-pc-btn-handler');
            if (await consentBtn.isVisible()) {
                await consentBtn.click();
                await page.locator('.save-preference-btn-handler.onetrust-close-btn-handler').click({ delay: page.getRandomDelay() });
            }
        }

        page.selectOriginFlight = async (): Promise<void> => {
            const currentLang = await page.getLangPage();
            await expect(page.locator('.content-wrap')).toBeVisible();
            await page.waitForSelector("#originBtn");
            await expect(page.locator('#originBtn')).toBeVisible();
            const origen = page.getByPlaceholder((copys[currentLang]).origen); //solucionar el error de copys
            await page.locator('button#originBtn').click({ delay: page.getRandomDelay() });
            await origen.fill(copys['ciudad_origen']);
            await origen.press('Enter');
            await (page.locator('id=' + copys['ciudad_origen'])).click({ delay: page.getRandomDelay() })
            await page.takeScreenshot('03-ciudad-origen');
        }

        page.selectDestinationFlight = async (): Promise<void> => {
            const currentLang = await page.getLangPage();
            await expect(page.getByPlaceholder(copys[currentLang].destino)).toBeVisible();
            const destino = page.getByPlaceholder(copys[currentLang].destino);
            await destino.click({ delay: page.getRandomDelay() });
            await destino.fill(copys['ciudad_destino'], { timeout: page.getRandomDelay() });
            await destino.press('Enter');
            await (page.locator('id=' + copys['ciudad_destino'])).click({ delay: page.getRandomDelay() });
            await page.takeScreenshot('04-ciudad-destino');
        }

        page.selectDateInitFlight = async (): Promise<void> => {
            await page.waitForSelector("#departureInputDatePickerId");
            const fechaIda = await page.locator('id=departureInputDatePickerId')
            fechaIda.click({ delay: page.getRandomDelay() });
            await page.locator('span').filter({ hasText: copys['fecha_salida'] }).click({ delay: page.getRandomDelay() });
            await page.takeScreenshot('05-fecha-ida');
            await page.waitForTimeout(3000);
            await page.locator('span').filter({ hasText: copys['fecha_llegada'] }).click({ delay: page.getRandomDelay() });
            await page.takeScreenshot('06-fecha-vuelta');
        }

        page.selectPassengers = async (): Promise<void> => {
            await page.getByRole('button', { name: '' }).nth(1).click();
            await page.getByRole('button', { name: '' }).nth(2).click();
            await page.getByRole('button', { name: '' }).nth(3).click();
            const confirmar = await page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
            confirmar.click({ delay: page.getRandomDelay() });
            await page.takeScreenshot('07-seleccion-pasajeros');
        }

        //#endregion
        await use(page);
    }
});
