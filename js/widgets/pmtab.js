(function (webclient) {
    function PMTab(pid) {
        $.observable(this);
        var name = webclient.players.name(pid);

        this.shortHand = "pm";
        this.id = pid;
        this.disconnected = false;

        webclient.players.addFriend(pid);

        if ($("#pm-" + pid).length === 0) {
            /* Create new tab */
            $('#channel-tabs').tabs("add", "#pm-" + pid, (name === "???" ? "Player " + pid : name) + '<i class="fa fa-times-circle"></i>');

            this.chat = new webclient.classes.Chat('send-pm-' + pid);
            this.chat.appendTo($("#pm-" + pid));
            webclient.switchToTab("#pm-"+pid);
        }
    }

    utils.inherits(PMTab, webclient.classes.BaseTab);

    var pmtab = PMTab.prototype;
    pmtab.playerIds = function () {
        var ret = [webclient.ownId];
        if (!this.disconnected) {
            ret.push(this.id);
        }

        return ret;
    };

    pmtab.disconnect = function () {
        if (this.disconnected) {
            return;
        }

        this.print(-1, "<i>" + webclient.players.name(this.id) + " is no longer connected.</i>");
        this.disconnected = true;
    };

    pmtab.reconnect = function () {
        if (!this.disconnected) {
            return;
        }

        webclient.players.addFriend(this.id);
        this.print(-1, "<i>" + webclient.players.name(this.id) + " came back.</i>");
        this.disconnected = false;
    };

    pmtab.print = function (id, msg) {
        var raw = id === -1,
            auth, pref;

        if (!raw) {
            auth = webclient.players.auth(id);

            msg = utils.escapeHtml(msg);
            msg = "<span class='player-message' style='color: " + webclient.players.color(id) + "'>" + utils.rank(auth) + utils.rankStyle(webclient.players.name(id) + ":", auth) + "</span>"
                + " " + utils.addChannelLinks(msg, webclient.channels.channelsByName(true));

            this.activateTab();
        }

        this.chat.insertMessage(msg, {
            timestamps: true,
            // TODO: pm.timestamps
            timestampCheck: 'chat.timestamps',
            html: raw,
            linebreak: true
         });
    };

    pmtab.sendMessage = function (message) {
        var lines = message.trim().split('\n'),
            line, len, i;

        for (i = 0, len = lines.length; i < len; i += 1) {
            line = lines[i];

            this.print(webclient.ownId, line);
            network.command('pm', {to: this.id, message: line});
        }
    }

    pmtab.close = function () {
        this.trigger("close");
        $('#channel-tabs').tabs("remove", "#pm-" + this.id);
    };

    webclient.classes.PMTab = PMTab;
}(webclient));
