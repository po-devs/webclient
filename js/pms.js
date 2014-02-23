function PMs() {
    $.observable(this);
    this.pms = {};
}

PMs.prototype.pm = function(pid) {
    if (pid in this.pms) {
        return this.pms[pid];
    }
    if (webclient.players.isIgnored(pid))
        return;
    new PM(pid);
    return this.pms[pid];
};

PMs.prototype.playerLogout = function (pid) {
    if (pid in this.pms) {
        this.pm(pid).disconnect();
    }
};

/* In case of reconnect */
PMs.prototype.playerLogin = function(pid) {
    if (pid in this.pms) {
        this.pm(pid).reconnect();
    }
};

function PM(pid) {
    this.shortHand = "pm";
    this.id = pid;
    this.disconnected = false;
    webclient.players.addFriend(pid);

    var name = webclient.players.name(pid);

    if ($("#pm-" + pid).length === 0) {
        /* Create new tab */
        $('#channel-tabs').tabs("add", "#pm-" + pid, (name === "???" ? "Player " + pid : name)+'<i class="icon-remove-circle"></i>');

        this.chat = new webclient.classes.Chat('send-pm-' + pid);
        this.chat.appendTo($("#pm-" + pid));

        pms.pms[pid] = this;
        switchToTab("#pm-"+pid);
    }
}

utils.inherits(PM, ChannelTab);

PM.prototype.playerIds = function() {
    var ret = [webclient.ownId];
    if (!this.disconnected) {
        ret.push(this.id);
    }
    return ret;
};

PM.prototype.disconnect = function() {
    if (this.disconnected) {
        return;
    }

    this.print(-1, "<i>" + webclient.players.name(this.id) + " is no longer connected.</i>");
    this.disconnected = true;
};

PM.prototype.reconnect = function() {
    if (!this.disconnected) {
        return;
    }

    webclient.players.addFriend(this.id);
    this.print(-1, "<i>" + webclient.players.name(this.id) + " came back.</i>");
    this.disconnected = false;
};

PM.prototype.print = function(pid, msg) {
    if (pid !== -1) {
        msg = utils.escapeHtml(msg);
        var pref = "<span class='player-message' style='color: " + webclient.players.color(pid) + "'>" + webclient.players.name(pid) + ":</span>";
        msg = pref + " " + utils.addChannelLinks(msg, channels.channelsByName(true));

        this.activateTab();
    }

    this.chat.insertMessage(msg);
};

PM.prototype.close = function() {
    $('#channel-tabs').tabs("remove", "#pm-" + this.id);
    delete pms.pms[this.id];
};
