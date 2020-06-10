/**
 * Event Handler - Handling event and communication between controller and view (Binding events)
 * This class is used to be abstract should be only extended and never create instance.
 */

export default class EventHandler {
    constructor() {
        // Callbacks storage (private)
        this._events = {};
    }

    /**
     * Listener on function Call
     * @param {*} event - Event Id
     * @param {*} listener - Function called when event occurs
     */
    on(event, listener) {
        (this._events[event] || (this._events[event] = [])).push(listener);
        return this;
    }

    /**
     * Handle function will emit onEvent
     * @param {*} event - Event which will occur
     * @param {*} args - Arguments passed to listener (Using spread operator) - For multiple args use square bracket  [parm, parm.. ]
     */ 
    handle(event, args) {
      (this._events[event] || []).slice().forEach(handle => handle(...args));
    }
}