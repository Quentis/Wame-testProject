import EventHandler from "./eventHandler.js"

export default class Model extends EventHandler {
    constructor() {
        super(); // Inheirt Event handler constructor
        /** Array of Rates */
        this.rates = [];

        /** Array of Products */
        this.products = [];
    }

    /**
     * Requesting data from the external storage (fixed http address)
     */
    async fetchProducts(/*url*/) {
        // ES7 - Async/Await and FetchAPI requesting data from Storage (API) - we are requesting Products
        const response = await fetch("https://api.jsonbin.io/b/5edf862d1f9e4e57881a4db2/6", {
            method: "GET",
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                "secret-key": "$2b$10$ZieyyWLLe6rL9eXtFgI/6.cte.VSFvd6grMohe5MtAIgmahwc3TDC" // Secret key is required
            }
        });

        return response.json();
    }

    /**
     * Requesting data from the external storage (fixed http address)
     */
    async fetchRates(/*url*/) {
        // ES7 - Async/Await and FetchAPI requesting data from Storage (API) - we are requesting Rates
        const response = await fetch("https://api.jsonbin.io/b/5edfdde61f9e4e57881a7cbe/20", {
            method: "GET",
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                "secret-key": "$2b$10$ZieyyWLLe6rL9eXtFgI/6.cte.VSFvd6grMohe5MtAIgmahwc3TDC"
            }
        });

        return response.json();
    }

    /**
     * Send data to update to the storage (API) -> we are updating rates / adding new rate to the array for specific product
     * @param {*} productId - Id of product (ProductId)
     * @param {*} rate - Number Rate [1 - 5]
     */
    async updateRate(productId, rate) {
        // map old array of rates, with new value
        let data = this.rates.map(item => item.ProductId == productId ? { ProductId: item.ProductId, Rates: [...item.Rates, rate]} : item);

        // ES7 - Async/Await and FetchAPI requesting data from Storage (API) - we are updating data
        const response = await fetch("https://api.jsonbin.io/b/5edfdde61f9e4e57881a7cbe", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "secret-key": "$2b$10$ZieyyWLLe6rL9eXtFgI/6.cte.VSFvd6grMohe5MtAIgmahwc3TDC",
                "versioning": false
            },
            body: JSON.stringify(data) // sending updated array to the Storage (API)
        });

        // If Response is OK, update model.rates to fit the data / if update will fail, throw changes
        if (response.ok)
            this.rates = data;

        return response.ok;
    }
    /*** Local Storage ***/

    /**
     * returns data of stored item based on Id from localStorage
     * @param {*} id - Identifier of stored item
     */
    getStoredItem(id) {
        return localStorage.getItem(id);
    }

    /**
     * Store data and assign to the Id in localStorage
     * @param {*} id  - Identifier of item
     * @param {*} data - data
     */
    storeItem(id, data) {
        localStorage.setItem(id, data);
    }
}