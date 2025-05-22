import type { configurationType, translationType, Lang } from "../types/aviancatype";

const config: configurationType = {
    idioma: 'es' as Lang,
    pais: 'CO',
    fecha_salida: 'may 26',
    fecha_llegada: 'may 29',
    ciudad_origen: 'CLO',
    ciudad_destino: 'BOG'
}

const translations: translationType = {
    es: {
        origen: 'Origen',
        destino: 'Hacia',
        buscar: 'Buscar',
        vuelta: 'Vuelta',
        pagar: 'Ir a pagar',
    },
    en: {
        origen: 'Origin',
        destino: 'Destination',
        buscar: 'Search',
        vuelta: 'Return',
        pagar: 'Go to payment',
    },
    pt: {
        origen: 'Origem',
        destino: 'Destino',
        buscar: 'Buscar voos',
        vuelta: 'Regresso',
        pagar: 'Vá pagar',
    },
    fr: {
        origen: 'Origen',
        destino: 'Destination',
        buscar: 'Rechercher',
        vuelta: 'Retour',
        pagar: ' Continuer',
    }
};

const copys = {
    ...config,
    ...translations
}

export { copys };