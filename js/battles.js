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
    new BattleTab(bid, conf);
}

function BattleTab(pid, conf) {
    initBattleData();

    this.shortHand = "battle";
    this.id = pid;
    this.conf = conf;

    var name = players.name(conf.players[0]) + " vs " + players.name(conf.players[1]);

    if ($("#battle-" + pid).length === 0) {
        /* Create new tab */
        $('#channel-tabs').tabs("add", "#battle-" + pid, name);
        /* Cleaner solution would be appreciated */
        var $content = $("#battle-" + pid);
        $content.html('<div class="battlewrapper"><div class="battle">Battle is here</div><div class="foehint"></div><div class="battle-log"></div><div class="battle-log-add">Connecting...</div><div class="replay-controls"></div></div>'
                                 +'<div id="chatTextArea" class="textbox"></div><p><button onClick="battles.battle(' + pid + ').close();">Close</button></p>');
        battles.battles[pid] = this;
        $('#channel-tabs').tabs("select", "#battle-"+pid);

        var $battle = $content.find('.battle');
        //this.controlsElem = elem.find('.replay-controls');
        var $chatFrame = $content.find('.battle-log');
/*
        this.chatElem = null;
        this.chatAddElem = elem.find('.battle-log-add');
        this.chatboxElem = null;
        this.joinElem = null;
        this.foeHintElem = elem.find('.foehint');
*/
        /* Showdown battle window */
        this.battle = new Battle($battle, $chatFrame);
    }

    this.print(JSON.stringify(conf));
}

BattleTab.inherits(ChannelTab);

BattleTab.prototype.players = function() {
    return this.conf.players;
}

BattleTab.prototype.chat = function () {
    return $("#battle-" + this.id + " #chatTextArea");
}


BattleTab.prototype.print = function(msg) {
    var chatTextArea = this.chat().get(0);

    chatTextArea.innerHTML += msg + "<br/>\n";

    /* Limit number of lines */
    if (this.chatCount++ % 500 === 0) {
        chatTextArea.innerHTML = chatTextArea.innerHTML.split("\n").slice(-500).join("\n");
    }
    chatTextArea.scrollTop = chatTextArea.scrollHeight;
}

BattleTab.prototype.close = function() {
    delete battles.battles[this.id];
    $('#channel-tabs').tabs("remove", "#battle-" + this.id);
    websocket.send("stopwatching|"+this.id);
}
