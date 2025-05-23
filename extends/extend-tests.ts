import { test as base, expect } from "@playwright/test";
import type { Lang } from "../types/aviancatype";
import type { Page } from "playwright";
import { GetContext } from "../global/index";
import { copys } from "../data/aviancadata";
import { promises } from "dns";
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

        //#endregion

        //#region Home métodos

        page.selectOriginFlight = async (): Promise<void> => {
            const currentLang = await page.getLangPage() as Lang;
            await expect(page.locator('.content-wrap')).toBeVisible();
            await page.waitForSelector("#originBtn");
            await expect(page.locator('#originBtn')).toBeVisible();
            const origen = page.getByPlaceholder(copys[currentLang].origen); //solucionar el error de copys
            await page.locator('button#originBtn').click({ delay: page.getRandomDelay() });
            await origen.fill(copys['ciudad_origen']);
            await origen.press('Enter');
            await (page.locator('id=' + copys['ciudad_origen'])).click({ delay: page.getRandomDelay() })
            await page.takeScreenshot('03-ciudad-origen');
        }

        page.selectDestinationFlight = async (): Promise<void> => {
            const currentLang = await page.getLangPage() as Lang;
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

        page.continueSelectedFlights = async (): Promise<void> => {
            const currentLang = await page.getLangPage() as Lang;
            await expect(page.getByRole('button', { name: copys[currentLang].buscar, exact: true })).toBeVisible()
            await page.getByRole('button', { name: copys[currentLang].buscar, exact: true }).click({ delay: page.getRandomDelay() });
            await page.takeScreenshot('08-buscar');
        }

        page.selectFlightOutbound = async (): Promise<void> => {
            await page.waitForSelector('#pageWrap');
            await expect(page.locator(".journey_price_fare-select_label-text").first()).toBeVisible();
            await page.locator('.journey_price_fare-select_label-text').first().click({ delay: page.getRandomDelay() });
            await page.waitForSelector(".journey_fares");
            await page.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click({ delay: page.getRandomDelay() });
            await page.takeScreenshot('09-seleccion-vuelo-ida');
        }

        page.selectFlightReturn = async (): Promise<void> => {
            await page.waitForSelector("#journeysContainerId_1", { timeout: 15000 });
            const containerVuelta = page.locator("#journeysContainerId_1");
            await expect(containerVuelta).toBeVisible();
            await containerVuelta.locator(".journey_price_fare-select_label-text").first().click({ delay: page.getRandomDelay() });
            await page.takeScreenshot('13-seleccion-vuelo-regreso');
            await containerVuelta.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click({ delay: page.getRandomDelay() });
            await page.waitForTimeout(1500);
        }

        page.validateModalFlights = async (): Promise<void> => {
            await page.waitForTimeout(1500);
            const isVisibleModal = await page.locator("#FB310").first().isVisible();

            if (isVisibleModal) {
                await expect(page.locator(".cro-button.cro-no-accept-upsell-button")).toBeVisible();
                await page.locator(".cro-button.cro-no-accept-upsell-button").first().click({ delay: page.getRandomDelay() });
            }
        }

        page.continueToServices = async (): Promise<void> => {
            await page.takeScreenshot('13-resumen-de-vuelos-seleccionados');
            await page.waitForSelector(".trip-summary");
            const buttonConfirmResumen = page.locator(".button.page_button.btn-action");
            await expect(buttonConfirmResumen).toBeVisible();
            buttonConfirmResumen.scrollIntoViewIfNeeded();
            await buttonConfirmResumen.click({ delay: page.getRandomDelay() });
        }

        page.pagePassengers = async (): Promise<void> => {
            await page.waitForSelector(".passenger_data_group");
            await page.takeScreenshot("inicio-de-llenado-pagina-de-pasajeros");

            await page.evaluate(() => {
                const userNamesData: Array<string> = [
                    "john doe",
                    "jane smith",
                    "alexander wilson",
                    "maria gomez",
                    "roberto perez",
                    "lucia martinez",
                    "david hernandez",
                    "carla jones",
                    "luis vega",
                    "susan brown"
                ];
                const lastNamesData: Array<string> = [
                    "Doe",
                    "Smith",
                    "Wilson",
                    "Gomez",
                    "Perez",
                    "Martinez",
                    "Hernandez",
                    "Jones",
                    "Vega",
                    "Brown"
                ];
                const emailsData: Array<string> = [
                    "monitoreo.digital@avianca.com"
                ];
                const phoneNumbersData: Array<string> = [
                    "123456",
                    "987654",
                    "654321",
                    "321654",
                    "987123",
                    "456789",
                    "102938",
                    "112233",
                    "778899",
                    "334455"
                ];
                const getDataRandom = (data: Array<string> = []): string => {
                    return data[Math.floor(Math.random() * data.length)];
                }
                const getValueElement = (element: HTMLInputElement): string => {
                    let value: string | null = null;
                    if (element.name === "email" || element.name === 'confirmEmail') {
                        value = getDataRandom(emailsData);
                    }
                    else if (element.name === "phone_phoneNumberId") {
                        value = getDataRandom(phoneNumbersData);
                    }
                    else if (element.id.includes("IdFirstName")) {
                        value = getDataRandom(userNamesData);
                    }
                    else {
                        value = getDataRandom(lastNamesData);
                    }

                    return value;
                }
                const getButtonAndClickItem = () => {
                    const listOptions = document.querySelector(".ui-dropdown_list");
                    const buttonElement = listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement;
                    buttonElement.click();
                }
                const setValuesDefaultAutoForm = async () => {
                    const elements = document.querySelectorAll('.ui-input');
                    Array.from(elements).forEach((element) => {
                        if (element.tagName === "BUTTON") {
                            const elementButton = element as HTMLButtonElement;
                            elementButton.click();
                            const listOptions = document.querySelector(".ui-dropdown_list");
                            (listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement)?.click();
                            if (element.id === "passengerId") {
                                elementButton.click();
                                setTimeout(() => {
                                    getButtonAndClickItem();
                                }, 1000);
                            }
                            else if (element.id === 'phone_prefixPhoneId') {
                                setTimeout(() => {
                                    elementButton.click();
                                    getButtonAndClickItem();
                                }, 1000);
                            }
                            else {
                                elementButton.click();
                                getButtonAndClickItem();
                            }
                        }
                        else if (element.tagName === "INPUT") {
                            const elementInput = element as HTMLInputElement;
                            const containers = document.querySelectorAll(".ui-input-container");
                            Array.from(containers).forEach(e => { e.classList.add("is-focused") });
                            let eventBlur: Event = new Event("blur");
                            let eventFocus: Event = new Event("focus");
                            elementInput.value = getValueElement(elementInput);
                            ['change', 'input'].forEach(event => {
                                let handleEvent = new Event(event, { bubbles: true, cancelable: false });
                                element.dispatchEvent(handleEvent);
                            });
                            element.dispatchEvent(eventFocus);
                            setTimeout(() => {
                                element.dispatchEvent(eventBlur);
                                Array.from(containers).forEach(e => { e.classList.remove("is-focused") });
                            }, 1000);
                        }
                    });

                    setTimeout(() => {
                        const fieldAuthoritation: HTMLInputElement | null = document.querySelector("#acceptNewCheckbox") as HTMLInputElement;
                        if (fieldAuthoritation) fieldAuthoritation.checked = true;
                    }, 500);
                }
                setValuesDefaultAutoForm();
            });

            await page.takeScreenshot("llenado-de-pasajeros-ok");
        }

        page.continueToSelectServices = async (): Promise<void> => {
            await page.waitForTimeout(2000);
            await expect(page.locator(".button.page_button.btn-action").last()).toBeVisible();
            await page.locator(".button.page_button.btn-action").last().click({ delay: page.getRandomDelay() });
        }

        page.pageServices = async (): Promise<void> => {
            await page.waitForSelector(".main-banner--section-offer");
            await page.waitForTimeout(8000);
            await page.takeScreenshot("Pagina-de-servicios");
            await expect(page.locator("#serviceButtonTypeBusinessLounge")).toBeVisible();
            await page.locator('#serviceButtonTypeBusinessLounge').click({ delay: page.getRandomDelay() });
            await page.locator('.service_item_button.button').first().click({ delay: page.getRandomDelay() });
            await page.takeScreenshot("Servicio avianca-lounges");
            await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click({ delay: page.getRandomDelay() });

            await expect(page.locator('#serviceButtonTypeSpecialAssistance')).toBeVisible();
            await page.locator('#serviceButtonTypeSpecialAssistance').click({ delay: page.getRandomDelay() });
            await page.takeScreenshot("Servicio asistencia especial");
            await page.locator('.service_item_button.button').first().click({ delay: page.getRandomDelay() });
            await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click({ delay: page.getRandomDelay() });

            await expect(page.locator('.services-card_action_button.button').last()).toBeVisible();
            await page.takeScreenshot("Asistencia en viaje");
            await page.locator('.services-card_action_button.button').last().click({ delay: page.getRandomDelay() });
            await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted.FB-newConfirmButton').click({ delay: page.getRandomDelay() });
            await page.takeScreenshot("Servicios añadidos");
            await expect(page.locator(".button_label").last()).toBeVisible();
            await page.locator('.button_label').last().click({ delay: page.getRandomDelay() });

            const upsellService = await page.locator('.terciary-button').last().isVisible()
            if (upsellService) {
                await page.locator('.terciary-button').last().click({ delay: page.getRandomDelay() })
            }
        }

        page.pagePayment = async (): Promise<void> => {
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
            await countryOption.click({ delay: page.getRandomDelay() });
            await page.takeScreenshot('19-country-seleccionado');
            // Aceptar Términos
            const termsCheckbox = page.locator('input#terms');
            await expect(termsCheckbox).toBeVisible();
            await termsCheckbox.check();
            await page.takeScreenshot('20-aceptar-terminos');
            // Captura final de facturación
            await page.takeScreenshot('21-datos-facturacion');
        }
        
        //#endregion
        await use(page);
    }
});
