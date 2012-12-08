function Battles() {
    this.battles = {}
}

Battles.prototype.battle = function(pid) {
    if (pid in this.battles) {
        return this.battles[pid];
    }

    console.log("no battle with id " + pid + " found, current ids: " + JSON.stringify(Object.keys(this.battles)));
}

Battles.prototype.watchBattle = function(bid, conf) {
    if (bid in this.battles) {
        console.log("Already watching battle " + bid + " with conf " + JSON.stringify(conf));
        return;
    }
    this.battles[bid] = new Battle(bid, conf);
}

function Battle(pid, conf) {
    this.id = pid;
    this.conf = conf;

    var name = players.name(conf.players[0]) + " vs " + players.name(conf.players[1]);

    if ($("#battle-" + pid).length === 0) {
        /* Create new tab */
        $('#channel-tabs').tabs("add", "#battle-" + pid, name);
        /* Cleaner solution would be appreciated */
        $("#battle-" + pid).html('<div id="chatTextArea" class="textbox"></div>'
                                      +'<p><input type="text" disabled="true" id="send-battle-'+pid+'" cols="40" onkeydown="if(event.keyCode==13)sendMessage(this);" placeholder="Type your message here..."/>'
                                      +' <button onClick="sendMessage(document.getElementById(\'send-pm-'+pid+'\'));">Send</button>'
                                      +' <button onClick="battles.battle(' + pid + ').close();">Close</button></p>');
        battles.battles[pid] = this;
        $('#channel-tabs').tabs("select", "#battle-"+pid);
    }

    this.print(JSON.stringify(conf));
}

Battle.prototype.players = function() {
    return this.conf.players;
}

Battle.prototype.chat = function () {
    return $("#battle-" + this.id + " #chatTextArea");
}


Battle.prototype.print = function(msg) {
    var chatTextArea = this.chat().get(0);

    chatTextArea.innerHTML += msg + "<br/>\n";

    /* Limit number of lines */
    if (this.chatCount++ % 500 === 0) {
        chatTextArea.innerHTML = chatTextArea.innerHTML.split("\n").slice(-500).join("\n");
    }
    chatTextArea.scrollTop = chatTextArea.scrollHeight;
}

Battle.prototype.close = function() {
    $('#channel-tabs').tabs("remove", "#battle-" + this.id);
    websocket.send("stopwatching|"+this.id);
}
