import { test as base, expect } from "@playwright/test";
import type { Lang } from "../types/aviancatype";
import { chromium } from "playwright-extra"
import type { Page } from "playwright";

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
            const browser = await chromium.launch({
                headless: true,
                args: ['--disable-blink-features=AutomationControlled',
                    '--enable-webgl',
                    '--use-gl=swiftshader',
                    '--enable-accelerated-2d-canvas'
                ]
            });

            const context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                viewport: { width: 1280, height: 720 },
                locale: 'en-US',
                timezoneId: 'America/New_York',
                deviceScaleFactor: 1,
            });
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

        //#endregion

        await use(page);
    }
})