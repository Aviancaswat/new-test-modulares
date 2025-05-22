type Lang = 'es' | 'en' | 'pt' | 'fr';

type configurationType = {
    idioma: Lang,
    pais: string,
    fecha_salida: string,
    fecha_llegada: string,
    ciudad_origen: string,
    ciudad_destino: string
}

type translationType = {
    es: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
        pagar: string
    },
    en: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
        pagar: string
    },
    pt: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
        pagar: string
    },
    fr: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
        pagar: string
    },
}

export type { Lang, configurationType, translationType };