function Channels() {
    this.channels = {"0": new Channel(0, "Main channel")};
    this.names = {};
}

Channels.prototype.channel = function (id) {
    if (id == -1) {
        return null;
    }

    if (!(id in this.channels)) {
        this.channels[id] = new Channel(id, this.names[id]);
    }

    return this.channels[id];
}

Channels.prototype.hasChannel = function(id) {
    return id in this.channels;
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

Channels.prototype.leaveChannel = function(chanid) {
    if (!this.hasChannel(chanid) || this.channel(chanid).closable & 1) {
        $('#channel-tabs').tabs("remove", "#channel-" + chanid);
    } else {
        this.channel(chanid).closable |= 2;
        websocket.send("leave|"+chanid);
    }
}

Channels.prototype.removeChannel = function (id) {
    if (id in this.channels) {
        if (this.channel(id).closable & 2) {
            this.channel(id).close();
        } else {
            this.channel(id).print("<i>This channel was destroyed.</i>", true);
            this.channel(id).disconnect();
            delete this.channels[id];
        }
    }

    delete this.names[id];
}

Channels.prototype.current = function () {
    return this.channel(this.currentId());
}

Channels.prototype.currentId = function() {
//    var index = $("#channel-tabs").tabs("option", "active");
//    return this.idFromIndex(index);
    return currentChannel;
}

Channels.prototype.idFromIndex = function (index) {
    var queryIndex = index + 1;
    var hrefid = $("#channel-tabs > ul li:nth-child( " + queryIndex + ") a").attr("href");

    if (!/^#channel-/.test(hrefid)) {
        return -1;
    }
    return hrefid.substr(hrefid.indexOf("-") + 1);
}

Channels.prototype.channelsByName = function () {
    var that = this;

    return Object.keys(this.names).map(function (value, index, array) {
        return that.names[value];
    })
}

function Channel(id, name) {
    this.id = id;
    this.name = name;
    this.players = {};
    /* We can close a channel tab only if the client decided to close the channel,
      and the server kicked us out of the channel / destroyed the channel.

      We keep track with this variable. */
    this.closable = 0; //1 = Server close, 2=Player close

    this.chatCount = 0;

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
    /* The server 'unclosed' us, so removing server close if there */
    this.closable &= ~1;

    this.players = {};
    players.forEach(function(id) {this.players[id] = true;}, this);

    if (channels.currentId() == this.id) {
        this.generatePlayerList();
    }
}

Channel.prototype.isCurrent = function() {
    return this.id == channels.currentId();
}

Channel.prototype.newPlayer = function(player) {
    this.players[player] = true;

    if (this.isCurrent()) {
        playerList.addPlayer(player);
    }
}

Channel.prototype.removePlayer = function(player) {
    delete this.players[player];

    if (this.isCurrent()) {
        playerList.removePlayer(player);
    }

    if (player == players.myid) {
        if (this.closable & 2) {
            this.close();
        } else {
            this.closable |= 1;
            this.print("<i>You were removed from this channel</i>", true)
        }
    }
}

Channel.prototype.hasPlayer = function(player) {
    return player in this.players;
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

                msg = pref + addChannelLinks(msg.slice(msg.indexOf(":") + 1));
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

Channel.prototype.disconnect = function() {
    var pl = this.players;
    this.players = {};
    for(var id in pl) {players.testPlayerOnline(id)};
}

Channel.prototype.close = function () {
    $('#channel-tabs').tabs("remove", "#channel-" + this.id);

    this.disconnect();
    delete channels.channels[this.id];
}

Channel.prototype.playerIds = function() {
    return Object.keys(this.players);
}

Channel.prototype.generatePlayerList = function() {
    playerList.setPlayers(this.playerIds());
}
