import { test as base } from "@playwright/test";
import type { Lang } from "../types/aviancatype";
import { chromium } from "playwright-extra"
import type { Page } from "playwright";
import { GetContext } from "../global/index";

export const test2 = base.extend({
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

            return page;
        }

        page.getRandomDelay = (): number => {
            return Math.random() * (200 - 50) + 50;
        }

        //#endregion
        await use(page);
    }
});

export { expect } from "@playwright/test";