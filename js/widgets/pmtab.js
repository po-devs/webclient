(function () {
    function PMTab(pid) {
        $.observable(this);
        var name = webclient.players.name(pid);

        this.shortHand = "pm";
        this.id = pid;
        this.disconnected = false;

        webclient.players.addFriend(pid);

        if ($("#pm-" + pid).length === 0) {
            /* Create new tab */
            $('#channel-tabs').tabs("add", "#pm-" + pid, (name === "???" ? "Player " + pid : name) + '<i class="icon-remove-circle"></i>');

            this.chat = new webclient.classes.Chat('send-pm-' + pid);
            this.chat.appendTo($("#pm-" + pid));
            switchToTab("#pm-"+pid);
        }
    }

    utils.inherits(PMTab, webclient.classes.ChannelTab);

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

    pmtab.print = function(pid, msg) {
        if (pid !== -1) {
            msg = utils.escapeHtml(msg);
            var pref = "<span class='player-message' style='color: " + webclient.players.color(pid) + "'>" + webclient.players.name(pid) + ":</span>";
            msg = pref + " " + utils.addChannelLinks(msg, channels.channelsByName(true));

            this.activateTab();
        }

        this.chat.insertMessage(msg);
    };

    pmtab.close = function () {
        this.trigger("close");
        $('#channel-tabs').tabs("remove", "#pm-" + this.id);
    };

    webclient.classes.PMTab = PMTab;
}());
