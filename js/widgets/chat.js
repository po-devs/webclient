$(function () {
    var maxHistSize = 100;
    $(document).on("keydown", "input[history=true],textarea[history=true]", function (event) {
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
        + '<input name="message" type="text" history="true" id="{inputid}" placeholder="Start typing your message here..." />'
        + '<i class="fa fa-arrow-circle-o-right fa-2x"></i>'
        + '</p>'
        + '</div>';

    // TODO: A single chat for all the channels.
    function Chat(inputid) {
        this.element = $('<div>').html($.render(template, {inputid: inputid}));
        this.element.find("input").keydown(utils.onEnterPressed(function () {
            sendMessage(this);
        }));

        this.chatTextArea = this.element.find(".chatTextArea");
        this.chatCount = 0;
    }

    Chat.prototype.insertMessage = function (msg, linebreak) {
        var chatTextArea = this.chatTextArea,
            cta = chatTextArea[0],
            scrollDown = cta.scrollTop >= cta.scrollHeight - cta.offsetHeight;

        chatTextArea.append("<div class='chat-line'>" + msg + (linebreak !== false ? "<br/>" : "") + "</div>");

        /* Limit number of lines */
        if (this.chatCount++ % 500 === 0) {
            chatTextArea.html(chatTextArea.find(".chat-line").slice(-500));
        }

        if (scrollDown) {
            $(chatTextArea).animate({scrollTop: cta.scrollHeight}, "fast");
        }
    };

    Chat.prototype.appendTo = function (element) {
        this.element.appendTo(element);
    };

    webclient.classes.Chat = Chat;
}());
