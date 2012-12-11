function Battles() {
    this.battles = {}
}

Battles.prototype.battle = function(pid) {
    if (pid in this.battles) {
        return this.battles[pid];
    }

    console.log("no battle with id " + pid + " found, current ids: " + JSON.stringify(Object.keys(this.battles)));
};

Battles.prototype.watchBattle = function(bid, conf) {
    if (bid in this.battles) {
        console.log("Already watching battle " + bid + " with conf " + JSON.stringify(conf));
        return;
    }
    new BattleTab(bid, conf);
};

function BattleTab(pid, conf) {
    initBattleData();

    this.shortHand = "battle";
    this.id = pid;
    this.conf = conf;

    var name = players.name(conf.players[0]) + " vs " + players.name(conf.players[1]);

    if ($("#battle-" + pid).length === 0) {
        /* Create new tab */
        $('#channel-tabs').tabs("add", "#battle-" + pid, name);
        /* Cleaner solution to create the tab would be appreciated */
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
        /* Create a showdown battle window */
        this.battle = new Battle($battle, $chatFrame);

        this.battle.runMajor(["player", "p1", players.name(conf.players[0])]);
        this.battle.runMajor(["player", "p2", players.name(conf.players[1])]);

        this.battle.runMajor(["start"]);
        this.battle.play();
//        this.battle.runMajor(["poke", "p1: Pikachu", "Pikachu, 20, M"]);
//        this.battle.runMajor(["poke", "p2: Gyarados", "Gyarados, 30, F, shiny"]);
//        this.battle.runMajor(["switch","p1a: Toxicroak","Toxicroak","(100/100)"]);
//        this.battle.runMajor(["switch","p1a: Toxicroak","Toxicroak","(100/100)"]);
//        this.battle.runMajor(["switch","p2a: Jirachi","Jirachi","(90/100)"]);
//        this.battle.runMajor(["switch","p2a: Jirachi","Jirachi","(90/100)"]);
//        this.battle.runMajor(["turn", "1"]);
//        this.battle.runMajor(["switch","p2a: Toxicroak","Toxicroak","(100/100)"]);
//        this.battle.runMajor(["switch","p2a: Toxicroak","Toxicroak","(100/100)"]);
//        this.battle.runMajor(["switch","p1a: Jirachi","Jirachi","(100/100)"]);
//        this.battle.runMajor(["switch","p1a: Jirachi","Jirachi","(100/100)"]);
//        this.battle.runMajor(["turn", "2"]);
//        this.battle.runMajor(["turn", "3"]);
    }

    this.print(JSON.stringify(conf));
}

BattleTab.inherits(ChannelTab);

BattleTab.prototype.players = function() {
    return this.conf.players;
};

BattleTab.prototype.chat = function () {
    return $("#battle-" + this.id + " #chatTextArea");
};

BattleTab.prototype.print = function(msg) {
    var chatTextArea = this.chat().get(0);

    chatTextArea.innerHTML += msg + "<br/>\n";

    /* Limit number of lines */
    if (this.chatCount++ % 500 === 0) {
        chatTextArea.innerHTML = chatTextArea.innerHTML.split("\n").slice(-500).join("\n");
    }
    chatTextArea.scrollTop = chatTextArea.scrollHeight;
};

BattleTab.prototype.close = function() {
    delete battles.battles[this.id];
    $('#channel-tabs').tabs("remove", "#battle-" + this.id);
    websocket.send("stopwatching|"+this.id);
};

/* Receives a PO command, and translates it in PS language.

    PS language: |a|b|c|[xx=y]|[zz=ff] -> battle.runMinor/Major([a,b,c],{xx=y,zz=ff})
 */
BattleTab.prototype.dealWithCommand = function(params) {
    var funcName = "dealWith"+params.command[0].toUpperCase() + params.command.slice(1);
    if (funcName in BattleTab.prototype) {
        this[funcName](params);
    }
};

BattleTab.prototype.addCommand = function(args, kwargs) {
    kwargs = kwargs||{};
    for (var x in kwargs) {
        args.push("["+x+"="+kwargs[x]+"]");
    }
    this.battle.add("|"+args.join("|"));
}

/* dealWithXxxx functions are all called from dealWithCommand */
BattleTab.prototype.dealWithTurn = function(params) {
    this.addCommand(["turn",  params.turn]);
};

/*
    0 -> "p1"
    1 -> "p2"
 */
BattleTab.prototype.spotToPlayer = function(spot) {
    return "p"+ (String.fromCharCode("1".charCodeAt(0) + spot));
};

BattleTab.prototype.pokemonToPS = function(pokemon) {
    var str = Tools.getSpecies(pokemon.num);
    if (pokemon.level != 100) {
        str += ", L" + pokemon.level;
    }
    if (pokemon.gender) {
        str += ", " + (pokemon.gender == 1 ? "M" : "F");
    }
    if (pokemon.shiny) {
        str += ", shiny";
    }

    return str;
};

/* Converts PO pokemon to PS pokemon details that are like '(95/100 par)' */
BattleTab.prototype.pokemonDetails = function(pokemon) {
    var str = "(" + pokemon.percent + "/100";

    if (pokemon.status) {
        /* Koed = 31,
         Fine = 0,
         Paralysed = 1,
         Asleep = 2,
         Frozen = 3,
         Burnt = 4,
         Poisoned = 5,
         */
        str += " ";
        if (pokemon.status == 1) {
            str += "par";
        } else if (pokemon.status == 2) {
            str += "slp";
        } else if (pokemon.status == 3) {
            str += "frz";
        } else if (pokemon.status == 4) {
            str += "brn";
        } else if (pokemon.status == 5) {
            str += "psn";
        } else if (pokemon.status == 31) {
            str += "fnt";
        }
    }
    return str + ")";
};

BattleTab.prototype.dealWithSend = function(params) {
    var poke = params.pokemon;
    this.addCommand(["switch", this.spotToPlayer(params.spot) + "a: " + poke.name, this.pokemonToPS(poke), this.pokemonDetails(poke)]);
}