

import { AxiosInstance } from "axios";

// Typ pomocniczy
export type DictionaryMap = Record<number, string>;

export async function fetchLaboratoriesMap(flowAPI: any): Promise<DictionaryMap> {
    try {
        if (!flowAPI?.getDictionaryByName) return {};
        const resp = await flowAPI.getDictionaryByName("laboratories");
        if (!resp || !resp.data) return {}; // ← to zabezpiecza!
        const map: DictionaryMap = {};
        resp.data.forEach((item: any) => {
            map[item.id] = `[${item.symbol}], ${item.name}, MPK-${item.mpk}`;
        });
        return map;
    } catch (e) {
        console.error("Błąd fetchLaboratoriesMap:", e);
        return {};
    }
}



export async function fetchPrincipalsMap(flowAPI: any): Promise<DictionaryMap> {
    try {
        if (!flowAPI?.getDictionaryByName) return {};
        const resp = await flowAPI.getDictionaryByName("principals");

        // Ochrona przed undefined/null/błędem odpowiedzi
        if (!resp || !Array.isArray(resp.data)) return {};

        const map: DictionaryMap = {};
        resp.data.forEach((item: any) => {
            map[item.id] = `[${item.label}], ${item.name}`;
        });
        return map;
    } catch (err) {
        console.error("fetchPrincipalsMap error:", err);
        return {};
    }
}

