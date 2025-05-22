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

        await page.verifyCookies();
        await page.selectOriginFlight();
        await page.selectDestinationFlight();
        await page.selectDateInitFlight();
        await page.selectPassengers();
        await page.searchFlights();

        await page.selectFlightOutbound();
        await page.validateModalFlights();
        await page.selectFlightReturn();
        await page.validateModalFlights();
        await page.continueToServices();

        //página de pasajeros
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
                if (element.name === "email") {
                    value = getDataRandom(emailsData);
                }
                else if (element.name === "confirmEmail") {
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
                            const cas = document.querySelector('#acceptNewCheckbox') as HTMLButtonElement;
                            cas.click();
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

                await expect(page.locator('id=email')).toBeVisible();
                await (page.locator('id=email')).fill('test@gmail.com');

                await expect(page.locator('id=confirmEmail')).toBeVisible();
                await (page.locator('id=confirmEmail')).fill('test@gmail.com');
                //const fieldAuthoritation = document.querySelector("#acceptNewCheckbox") as HTMLInputElement;
                // if (fieldAuthoritation) fieldAuthoritation.checked = true;

                await page.waitForSelector("id=acceptNewCheckbox");
                await expect(page.locator('id=acceptNewCheckbox')).toBeVisible();
                await (page.locator('id=acceptNewCheckbox')).click()

                await expect(page.locator('id=sendNewsLetter')).toBeVisible();
                await (page.locator('id=sendNewsLetter')).click();
            }
            setValuesDefaultAutoForm();
        });

        await page.takeScreenshot("llenado-de-pasajeros-ok");
        // // Esperar a que aparezca el modal
        // await page.waitForSelector('ngb-modal-window', { timeout: 5_000 });
        // // Localizar el botón “OK” del footer y hacer click
        // const okButton = page.locator('button.modal_footer_button-action', { hasText: 'OK' });
        // await expect(okButton).toBeVisible();
        // await okButton.click({ delay: getRandomDelay() });

        await page.waitForTimeout(2000);
        //boton de continuar para los servicios
        await expect(page.locator(".button.page_button.btn-action").last()).toBeVisible();
        await page.locator(".button.page_button.btn-action").last().click({ delay: getRandomDelay() });

        await page.waitForSelector(".main-banner--section-offer");
        await page.waitForTimeout(8000);
        await page.takeScreenshot("Pagina-de-servicios");
        await expect(page.locator("#serviceButtonTypeBusinessLounge")).toBeVisible();
        await page.locator('#serviceButtonTypeBusinessLounge').click({ delay: getRandomDelay() });
        await page.locator('.service_item_button.button').first().click({ delay: getRandomDelay() });
        await page.takeScreenshot("Servicio avianca-lounges");
        await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click({ delay: getRandomDelay() });

        await expect(page.locator('#serviceButtonTypeSpecialAssistance')).toBeVisible();
        await page.locator('#serviceButtonTypeSpecialAssistance').click({ delay: getRandomDelay() });
        await page.takeScreenshot("Servicio asistencia especial");
        await page.locator('.service_item_button.button').first().click({ delay: getRandomDelay() });
        await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click({ delay: getRandomDelay() });

        await expect(page.locator('.services-card_action_button.button').last()).toBeVisible();
        await page.takeScreenshot("Asistencia en viaje");
        await page.locator('.services-card_action_button.button').last().click({ delay: getRandomDelay() });
        await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted.FB-newConfirmButton').click({ delay: getRandomDelay() });
        await page.takeScreenshot("Servicios añadidos");
        await expect(page.locator(".button_label").last()).toBeVisible();
        await page.locator('.button_label').last().click({ delay: getRandomDelay() });

        const upsellService = await page.locator('.terciary-button').last().isVisible()
        if (upsellService) {
            await page.locator('.terciary-button').last().click({ delay: getRandomDelay() })
        }
        await page.waitForTimeout(12000);
        await page.takeScreenshot("Pagina-de-seleccion-asientos");
        //seleccion de asientos
        const pasajeros = page.locator(".pax-selector_pax-avatar")

        for (const e of await pasajeros.all()) {
            await page.takeScreenshot("seleccion-asiento");
            await expect(page.locator(".seat-number").first()).toBeVisible();
            await page.locator('.seat-number').first().click({ delay: getRandomDelay() });
            await page.waitForTimeout(8000);
        }

        await expect(page.locator(".next-flight-code")).toBeVisible();
        await page.takeScreenshot("seleccion-asiento-vuelta");
        await page.locator('.next-flight-code').click({ delay: getRandomDelay() });

        const pasajerosVuelta = page.locator(".pax-selector_pax-avatar")

        for (const j of await pasajerosVuelta.all()) {
            await page.takeScreenshot("seleccion-asiento");
            await expect(page.locator(".seat-number").first()).toBeVisible();
            await page.locator('.seat-number').first().click({ delay: getRandomDelay() });
            await page.waitForTimeout(8000);
        }

        await expect(page.getByRole('button', { name: copys[idioma].pagar, exact: true })).toBeVisible()
        await page.getByRole('button', { name: copys[idioma].pagar, exact: true }).click({ delay: getRandomDelay() });
        await page.waitForTimeout(5000);
        // await expect(page.locator('.payment-container_title')).toBeVisible();
        // await page.takeScreenshot("pagos");

        // const noOtraTarjeta = page.locator('.fb-left-container');
        // await expect(noOtraTarjeta).toBeVisible();
        // await noOtraTarjeta.click();
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