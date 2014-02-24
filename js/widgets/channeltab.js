(function () {
    function ChannelTab(id, name) {
        $.observable(this);
        this.shortHand = "channel";
        this.id = id;
        this.name = name;
        this.players = {};

        /* We can close a channel tab only if the client decided to close the channel,
          and the server kicked us out of the channel / destroyed the channel.

          We keep track with this variable. */
        this.closable = 0; //1 = Server close, 2=Player close

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

    utils.inherits(ChannelTab, webclient.classes.BaseTab);

    var channeltab = ChannelTab.prototype;

    channeltab.close = function() {
        this.trigger("close");
    };

    channeltab.setPlayers = function(players) {
        var len, id, i;

        /* The server 'unclosed' us, so removing server close if there */
        this.closable &= ~1;

        this.players = {};

        for (i = 0, len = players.length; i < len; i += 1) {
            id = players[i];
            this.players[id] = true;
        }

        this.trigger("setplayers");
    };

    channeltab.newPlayer = function(player) {
        this.players[player] = true;
        this.trigger("playeradd", player);
    };

    channeltab.removePlayer = function(player) {
        this.trigger("playerremove", player);
        delete this.players[player];

        if (player === webclient.ownId) {
            if (this.closable & 2) {
                this.remove();
            } else {
                this.closable |= 1;
                this.print("<i>You were removed from this channel</i>", true);
            }
        }
    };

    channeltab.hasPlayer = function(player) {
        return player in this.players;
    };

    channeltab.print = function (msg, html, noParse) {
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

                    msg = pref + utils.addChannelLinks(msg.slice(msg.indexOf(":") + 1), webclient.channels.channelsByName(true));
                    // TODO: Add by default, use a toggle css rule somewhere
                    if (poStorage("chat.timestamps", "boolean")) {
                        msg += "<span class='timestamp'>" + utils.timestamp() + "</span>";
                    }
                }
            }
        }

        this.chat.insertMessage(msg);
    };

    channeltab.changeName = function (name) {
        this.name = name;

        $("#channel-tabs > ul a[href=\"#channel-" + this.id + "\"]").html("<span>" + name + '<i class="fa fa-times-circle"></i></span>');
    };

    channeltab.disconnect = function() {
        var id;

        this.players = {};

        for (id in this.players) {
            webclient.players.testPlayerOnline(id);
        }
    };

    channeltab.remove = function () {
        this.trigger("remove");
    };

    channeltab.playerIds = function() {
        return Object.keys(this.players);
    };

    webclient.classes.ChannelTab = ChannelTab;
}());
