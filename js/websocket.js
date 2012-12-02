/* WebSocket wrapper - supports everything you'd expect, plus buffers! */

if (typeof MozWebSocket !== "undefined") {
    WebSocket = MozWebSocket;
}

/**
 * class POWebSocket
 *
 * private null _WebSocket [WebSocket]
 * private Array sendBuffer [Buffer for messages when there is no connection]
 * private Array eventBuffer [Buffer for when the WebSocket isn't initialized yet]
 * public Object states [Connection states]
 * public Boolean initialized [If the socket has been initialized]
 *
 * public readonly Function socket() [Returns private _WebSocket]
 * public Function state() [Returns the socket's state]
 * public Function disconnect() [Closes the socket]
 * public Function connected() [Returns if the socket is connected to a WS server]
 * public Function send(message) [Sends a message to the WS server or adds it to the buffer if there is no connection]
 * public Function on(eventName, eventHandler) [Listens to the eventName event or adds it to the buffer if the socket isn't initialized yet]
 * public Function connect(host) [Connects to the WS server, host]
 */
POWebSocket = (function () {
    // private
    var _WebSocket = null, // Web Socket
        sendBuffer = [], // Buffer for when there is no connection.
        eventBuffer = [];

    // public
    var states = {
            "connecting": 0,
            "connected": 1,
            "closing": 2,
            "closed": 3,
            "noconnection": 4
        }, // WebSocket states
        initialized = false; // Is the socket initialized?

    function socket() {
        return _WebSocket;
    }

    function state() {
        return initialized ? socket().readyState : states.noconnection;
    }

    function disconnect() {
        if (connected()) {
            socket().close();
        }

        return this;
    }

    function connected() {
        return state() === states.connected;
    }

    function send(message) {
        if (connected()) {
            socket().send(message);
        } else {
            sendBuffer.push(message);
        }

        return this;
    }

    function connect(host) {
        var x = 0,
            length = sendBuffer.length,
            i = 0,
            eventlen = eventBuffer.length,
            event;

        if (!initialized) {
            try {
                _WebSocket = new WebSocket(host);

                if (length !== 0) {
                    on("open", function () {
                        for (; x < length; x++) {
                            send(sendBuffer[x]);
                        }
                    });
                }

                if (eventlen !== 0) {
                    for (; i < eventlen; i++) {
                        event = eventBuffer[i];
                        on(event.event, event.handler);
                    }
                }

                initialized = true;
            } catch (e) {
                _WebSocket = null;
                initialized = false;

                console.log("Couldn't create WebSocket for host " + host + " (WebSocket exists: " + typeof WebSocket !== "undefined" + "): " + e);
            }
        }

        return this;
    }

    function on(event, handler) {
        if (initialized) {
            socket().addEventListener(event, handler);
        } else {
            eventBuffer.push({event: event, handler: handler});
        }

        return this;
    }

    return {
        states: states,
        initialized: initialized,
        connect: connect,
        state: state,
        socket: socket,
        disconnect: disconnect,
        connected: connected,
        send: send,
        on: on
    }
});