function Channels() {
    this.channels = {"0": new Channel(0, "Main channel")};
    this.names = {};
}

Channels.prototype.channel = function (id) {
    if (!(id in this.channels)) {
        this.channels[id] = new Channel(id, this.names[id]);
    }

    return this.channels[id];
}

Channels.prototype.setNames = function (names) {
    this.names = names;

    /* Updating already existing channels if needed */
    for (var i in this.channels) {
        if ((i in names) && this.channel(i).name !== names[i]) {
            this.channel(i).changeName(names[i]);
        }
    }
}

Channels.prototype.changeChannelName = function (id, name) {
    this.names[id] = name;
    if (id in this.channels) {
        this.channels[id].changeName(name);
    }
}

Channels.prototype.newChannel = function (id, name) {
    this.names[id] = name;
}

Channels.prototype.removeChannel = function (id) {
    if (id in this.channels) {
        this.channels[id].close();
        delete this.channels[id];
    }

    delete this.names[id];
}

Channels.prototype.current = function () {
    var index = $("#channel-tabs").tabs("option", "active");
    return this.channel(this.idFromIndex(index));
}

Channels.prototype.idFromIndex = function (index) {
    var queryIndex = index + 1;
    var hrefid = $("#channel-tabs > ul li:nth-child( " + queryIndex + ") a").attr("href");
    return hrefid.substr(hrefid.indexOf("-") + 1);
}

function Channel(id, name) {
    this.id = id;
    this.name = name;

    this.chatCount = 0;

    if ($("#channel-" + id).length === 0) {
        /* Create new tab */
        $('#channel-tabs').tabs("add", "#channel-" + id, name || ("channel " + id));
        $("#channel-" + id).html('<div id="chatTextArea" class="textbox"></div>');
    }
}

Channel.prototype.chat = function () {
    return $("#channel-" + this.id + " #chatTextArea");
}

Channel.prototype.print = function (msg, html, noParse) {
    var chatTextArea = this.chat().get(0);

    if (!noParse) {
        if (html) {
            msg = format(msg) || msg;
        } else {
            var action = false;
            msg = escapeHtml(msg);

            if (msg.substr(0, 3) === "***") {
                msg = "<span class='action'>" + msg + "</span>";
                action = true;
            }

            if (msg.indexOf(":") !== -1 && !action) {
                var pref = msg.substr(0, msg.indexOf(":"));
                var id = players.id(pref);

                if (pref === "~~Server~~") {
                    pref = "<span class='server-message'>" + pref + ":</span>";
                } else if (pref === "Welcome Message") {
                    pref = "<span class='welcome-message'>" + pref + ":</span>";
                } else if (id === -1) {
                    alert("pref: " + pref);
                    pref = "<span class='script-message'>" + pref + ":</span>";
                } else {
                    pref = "<span class='player-message' style='color: " + players.color(id) + "'>" + pref + ":</span>";
                }

                msg = pref + msg.slice(msg.indexOf(":") + 1);
            }
        }
    }

    chatTextArea.innerHTML += msg + "<br/>\n";

    /* Limit number of lines */
    if (this.chatCount++ % 500 === 0) {
        chatTextArea.innerHTML = chatTextArea.innerHTML.split("\n").slice(-500).join("\n");
    }
    chatTextArea.scrollTop = chatTextArea.scrollHeight;
}

Channel.prototype.changeName = function (name) {
    this.name = name;
    $("#channel-tabs > ul a[href=\"#channel-" + this.id + "\"]").html(name);
}

Channel.prototype.close = function () {
    $('#channel-tabs').tabs("remove", "#channel-" + this.id);
}
