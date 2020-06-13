import EventHandler from "./eventHandler.js";

export default class View extends EventHandler {
    constructor() {
        super();
        /** Loading State boolean - true if waiting for response */
        this.loadingState = false;

        /** Create VueJS Application */
        this.app = new Vue({
            el: "#app",
            data: {
                products: [], /** Pass array by reference to the vueApp  - pre lepšiu čitatelnosť */
                rates: [], /** Pass array by reference to the vueApp */
                count: 0
            },
            methods: {
                validateQuantity: (event, quantity) => this.validateQuantity(event.target, quantity), /** @KeyUP event - Validate if quantity is not passed */

                getRates: (productId) => this.getRates(productId), /** returns  array of rates based on productId */
                getRatesLength: (productId) => this.getRatesLength(productId), /** returns length of rates based on ProductId  */
                getCurrencySymbol: (currencyCode) => this.getCurrencySymbol(currencyCode), /** returns CurrencyCode conversed to currencySymbol Eur -> € USD -> $ */
                
                /** Handlers */
                setColor: (productId, color) => this.bindSetColor(productId, color), /** @onClick - Change the picked color and store in localStorage  */
                addRate: (productId, rate) => this.bindAddRate(productId, rate), /** @onClick - addRate - Send to API Storage updated rate and update the value  */

                /** Color params */
                getColorClassList: (productId, color) => { /** returns full className based on ColorStyle conversion and if ColorIsActive (maybe use classList.add) */
                    return `${this.getColorStyle(color)} ${(this.isColorToggled(productId, color) ? "active" : "")}`;
                },

                /** Stars */
                getAvgRate: (productId) => this.getAvgRate(productId), /** returns average value of all rates per product (2 digits after dot) */
            }
        });
    }

    /**
     * returns boolean based on validate result and change borderColor of input
     * @param {*} element - HTMLElement (Given from VueJS methods - event.target)
     * @param {*} quantity - Maximum number (Stocks)
     */
    validateQuantity(element, quantity) {
        if (element.value > quantity || isNaN(element.valueAsNumber)) {
            element.style.borderColor = "red";
            return false;
        }
        element.style.borderColor = "blue";
        return true;
    }

    /**
     * return currency symbol based on currencyCode
     * @param {*} currencyCode - CurrencyCode given from API
     */
    getCurrencySymbol(currencyCode) {
        switch (currencyCode) {
            case "EUR": return "€";
            case "USD": return "$";
            default: return "€";
        }
    }

    /**
     * updateColor for specific product
     * @param {*} productId - Id of product (ProductId)
     * @param {*} color - Color Name
     */
    updateColor(productId, color) {
        const product = this.getProductById(productId);

        if (!product)
            throw new Error("View:updateColor - Product is invalid");

        product.focusColor = color;
    }

    /**
     * return boolean - Check if color is active for specific product 
     * @param {*} productId - Id of product (ProductId)
     * @param {*} color - Color Name
     */
    isColorToggled(productId, color) {
        const product = this.getProductById(productId);

        if (!product)
            throw new Error("View:isColorActive - Product is invalid");

        return product.focusColor == color ? true : false 
    }

    /**
     * this is tricky function (Only for conversion coz we use english colors in style )
     * @param {*} color - Color properity
     */
    getColorStyle(color) {
        switch (color) {
            case "čierna": return "black";
            case "biela": return "white";
            case "červená": return "red";
            case "modrá": return "blue";
            case "žltá": return "yellow";
            case "fialová": return "purple";
            default: return "";
        }
    }

    /**
     * returns product object
     * @param {*} productId - Id of product (ProductId)
     */
    getProductById(productId) {
        return this.app.products.find(item => item.ProductId == productId);
    }

    /**
     * Returns single object (ProductId, Rates: Array[])
     * @param {*} productId - Id of product (ProductId)
     */
    getRatesByProductId(productId) {
        return this.app.rates.find(item => item.ProductId == productId);
    }

    /**
     * get Length of all rates for specific product
     * @param {*} productId - Id of product (ProductId)
     */
    getRatesLength(productId) {
        // Check for empty data - Return 0 then
        if (!this.app || !this.app.rates.length === 0)
            return 0;

        let rates = this.getRatesByProductId(productId);
        return rates && rates.Rates.length ? rates.Rates.length : 0;
    }

    /**
     * returns Average value of Rates for product
     * @param {*} productId - Id of product (ProductId)
     */
    getAvgRate(productId) {
        if (!this.app || !this.app.rates.length === 0)  return 0;

        let rates = this.getRatesByProductId(productId);

        if (!rates || rates.Rates.length === 0) return 0;

        let average = rates.Rates.reduce((sum, current) => sum + current, 0) / rates.Rates.length;
        return average.toFixed(2);
    }

    /**
     * push all products into vueApp products, which are rendered on the screen
     * @param {*} products - Object taken from storageAPI
     */
    displayItem(product) {
        // bind VueJS to products
        this.app.products.push(product);
        // bind Count to vueJs products
        this.app.count = this.app.products.length;
    }

    /**
     * push all rates into vueApp rates, which are rendered on the screen
     * @param {*} rates - Array of object [(ProductId and Rates: Array[])]
     */
    initRates(rates) {
        this.app.rates.push(rates);
    }

    /**
     * 
     * @param {*} productId - Id of product (ProductId)
     * @param {*} rate - Number rate [1 - 5]
     */
    addRate(productId, rate) {
        this.app.rates.forEach((item) => {
            if (item.ProductId == productId)
                item.Rates.push(rate);
        });
    }

    /*** Handlers */

    /**
     * Emit event (Invoke function binded to the event) which is binded with model to store picked color in LocalStorage and update view
     * @param {*} productId - Id of product (ProductId)
     * @param {*} color - Color
     */
    bindSetColor(productId, color) {
        this.handle("bindSetColor", [productId, color]);
    }

    /**
     * Emit event (Invoke function binded to the event) which is binded with model to store picked color in LocalStorage and update view
     * @param {*} productId - Id of product (ProductId)
     * @param {*} rate - Rate [ 1 - 5]
     */
    bindAddRate(productId, rate,) {
        if (this.loadingState)
            return; // Do not add rate until request is done

        // Check if rate is not out of bound
        if (rate > 5) rate = 5;
        if (rate < 1) rate = 1;

        this.handle("bindAddRate", [productId, rate]);
        this.setLoadingState(true);
    }
    
    /**
     * Set Loading state - update mouse cursor to loading and prevent bindAddRate to be invoked
     * Loading state ends when bindAddRate -> Fetch response
     * @param {*} state  - Boolean state
     */
    setLoadingState(state)
    {
        this.loadingState = state;
        // Body Element
        const body = document.body;

        if (state)
            body.classList.add('waiting');
        else
            body.classList.remove('waiting');
    }
}