$(function () {
    var maxHistSize = 100;
    $(document).on("keydown", "[history]", function (event) {
        var elem = event.currentTarget;

        elem.hist = elem.hist || [];
        elem.histIndex = elem.histIndex || 0;
        if (event.which == 38) { // Up
            if (elem.histIndex == elem.hist.length && elem.value.match(/\S/)) {
                elem.hist.push(elem.value);
                if (elem.hist.length > maxHistSize) {
                    elem.hist.shift();
                }
            }
            if (elem.histIndex > 0) {
                elem.value = elem.hist[--elem.histIndex];
            }
        } else if (event.which == 40) { // Down
            if (elem.histIndex < elem.hist.length) {
                elem.value = elem.hist[++elem.histIndex] || "";
            }
        } else if (event.which == 13) { // Return
            elem.hist.push(elem.value);
            if (elem.hist.length > maxHistSize) {
                elem.hist.shift();
            }
            elem.histIndex = elem.hist.length;
            elem.value = "";
        }
    });
});

(function () {
    var template = '<div class="chatTextArea textbox"></div>'
        + '<div class="send_chat_message">'
        + '<p>'
        + '<input class="chatTextInput" id="{id}" placeholder="Start typing your message here..." history>'
        + '<i class="fa fa-arrow-circle-o-right fa-2x"></i>'
        + '</p>'
        + '</div>';
    // At least Chrome (I assume other browsers do the same) expand <timestamp/> to <timestamp><timestamp/> (as it is an unknown element).
    var timestampRegex = /<timestamp *\/ *>|<timestamp><\/timestamp>/gi;

    // TODO: A single chat for all the channels.
    function Chat(id) {
        this.id = id;

        this.element = $('<div>').html($.render(template, {id: id}));
        this.input = this.element.find(".chatTextInput");
        this.input.keydown(utils.onEnterPressed(function () {
            webclient.sendMessage($(this).val(), id);
        }));

        this.chatTextArea = this.element.find(".chatTextArea");
        this.chatCount = 0;
    }

    Chat.prototype.insertMessage = function (msg, opts) {
        var chatTextArea = this.chatTextArea,
            cta = chatTextArea[0],
            scrollDown = cta.scrollTop >= cta.scrollHeight - cta.offsetHeight,
            timestampPart;

        opts = opts || {};

        if (opts.timestamps) {
            timestampPart = "<span class='timestamp-enabled" + (poStorage(opts.timestampCheck, 'boolean') ? ' timestamp' : '') + "'>" + utils.timestamp() + "</span>";
            if (opts.html) {
                msg = msg.replace(timestampRegex, timestampPart);
            } else if (msg) {
                msg += timestampPart;
            }
        }

        if (opts.linebreak !== false) {
            msg += "<br/>";
        }

        chatTextArea.append("<div class='chat-line'>" + msg + "</div>");

        /* Limit number of lines */
        if (this.chatCount++ % 500 === 0) {
            chatTextArea.html(chatTextArea.find(".chat-line").slice(-500));
        }

        if (scrollDown) {
            chatTextArea.animate({scrollTop: cta.scrollHeight}, "fast");
        }
    };

    Chat.prototype.appendTo = function (element) {
        this.element.appendTo(element);
    };

    webclient.classes.Chat = Chat;
}());
