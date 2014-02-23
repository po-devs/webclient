function Channels() {
    $.observable(this);

    this.channels = {"0": new Channel(0, "Main channel")};
    this.names = {};
    webclient.channel = this.channels[0];
}

Channels.prototype.channel = function (id) {
    if (id == -1) {
        return null;
    }

    if (!(id in this.channels)) {
        this.channels[id] = new Channel(id, this.names[id]);

        /* Hack to detect when the first channel is opened */
        if (Object.keys(this.channels).length === 1) {
            webclient.channel = this.channels[id];
        }
    }

    return this.channels[id];
};

Channels.prototype.hasChannel = function(id) {
    return id in this.channels;
};

Channels.prototype.setNames = function (names) {
    this.names = names;

    /* Updating already existing channels if needed */
    for (var i in this.channels) {
        if ((i in names) && this.channel(i).name !== names[i]) {
            this.channel(i).changeName(names[i]);
        }
    }
};

Channels.prototype.changeChannelName = function (id, name) {
    this.names[id] = name;
    if (id in this.channels) {
        this.channels[id].changeName(name);
    }
};

Channels.prototype.newChannel = function (id, name) {
    this.names[id] = name;
};

Channels.prototype.removeChannel = function (id) {
    if (id in this.channels) {
        if (this.channel(id).closable & 2) {
            this.channel(id).close2();
        } else {
            this.channel(id).print("<i>This channel was destroyed.</i>", true);
            this.channel(id).disconnect();
            delete this.channels[id];
        }
    }

    delete this.names[id];
};

Channels.prototype.current = function () {
    return this.channel(this.currentId());
};

Channels.prototype.currentId = function() {
//    var index = $("#channel-tabs").tabs("option", "active");
//    return this.idFromIndex(index);
    return webclient.currentChannel();
};

Channels.prototype.idFromIndex = function (index) {
    var queryIndex = index + 1;
    var hrefid = $("#channel-tabs > ul li:nth-child( " + queryIndex + ") a").attr("href");

    if (!/^#channel-/.test(hrefid)) {
        return -1;
    }
    return hrefid.substr(hrefid.indexOf("-") + 1);
};

Channels.prototype.channelsByName = function (lowercase) {
    var that = this, name;

    return Object.keys(this.names).map(function (value) {
        name = that.names[value];
        return lowercase ? name.toLowerCase() : name;
    });
};

Channels.prototype.leaveChannel = function(chanid) {
    if (!this.hasChannel(chanid) || this.channel(chanid).closable & 1) {
        $('#channel-tabs').tabs("remove", "#channel-" + chanid);
    } else {
        this.channel(chanid).closable |= 2;
        network.command('leavechannel', {channel: chanid});
    }
};

function Channel(id, name) {
    this.shortHand = "channel";
    this.id = id;
    this.name = name;
    this.players = {};
    /* We can close a channel tab only if the client decided to close the channel,
      and the server kicked us out of the channel / destroyed the channel.

      We keep track with this variable. */
    this.closable = 0; //1 = Server close, 2=Player close

    this.chatCount = 0;

    var $chan = $("#channel-" + id);
    if ($chan.length === 0 || $chan.data('initialized') === false) {
        /* Create new tab */
        if ($chan.length === 0) {
            $('#channel-tabs').tabs("add", "#channel-" + id, (name || ("channel " + id)) + '<i class="fa fa-times-circle"></i>');
        }

        this.chat = new webclient.classes.Chat('send-channel-' + id);
        this.chat.appendTo($("#channel-" + id));
        $chan.data('initialized', true);
    }
}

utils.inherits(Channel, webclient.classes.ChannelTab);

Channel.prototype.close = function() {
    channels.leaveChannel(this.id);
};

Channel.prototype.setPlayers = function(players) {
    /* The server 'unclosed' us, so removing server close if there */
    this.closable &= ~1;

    this.players = {};
    players.forEach(function(id) {
        this.players[id] = true;
    }, this);

    if (channels.currentId() == this.id) {
        this.generatePlayerList();
    }
};

Channel.prototype.newPlayer = function(player) {
    this.players[player] = true;

    if (this.isCurrent()) {
        webclient.ui.playerList.addPlayer(player);
    }
};

Channel.prototype.removePlayer = function(player) {
    delete this.players[player];

    if (this.isCurrent()) {
        webclient.ui.playerList.removePlayer(player);
    }

    if (player == webclient.ownId) {
        if (this.closable & 2) {
            this.close2();
        } else {
            this.closable |= 1;
            this.print("<i>You were removed from this channel</i>", true);
        }
    }
};

Channel.prototype.hasPlayer = function(player) {
    return player in this.players;
};

Channel.prototype.print = function (msg, html, noParse) {
    if (!noParse) {
        if (html) {
            msg = convertPOLinks($("<div>").html(msg)).html();
        } else {
            var action = false;
            msg = utils.escapeHtml(msg);

            if (msg.substr(0, 3) === "***") {
                msg = "<span class='action'>" + msg + "</span>";
                action = true;
            }

            if (msg.indexOf(":") !== -1 && !action) {
                var pref = msg.substr(0, msg.indexOf(":"));
                var id = webclient.players.id(pref);
                var auth = webclient.players.auth(id);
                if (webclient.players.isIgnored(id))
                    return;

                if (pref === "~~Server~~") {
                    pref = "<span class='server-message'>" + pref + ":</span>";
                } else if (pref === "Welcome Message") {
                    pref = "<span class='welcome-message'>" + pref + ":</span>";
                } else if (id === -1) {
                    pref = "<span class='script-message'>" + pref + ":</span>";
                } else {
                    pref = "<span class='player-message' style='color: " + webclient.players.color(id) + "'>" + utils.rank(auth) + utils.rankStyle(pref + ":", auth) + "</span>";
                    this.activateTab();
                }

                msg = pref + utils.addChannelLinks(msg.slice(msg.indexOf(":") + 1), channels.channelsByName(true));
                if (poStorage("chat.timestamps", "boolean")) {
                    msg += "<span class='timestamp'>" + utils.timestamp() + "</span>";
                }
            }
        }
    }

    this.chat.insertMessage(msg);
};

Channel.prototype.changeName = function (name) {
    this.name = name;
    $("#channel-tabs > ul a[href=\"#channel-" + this.id + "\"]").html("<span>"+name+'<i class="fa fa-times-circle"></i></span>');
};

Channel.prototype.disconnect = function() {
    var pl = this.players, id;
    this.players = {};
    for (id in pl) {
        webclient.players.testPlayerOnline(id);
    }
};

Channel.prototype.close2 = function () {
    $('#channel-tabs').tabs("remove", "#channel-" + this.id);

    this.disconnect();
    delete channels.channels[this.id];
};

Channel.prototype.playerIds = function() {
    return Object.keys(this.players);
};

Channel.prototype.generatePlayerList = function() {
    webclient.ui.playerList.setPlayers(this.playerIds());
};
