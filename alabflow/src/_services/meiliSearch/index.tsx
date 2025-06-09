import {MeiliSearch} from "meilisearch";

export class MeiliSearchApi {
    private client: MeiliSearch;

    constructor() {
        this.client = new MeiliSearch({
            host: 'http://11.1.1.72:7701',
            apiKey: 'ISFxY7Nw8c89329aadfa3b703ea793773842d80d0afe5571c12df7591099f4f6270fed64'
        })
    }

    async search(index: string, q: string, filter: string) {
        try {
            return await this.client.index(index).search(q, {filter: filter})
        } catch (error) {
            // @ts-ignore
            console.error('Error MeiliSearch [search]:', error.message);
            throw error;
        }
    }
}
