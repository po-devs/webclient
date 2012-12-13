function PMs() {
    this.pms = {}
}

PMs.prototype.pm = function(pid) {
    if (pid in this.pms) {
        return this.pms[pid];
    }
    if (players.isIgnored(pid))
        return;
    new PM(pid);
    return this.pms[pid];
}

PMs.prototype.playerLogout = function (pid) {
    if (pid in this.pms) {
        this.pm(pid).disconnect();
    }
}

/* In case of reconnect */
PMs.prototype.playerLogin = function(pid) {
    if (pid in this.pms) {
        this.pm(pid).reconnect();
    }
}

function PM(pid) {
    this.shortHand = "pm";
    this.id = pid;
    this.disconnected = false;
    players.addFriend(pid);

    var name = players.name(pid);

    if ($("#pm-" + pid).length === 0) {
        /* Create new tab */
        $('#channel-tabs').tabs("add", "#pm-" + pid, name === "???" ? "Player " + pid : name);
        /* Cleaner solution would be appreciated */
        $("#pm-" + pid).html('<div id="chatTextArea" class="textbox"></div>'
                                      +'<p><input type="text" id="send-pm-'+pid+'" cols="40" history="true" onkeydown="if(event.keyCode==13)sendMessage(this);" placeholder="Type your message here..."/>'
                                      +' <button onClick="sendMessage(document.getElementById(\'send-pm-'+pid+'\'));">Send</button>'
                                      +' <button onClick="pms.pm(' + pid + ').close();">Close</button></p>');
        pms.pms[pid] = this;
        $('#channel-tabs').tabs("select", "#pm-"+pid);
    }
}

PM.inherits(ChannelTab);

PM.prototype.playerIds = function() {
    var ret = [players.myid];
    if (!this.disconnected) {
        ret.push(this.id);
    }
    return ret;
}

PM.prototype.disconnect = function() {
    if (this.disconnected) {
        return;
    }

    this.print(-1, "<i>"+players.name(this.id)+ " is no longer connected.</i>");
    this.disconnected = true;
}

PM.prototype.reconnect = function() {
    if (!this.disconnected) {
        return;
    }

    players.addFriend(this.id);
    this.print(-1, "<i>"+players.name(this.id)+ " came back.</i>");
    this.disconnected = false;
}

PM.prototype.chat = function () {
    return $("#pm-" + this.id + " #chatTextArea");
}


PM.prototype.print = function(pid, msg) {
    var chatTextArea = this.chat().get(0);

    if (pid !== -1) {
        msg = escapeHtml(msg);
        var pref = "<span class='player-message' style='color: " + players.color(pid) + "'>" + players.name(pid) + ":</span>";
        msg = pref + " " + addChannelLinks(msg);

        this.activateTab();
    }

    chatTextArea.innerHTML += msg + "<br/>\n";

    /* Limit number of lines */
    if (this.chatCount++ % 500 === 0) {
        chatTextArea.innerHTML = chatTextArea.innerHTML.split("\n").slice(-500).join("\n");
    }
    chatTextArea.scrollTop = chatTextArea.scrollHeight;
}

PM.prototype.close = function() {
    $('#channel-tabs').tabs("remove", "#pm-" + this.id);
    delete pms.pms[this.id];
}
