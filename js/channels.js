function Channels() {
    this.channels = {"0": new Channel(0, "Console", true)};
    this.names = {};

    this.joiningChannel = false;
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

Channels.prototype.leaveChannel = function (id) {
    if (id in this.channels && Object.keys(this.channels).length !== 1) { // The player must have a channel open at all times.
        if (websocket) {
            websocket.send("leave|" + id);
        }

        this.channels[id].close();
        delete this.channels[id];
    }
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

function Channel(id, name, initialChannel) {
    this.id = id;
    this.name = name;
    this.players = {};

    this.chatCount = 0;

    if (initialChannel === true) {
        this.close();
    }

    if ($("#channel-" + id).length === 0) {
        /* Create new tab */
        $('#channel-tabs').tabs("add", "#channel-" + id, name || ("channel " + id));
        /* Cleaner solution would be appreciated */
        $("#channel-" + id).html('<div id="chatTextArea" class="textbox"></div>'
            +'<p><input type="text" id="send-channel-'+id+'" cols="40" onkeydown="if(event.keyCode==13)sendMessage(this);" placeholder="Type your message here..."/>'
            +' <button onClick="sendMessage(document.getElementById(\'send-channel-'+id+'\'));">Send</button>'
            +' <button onClick="channels.leaveChannel(' + id + ');">Leave Channel</button></p>');
    }
}

Channel.prototype.setPlayers = function(players) {
    this.players = {};
    for (var i = 0; i < players.length; i++) {
        this.players[i] = true;
    }
}

Channel.prototype.newPlayer = function(player) {
    this.players[player] = true;
}

Channel.prototype.removePlayer = function(player) {
    delete this.players[player];
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

    var pl = this.players;
    this.players = {};

    for (var x in pl) {
        players.testPlayerOnline(x);
    }
}
