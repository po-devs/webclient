function PMs() {
    this.pms = {}
}

PMs.prototype.pm = function(pid) {
    if (pid in this.pms) {
        return this.pms[pid];
    }
    this.pms[pid] = new PM(pid);
    return this.pms[pid];
}

function PM(pid) {
    this.id = pid;
    players.addFriend(pid);

    var name = players.name(pid);

    if ($("#pm-" + pid).length === 0) {
        /* Create new tab */
        $('#channel-tabs').tabs("add", "#pm-" + pid, name === "???" ? "Player " + pid : name);
        /* Cleaner solution would be appreciated */
        $("#pm-" + pid).html('<div id="chatTextArea" class="textbox"></div>'
                                      +'<p><input type="text" id="send-pm-'+pid+'" cols="40" onkeydown="if(event.keyCode==13)sendMessage(this);" placeholder="Type your message here..."/>'
                                      +' <button onClick="sendMessage(document.getElementById(\'send-pm-'+pid+'\'));">Send</button>'
                                      +' <button onClick="pms.pm(' + pid + ').close();">Close</button></p>');
        $('#channel-tabs').tabs("select", "#pm-"+pid);
    }
}

PM.prototype.chat = function () {
    return $("#pm-" + this.id + " #chatTextArea");
}


PM.prototype.print = function(pid, msg) {
    var chatTextArea = this.chat().get(0);

    msg = escapeHtml(msg);
    var pref = "<span class='player-message' style='color: " + players.color(pid) + "'>" + players.name(pid) + ":</span>";
    msg = pref + " " + addChannelLinks(msg);

    chatTextArea.innerHTML += msg + "<br/>\n";

    /* Limit number of lines */
    if (this.chatCount++ % 500 === 0) {
        chatTextArea.innerHTML = chatTextArea.innerHTML.split("\n").slice(-500).join("\n");
    }
    chatTextArea.scrollTop = chatTextArea.scrollHeight;
}

PM.prototype.close = function() {
    $('#channel-tabs').tabs("remove", "#pm-" + this.id);
}
