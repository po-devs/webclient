function Channels () {
    this.channels = {"0": new Channel(0, "Main channel")};
}

Channels.prototype.channel = function (id) {
    if (! (id in this.channels)) {
        this.channels[id] = new Channel(id);
    }

    return this.channels[id];
}

Channels.prototype.current = function() {
    var index = $("#channel-tabs").tabs("option", "active");
    return this.channel(this.idFromIndex(index));
}

Channels.prototype.idFromIndex = function(index) {
    var queryIndex = index+1;
    var hrefid = $("#channel-tabs > ul li:nth-child( " + queryIndex + ") a").attr("href");
    return hrefid.substr(hrefid.indexOf("-")+1);
}

function Channel(id, name) {
    this.id = id;
    this.name = name;

    this.chatCount = 0;

    if ($("#channel-"+id).length === 0) {
        /* Create new tab */
        $('#channel-tabs').tabs("add", "#channel-"+id, name || ("channel " + id));
        $("#channel-"+id).html('<div id="chatTextArea" class="textbox"></div>');
    }
}

Channel.prototype.chat = function() {
    return $("#channel-"+this.id + " #chatTextArea");
}

Channel.prototype.print = function (message) {
    var chatTextArea = this.chat().get(0);

    chatTextArea.innerHTML += message + "<br/>\n";
    /* Limit number of lines */
    if (this.chatCount++ % 500 === 0) {
        chatTextArea.innerHTML = chatTextArea.innerHTML.split("\n").slice(-500).join("\n");
    }
    chatTextArea.scrollTop = chatTextArea.scrollHeight;
}
