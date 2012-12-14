function Battles() {
    this.battles = {};
    this.battleList = {};
    this.battlesByPlayer = {};
}

Battles.prototype.isBattling = function(pid) {
    return (pid in this.battlesByPlayer);
};

Battles.prototype.addBattle = function (battles) {
    for (var id in battles) {
        var battle = battles[id];
        battle.id = id;
        this.battleList[id] = battle;
        if (!(battle.ids[0] in this.battlesByPlayer)) {
            this.battlesByPlayer[battle.ids[0]] = {};
        }
        this.battlesByPlayer[battle.ids[0]][id] = battle;
        if (!(battle.ids[1] in this.battlesByPlayer)) {
            this.battlesByPlayer[battle.ids[1]] = {};
        }
        this.battlesByPlayer[battle.ids[1]][id] = battle;

        playerList.updatePlayer(battle.ids[0]);
        playerList.updatePlayer(battle.ids[1]);
    }
};

Battles.prototype.battleEnded = function(battleid, result) {
    //console.log("battle ended");
    var ids = this.battleList[battleid].ids;
    this.removeBattle(battleid);

    /* We do nothing with result yet... no printing channel events?! */
    playerList.updatePlayer(ids[0]);
    playerList.updatePlayer(ids[1]);
};

/* Maybe instead of a direct call from players it should be bound by some kind of event listener and
    called that way. */
Battles.prototype.removePlayer = function(pid) {
    /* If both players are not in memory for a battle, removes the battle from memory */
    for (var battleid in this.battlesByPlayer[pid]) {
        var battle = this.battlesByPlayer[pid][battleid];
        var ids = battle.ids;
        if (! players.hasPlayer(ids[0] == pid ? ids[1] : ids[0])) {
            this.removeBattle(battleid);
        }
    }
};

Battles.prototype.removeBattle = function(battleid) {
    var ids = this.battleList[battleid].ids;
    delete this.battlesByPlayer[ids[0]][battleid];
    delete this.battlesByPlayer[ids[1]][battleid];
    delete this.battleList[battleid];
    /* If a player has no more battles, useless to keep them in memory */
    if (!Object.keys(this.battlesByPlayer[ids[0]]).length) {
        delete this.battlesByPlayer[ids[0]];
    }
    if (!Object.keys(this.battlesByPlayer[ids[1]]).length) {
        delete this.battlesByPlayer[ids[1]];
    }
};

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
    this.pokes = {};
    this.spectators = {};
    /* PO separates damage message ("hurt by burn") and damage done. So we remember each damage message so we can give it
        together with the damage done to the Showdown window.
     */
    this.damageCause={};

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
        this.battle.runMajor(["gametype", "singles"]);//could use this.conf.mode

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

BattleTab.prototype.playerIds = function() {
    var array = [];
    for (var i = 0; i < this.conf.players.length; i++) {
        array.push(this.conf.players[i]);
    };
    for (var x in this.spectators) {
        array.push(x);
    }

    return array;
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
        args.push("["+x+"]"+kwargs[x]);
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

BattleTab.statuses = {
    "-1": "confusion",
    0: "",
    1: "par",
    2: "slp",
    3: "frz",
    4: "brn",
    5: "psn",
    31: "fnt"
};

BattleTab.prototype.dealWithSend = function(params) {
    var poke = params.pokemon;
    /* Stores the pokemon in memory */
    this.pokes[params.spot] = poke;
    this.addCommand(["switch", this.spotToPlayer(params.spot) + "a: " + poke.name, this.pokemonToPS(poke), this.pokemonDetails(poke)]);
};

BattleTab.prototype.dealWithKo = function(params) {
    this.addCommand(["faint", this.spotToPlayer(params.spot)]);
};

BattleTab.prototype.dealWithMove = function(params) {
    this.addCommand(["move", this.spotToPlayer(params.spot), Tools.getMoveName(params.move)]);
};

BattleTab.prototype.dealWithHpchange = function(params) {
    /* Checks & updates the pokemon in memory's life percent */
    var current = this.pokes[params.spot].percent;
    this.pokes[params.spot].percent = params.newHP;
    /* Is it healing or damage? */
    if (params.newHP > current || params.newHP == 100) {
        this.addCommand(["-heal", this.spotToPlayer(params.spot), (params.newHP - current) + " " + this.pokemonDetails(this.pokes[params.spot])], this.damageCause);
    } else {
        this.addCommand(["-damage", this.spotToPlayer(params.spot), -(params.newHP - current) + " " + this.pokemonDetails(this.pokes[params.spot])], this.damageCause);
    }
    this.damageCause = {};
};

BattleTab.prototype.dealWithHitcount = function(params) {
    this.addCommand(["-hitcount", this.spotToPlayer(params.spot), params.count]);
};

BattleTab.prototype.dealWithEffectiveness = function(params) {
    if (params.effectiveness > 4) {
        this.addCommand(["-supereffective", this.spotToPlayer(params.spot)]);
    } else if (params.effectiveness < 4 && params.effectiveness > 0) {
        this.addCommand(["-resisted", this.spotToPlayer(params.spot)]);
    } else if (params.effectiveness == 0) {
        this.addCommand(["-immune", this.spotToPlayer(params.spot)]);
    }
};

BattleTab.prototype.dealWithCritical = function(params) {
    this.addCommand(["-crit", this.spotToPlayer(params.spot)]);
};

BattleTab.prototype.dealWithMiss = function(params) {
    this.addCommand(["-miss", this.spotToPlayer(params.spot)]);
};

BattleTab.prototype.dealWithAvoid = function(params) {
    this.addCommand(["-avoid", this.spotToPlayer(params.spot)], {"msg":true});
};

BattleTab.prototype.dealWithBoost = function(params) {
    if (params.boost > 0) {
        this.addCommand(["-boost", this.spotToPlayer(params.spot), Tools.getStatName(params.stat), params.boost]);
    } else if (params.boost < 0) {
        this.addCommand(["-unboost", this.spotToPlayer(params.spot), Tools.getStatName(params.stat), -params.boost]);
    }
};

BattleTab.prototype.dealWithStatus = function(params) {
    var status = BattleTab.statuses[params.status];
    if (!status || status == "fnt") {
        return;
    }
    if (status == "psn" && params.multiple) {
        status = "tox";
    }
    this.pokes[params.spot].status = params.status;
    this.addCommand(["-status", this.spotToPlayer(params.spot), status]);
};

BattleTab.prototype.dealWithStatusdamage = function(params) {
    this.damageCause.from = BattleTab.statuses[params.status];
};

BattleTab.prototype.dealWithFail = function(params) {
    /* Third argument should be what the fail is about */
    this.addCommand(["-fail", this.spotToPlayer(params.spot)]);
};

BattleTab.prototype.dealWithPlayerchat = function(params) {
    var name = players.name(this.conf.players[params.spot]);
    this.addCommand(["chat", name, params.message]);
};

BattleTab.prototype.dealWithSpectatorjoin = function(params) {
    this.spectators[params.id] = params.name;
    this.addCommand(["join", params.name]);

    if (this.isCurrent()) {
        playerList.addPlayer(params.id);
    }
};

BattleTab.prototype.dealWithSpectatorleave = function(params) {
    this.addCommand(["leave", this.spectators[params.id]]);
    delete this.spectators[params.id];

    if (this.isCurrent()) {
        playerList.removePlayer(params.id);
    }
};

BattleTab.prototype.dealWithSpectatorchat = function(params) {
    var name = this.spectators[params.id];
    this.addCommand(["chat", name, params.message]);
};

BattleTab.prototype.dealWithNotarget = function(params) {
    this.addCommand(["-notarget"]);
};

BattleTab.prototype.dealWithFlinch = function(params) {
    this.addCommand(["cant", this.spotToPlayer(params.spot), "flinch"]);
};

BattleTab.prototype.dealWithRecoil = function(params) {
    this.damageCause.from = "recoil";
};

BattleTab.prototype.dealWithDrain = function(params) {
    this.damageCause.from = "drain";
    this.damageCause.of = this.spotToPlayer(params.spot);
};

BattleTab.prototype.dealWithAlreadystatus = function(params) {
    this.addCommand(["-fail", this.spotToPlayer(params.spot), BattleTab.statuses[params.status]]);
};

BattleTab.prototype.dealWithFeelstatus = function(params) {
    this.addCommand(["-cant", this.spotToPlayer(params.spot), BattleTab.statuses[params.status]]);
};

BattleTab.prototype.dealWithFreestatus = function(params) {
    this.addCommand(["-curestatus", this.spotToPlayer(params.spot), BattleTab.statuses[params.status]]);
};

BattleTab.weathers = {
    0: "none",
    1: "hail",
    2: "raindance",
    3: "sandstorm",
    4: "sunnyday"
};

BattleTab.prototype.dealWithWeatherstart = function(params) {
    var kwargs = {};
    if (params.permanent) {
        kwargs.of = this.spotToPlayer(params.spot);
    }
    this.addCommand(["-weather", BattleTab.weathers[params.weather]], kwargs);
};

BattleTab.prototype.dealWithFeelweather = function(params) {
    this.addCommand(["-weather", BattleTab.weathers[params.weather]], {"upkeep": true});
};

BattleTab.prototype.dealWithWeatherend = function(params) {
    this.addCommand(["-weather", "none"]);
};

BattleTab.prototype.dealWithWeatherhurt = function(params) {
    this.damageCause.from = BattleTab.weathers[params.weather];
};

BattleTab.prototype.dealWithSubstitute = function(params) {
    this.addCommand([params.substitute?"-start":"-end", this.spotToPlayer(params.spot), "Substitute"]);
};

BattleTab.prototype.dealWithTier = function(params) {
    this.addCommand(["tier", params.tier]);
};

BattleTab.clauses = {
    0: "Sleep Clause",
    1: "Freeze Clause",
    2: "Disallow Spects",
    3: "Item Clause",
    4: "Challenge Cup",
    5: "No Timeout",
    6: "Species Clause",
    7: "Wifi Battle",
    8: "Self-KO Clause"
};

BattleTab.prototype.dealWithRated = function(params) {
    if (params.rated) {
        this.addCommand(["rated", params.rated]);
    }

    /* Print the clauses, convert flags to actual clause numbers */
    var clauses = this.conf.clauses;
    var i = 0;

    while (clauses > 0) {
        if (clauses % 2) {
            this.addCommand(["rule", BattleTab.clauses[i]]);
        }
        clauses = Math.floor(clauses/2);
        i = i+1;
    }

    this.addCommand(["start"]);
};