export default class Controller {
    constructor(model, view) {
        /** View module */
        this.view = view;
        /** Model module */
        this.model = model;

        // Load Initial Data
        this.init();

        // Bind Listeners
        this.view.on('bindSetColor', (productId, color) => this.handleSetColor(productId, color));
        this.view.on('bindAddRate', (productId, rate) => this.handleAddRate(productId, rate));
    }

    /**
     * Load initial data using ES7 -> Async/Await
     */
    async init()
    {
        /** Data taken from Storage API */
        this.model.products = await this.model.fetchProducts(); // Fetch return promise - async code, use .then() for alternate
        this.showProducts(this.model.products);

        /** Data taken from Storage API */
        this.model.rates = await this.model.fetchRates(); // Fetch return promise await for result
        this.showRates(this.model.rates);
    }

    /**
     * set Product data to view 
     * @param {*} product - Array of all products
     */
    showProducts(products) {
        // v prípade ak by sa žiadné udaje nenachadzali v JSON 
        if (!products || products.length === 0)
            return;

        // Loop throu every product
        products.forEach((item) => {
            // Check if color is stored in LocalStorage
            const color = this.model.getStoredItem(item.ProductId);

            if (color)
                item.focusColor = color;
            else {
                // If color is not stored in LocalStorage, select the first color in array
                const firstColor = item.params[item.params.indexOf("Color") + 1]
                item.focusColor = firstColor ? firstColor[0] : ""; // in Case if there is missing Color param
            }

            // send data to View and vueJs
            this.view.displayItem(item);
        });
    }

    /**
     * bind Rates from fetchApi to view and vueJs
     * @param {*} rates - Array of all Rates Array[{ProductId and Rates: Array[]}]
     */
    showRates(rates) {
        // v prípade ak by sa žiadné udaje nenachadzali v JSON 
        if (!rates || rates.length === 0)
            return;

        rates.forEach((item) => {
            // Push every item from Rates array
            this.view.initRates(item);
        });
    }

    /*** Handlers  ***/

    /**
     * Sending data to model - Set the color for specific product and save to LocalStorage
     * @param {*} productId - Id of product (ProductId)
     * @param {*} color - Color
     */
    handleSetColor(productId, color) {
        this.model.storeItem(productId, color);

        // Invoke updateColor for view
        this.view.updateColor(productId, color);
    }

    /**
     * Async - using Promises - Invoked when clicking at stars send request to model to add rate (Update external storage with FetchAPI)
     * @param {*} productId - Id of product (ProductId)
     * @param {*} rate - Number Rate [1 - 5]
     */
    async handleAddRate(productId, rate) {
        let response = await this.model.updateRate(productId, rate); // await for response

        // if Response.ok == true (data was updated) update rates also for view and VUejS
        if (response)
            this.view.addRate(productId, rate);

        this.view.setLoadingState(false); // Remove loading state 
    }
}

