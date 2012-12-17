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
        var myname = players.name(players.myid);
        var chatElem = '<form onsubmit="return false" class="chatbox"><label style="' + hashColor(toId(myname)) + '">' + sanitize(myname) +
            ':</label> <textarea class="ps-textbox" type="text" size="70" history="true" autofocus="true" id="send-battle-'+this.id+'" onkeydown="if(event.keyCode==13)sendMessage(this);" ></textarea></form>';
        $content.html('<div class="battlewrapper"><div class="battle">Battle is here</div><div class="foehint"></div><div class="battle-log"></div><div class="battle-log-add">'+ chatElem +'</div><div class="replay-controls"></div></div>'
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

BattleTab.prototype.addCommand = function(args, kwargs, preempt) {
    kwargs = kwargs||{};
    for (var x in kwargs) {
        args.push("["+x+"]"+kwargs[x]);
    }
    if (!preempt) {
        this.battle.add("|"+args.join("|"));
    } else {
        this.battle.instantAdd("|"+args.join("|"));
    }
};

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
    0: "",
    1: "par",
    2: "slp",
    3: "frz",
    4: "brn",
    5: "psn",
    6: "confusion",
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
    if (params.boost > 6) {
        this.addCommand(["-setboost", this.spotToPlayer(params.spot), Tools.getStatName(params.stat), 6], this.damageCause);
    } else if (params.boost > 0) {
        this.addCommand(["-boost", this.spotToPlayer(params.spot), Tools.getStatName(params.stat), params.boost], this.damageCause);
    } else if (params.boost < 0) {
        this.addCommand(["-unboost", this.spotToPlayer(params.spot), Tools.getStatName(params.stat), -params.boost], this.damageCause);
    }
    this.damageCause = {};
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
    this.addCommand(["-status", this.spotToPlayer(params.spot), status], this.damageCause);
    this.damageCause = {};
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
    this.addCommand(["chat", name, params.message], undefined, true);
};

BattleTab.prototype.dealWithSpectatorjoin = function(params) {
    this.spectators[params.id] = params.name;
    this.addCommand(["join", params.name], undefined, true);

    if (this.isCurrent()) {
        playerList.addPlayer(params.id);
    }
};

BattleTab.prototype.dealWithSpectatorleave = function(params) {
    this.addCommand(["leave", this.spectators[params.id]], undefined, true);
    delete this.spectators[params.id];

    if (this.isCurrent()) {
        playerList.removePlayer(params.id);
    }
};

BattleTab.prototype.dealWithSpectatorchat = function(params) {
    var name = this.spectators[params.id];
    this.addCommand(["chat", name, params.message], undefined, true);
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
    if (params.status == 6) { //confusion
        this.addCommand(["-activate", this.spotToPlayer(params.spot), BattleTab.statuses[params.status]]);
    } else {
        this.addCommand(["cant", this.spotToPlayer(params.spot), BattleTab.statuses[params.status]]);
    }
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

BattleTab.prototype.dealWithChoiceselection = function(params) {
    this.addCommand(["callback", "decision"]);
};

/*
 Forfeit,
 Win,
 Tie,
 Close
 */
BattleTab.prototype.dealWithBattleend = function(params) {
    if (params.result == 0 || params.result == 1) {
        this.addCommand(["win", players.name(this.conf.players[params.winner])]);
    } else if (params.result == 2) {
        this.addCommand(["tie"]);
    } else if (params.result == 3) {
        this.addCommand(["leave", players.name(this.conf.players[0])]);
        this.addCommand(["leave", players.name(this.conf.players[1])]);
    }
};

BattleTab.itemsToPS = {
    3: function(params) {this.addCommand(["-enditem", this.spotToPlayer(params.spot), "item: White herb"])},
    4: function(params) {this.addCommand(["-enditem", this.spotToPlayer(params.spot), "item: Focus Band"])},
    5: function(params) {this.addCommand(["-enditem", this.spotToPlayer(params.spot), "item: Focus Sash"])},
    7: function(params) {this.addCommand(["-enditem", this.spotToPlayer(params.spot), "item: Mental Herb"])},
    11: function(params) {this.addCommand(["-activate", this.spotToPlayer(params.spot), "item: Power Herb"])},
    12: function() {this.damageCause.from = "item: Leftovers"},
    16: function() {this.damageCause.from = "item: Black Sludge"},
    17: function(params) {this.addCommand(["-activate", this.spotToPlayer(params.spot), "item: Quick Claw"])},
    18: function() {this.damageCause.from = "item: Berry Juice"},
    19: [function(params) {this.addCommand(["-activate", this.spotToPlayer(params.spot), "item: Flame Orb"])},
        function(params) {this.addCommand(["-activate", this.spotToPlayer(params.spot), "item: Toxic Orb"])}],
    21: function() {this.damageCause.from = "item: Life Orb"},
    24: function() {this.damageCause.from = "item: Shell Bell"},
    29: function() {this.damageCause.from = "item: Sticky Barb"},
    34: function(params) {this.damageCause.from = "item: Rocky Helmet"; this.damageCause.of = this.spotToPlayer(params.spot);},
    35: [function(params) {this.addCommand(["-enditem", this.spotToPlayer(params.spot), "item: Air Balloon"])},
        function(params) {this.addCommand(["-item", this.spotToPlayer(params.spot), "item: Air Balloon"])}],
    36: function(params) {this.damageCause.from = "item: " + Tools.getItemName(params.berry); },
    37: function(params) {this.addCommand(["-enditem", this.spotToPlayer(params.spot), "item: " + Tools.getItemName(params.berry)], {from: "gem", move: Tools.getMoveName(params.other)});},
    38: function(params) {this.addCommand(["-enditem", this.spotToPlayer(params.spot), "item: Red Card"], {of: this.spotToPlayer(params.foe)});},
    39: function(params) {this.addCommand(["-enditem", this.spotToPlayer(params.spot), "item: Eject Button"])},
    40: function(params) {this.addCommand(["-activate", this.spotToPlayer(params.spot), "item: Berserk Gene"])},
    41: function(params) {this.addCommand(["-activate", this.spotToPlayer(params.spot), "item: Destiny Knot"])}
//    41: %s's Destiny Knot activated, %f is in love!
};

BattleTab.prototype.dealWithItemmessage = function(params) {
    var f = BattleTab.itemsToPS[params.item];
    if (!f) {
        return;
    }
    if (Array.isArray(f)) {
        f = f[params.part];
    }
    if (!f) {
        return;
    }
    f.call(this, params);
};

BattleTab.movesToPS = {
    //1 %f had its energy drained!|%s devoured %f's dreams!|%s sucked up the Liquid Ooze!
    1: [undefined, undefined, function(params) {this.damageCause.from = "ability: Liquid Ooze"; this.damageCause.of = params.foepoke;}],
//2 %s surrounded itself with a veil of water!|Aqua ring restored %s's HP.
    2: [function(params){this.addCommand(["-start", params.srcpoke, "Aqua Ring"])}, function(){this.damageCause.from = "move: Aqua Ring"}],
//3 A soothing aroma wafted through the area!|A bell chimed!
    3: function(params){this.addCommand(["-cureteam", params.srcpoke, params.part == 0 ? "Aromatherapy" : "Heal Bell"])},
//    7 %q attacked!
//    8 %s hasn't enough energy left!|%s cut its own HP and maximized its Attack!
    8: [undefined, function() {this.damageCause.from = "Belly Drum"}],
//9 %s is storing energy!|%s unleashed energy!
    9: [function(params){this.addCommand(["-start", params.srcpoke, "Bide"]);}, function(params){this.addCommand(["-end", params.srcpoke, "Bide"])}],
//    10 %s was hurt by %m!|%s is freed from %m!|%f became trapped by swirling magma!
    10: [function(params){this.damageCause.partiallytrapped = true; this.damageCause.from = "move: "+Tools.getMoveName(params.other)}, undefined, undefined],
//    11 %s must recharge!
    11: function(params){this.addCommand(["cant", params.srcpoke, "recharge"]);},
//    12 %f can no longer escape!
//    13 %s sprang up!|%s burrowed its way under the ground!|%s hid underwater!|%s flew high up!|%s vanished instantly!|%s took %f in the air!|%s can't attack while in the air!
    13: function(params){
        if (params.part < 6) {
            this.addCommand(["-prepare", params.srcpoke, "move: "+Tools.getMoveName(params.other)]);
        } else {
            this.addCommand(["cant", params.srcpoke, "Sky Drop"]);
        }
    },
//14 %s shattered %tf's team protections!
    14: function(params) {this.addCommand(["-activate", params.srcpoke, "Brick Break"]);},
//16 %s stole and ate %f's %i!
    16: function(params) {this.addCommand(["-enditem", params.foepoke, Tools.getItemName(params.other)], {of: params.srcpoke, from: "stealeat"})},
//17 %s transformed into the %t type!
    17: function(params) {this.addCommand(["-start", params.srcpoke, "typechange", Tools.getTypeName(params.type)])},
//    18 %s began charging power!
    18: function(params) {this.addCommand(["-activate", params.srcpoke, "Charge"])},
//    19 %s transformed into the %t type!
    19: function(params) {this.addCommand(["-start", params.srcpoke, "typechange", Tools.getTypeName(params.type)])},
//    20 %s transformed into the %t type!
    20: function(params) {this.addCommand(["-start", params.srcpoke, "typechange", Tools.getTypeName(params.type)])},
//    23 %s stole %f's %i!|%s stole %f's %i!
    23: function(params) {this.addCommand(["-item", params.srcpoke, Tools.getItemName(params.other)], {of: params.foepoke, from: "covet"})},
//    25 %s cut its own HP and laid a Curse on %f!|%s is afflicted by the Curse!
    25: [function(params) {this.addCommand(["-start", params.foepoke, "curse"], {of:params.srcpoke})},
        function() {this.damageCause.from="curse"}],
//    26 %s took the attacker down with it!|%s is trying to take the foe down with it!
    26: [function(params){this.addCommand(["-activate", params.srcpoke, "Destiny Bond"])},function(params){this.addCommand(["-singlemove", params.srcpoke, "Destiny Bond"])}],
//    27 %s protected itself!
    27: function(params){this.addCommand(["-activate", params.srcpoke, "Protect"])},
//    28 %f's %m was disabled!|%s's %m is disabled!|%s is no longer disabled!
    28: [function(params){this.addCommand(["-start", params.foepoke, "Disable", Tools.getMoveName(params.other)])},
        function(params){this.addCommand(["cant", params.srcpoke, "Disable", Tools.getMoveName(params.other)])},
        function(params){this.addCommand(["-end", params.srcpoke, "Disable"])}],
//    29 %s took the %m attack!|%s foresaw an attack!|%s chose Doom Desire as its destiny!
    29: [function(params){this.addCommand(["-end", params.srcpoke, "move: " + Tools.getMoveName(params.other)])},
        function(params){this.addCommand(["-start", params.srcpoke, "Future Sight"])},
        function(params){this.addCommand(["-start", params.srcpoke, "Doom Desire"])}],
//    31 It doesn't affect %s!
//32 %f can't use items anymore!|%s can use items again!
    32: function(params){this.addCommand([params.part == 0 ? "-start" : "-end", params.part == 0 ? params.foepoke :params.srcpoke, "embargo"])},
//33 %s's Encore ended!|%f received an encore!
    33: function(params){this.addCommand([params.part == 1 ? "-start" : "-end", params.part == 1 ? params.foepoke :params.srcpoke, "encore"])},
//35 %s endured the hit!|%s braced itself!
    35: function(params){this.addCommand([params.part == 1 ? "-singleturn" : "-activate", params.srcpoke, "activate"])},
//    43 %f's Sturdy made the attack fail!|It's a one hit KO!
    43: [function(params){this.addCommand(["-activate", params.foepoke, "sturdy"])}, function(){this.addCommand(["-ohko"])}],
//    45 %s flung its %i!
    45: function(params){this.addCommand(["-enditem", params.srcpoke, Tools.getItemName(params.other)], {from: "fling"})},
//    46 %s is getting pumped!
    46: function(params){this.addCommand(["-start", params.srcpoke, "focusenergy"])},
//    47 %s lost its focus!|%s is tightening its focus!
    47: [function(params){this.addCommand(["cant", params.srcpoke, "Focus Punch"])}, function(params){this.addCommand(["-singleturn", params.srcpoke, "focuspunch"])}],
//    48 %s became the center of attention!
//    51 %f's %a was suppressed!
    48: function(params) {this.addCommand(['-endability', params.srcpoke, Tools.getAbilityName(params.other)], {from: "Gastro Acid"})},
//53 Gravity intensified!|Gravity returned to normal!|%s couldn't stay airbourne because of gravity!|%s's %m was cancelled because of gravity!|%s can't use %m because of gravity!
    53: function(params) {
        var part = params.part;
        if (part < 2) {
            this.addCommand([part == 0 ? "-fieldstart":"fieldend", "gravity"]);
        } else if (part == 3) {
            this.addCommand(["-activate", params.srcpoke, "gravity"]);
        } else if (part == 4) {

        } else if (part == 5) {
            this.addCommand(["cant", params.srcpoke, "gravity", Tools.getMoveName(params.other)])
        }
    },
//54 %f's %m lost all its PP because of %s' Grudge!
    54: function(params) {this.addCommand(["-activate", params.foepoke, "grudge", Tools.getMoveName(params.other)])},
//    55 %s swapped its boosts with %f!
    55: function(params) {this.addCommand(["-swapboost", params.srcpoke, params.foepoke])},
//    57 A hailstorm brewed!|It started to rain!|A sandstorm brewed!|The sunlight turned harsh!
//    58 %s is in love with %f!|%f fell in love!|%s is immobilized by love!
    58: [function(params) {this.addCommand(["-activate", params.srcpoke, "attract"], {of: params.foepoke})},
        function(params) {this.addCommand(["-start", params.foepoke, "attract"])},
        function(params) {this.addCommand(["cant", params.srcpoke, "attract"])}],
//    59 %f was prevented from healing!|%s can't use %m because of Heal Block!|%s's heal block wore off!
    59: [function(params) {this.addCommand(["-start", params.foepoke, "healblock"])},
        function(params) {this.addCommand(["cant", params.srcpoke, "healblock", Tools.getMoveName(params.other)])},
        function(params) {this.addCommand(["-end", params.srcpoke, "healblock"])}],
//    60 %s regained health!
//    61 %s regained health!|The healing wish came true!|It became cloaked in mystical moonlight!
    61: [undefined, function(){this.damageCause.from="healingwish"}, function(){this.damageCause.from="lunardance"}],
//    62 %s swapped its defense and attack!
    62: function(params) {this.addCommand(["-start", params.srcpoke, "powertrick"])},
//    63 %s is ready to help %f!
//    64 %s kept going and crashed!
//    67 %s sealed the opponent's move(s)!|%s cannot use the sealed %m!
    67: [function(params){this.addCommand(["-start", params.srcpoke, "imprison"])}, function(params){this.addCommand(["cant", params.srcpoke, "imprison", Tools.getMoveName(params.other)])}],
//68 %s levitated with electromagnetism!|%s electromagnetism wore off!
    68: function(params){this.addCommand([params.part == 0 ? "-start" : "-end", params.srcpoke, "magnetrise"])},
//    70 %s knocked off %f's %i!
    70: function(params){this.addCommand(["-enditem", params.foepoke, Tools.getItemName(params.other)], {from: "knockoff"})},
//72 It doesn't affect %s...|%f was seeded!|%s's health is sapped by leech seed.
    72: [undefined, function(params){this.addCommand("-start", params.srcpoke, "leechseed")}, function(){this.damageCause.from="leechseed"}],
//73 Reflect raised %ts's team defense!|Light Screen raised %ts's team special defense!|Reflect raised %ts's team defense slightly!|Light Screen raised %ts's team special defense slightly!|%ts's reflect wore off!|%ts's light screen wore off!
    73: function(params) {
        var part = params.part;
        this.addCommand([part < 4 ? "-sidestart" : "-sideend", params.srcpoke, part % 2 ? "lightscreen" : "reflect"]);
    },
//    74 %s took aim at %f!
//    75 %ts's team is protected from critical hits!|%ts's Lucky Chant wore off!
    75: function(params) {this.addCommand([params.part == 0 ? "-start":"-end", params.srcpoke, "luckychant"])},
//    76 %s shrouded itself with Magic Coat!|%s's %m was bounced back by Magic Coat!|%s's %m was bounced back by Magic Mirror!
    76: [function(params){this.addCommand(["-singleturn", params.srcpoke, "magiccoat"])},
        function(params) {this.addCommand(["-activate", params.foepoke, "magiccoat", Tools.getMoveName(params.other)], {of: params.srcpoke})},
        function(params) {this.addCommand(["-activate", params.foepoke, "magicmirror", Tools.getMoveName(params.other)], {of: params.srcpoke})}],
//    77 %s cleared the field around %tf's team!|%s cleared the field!
    77: undefined, //defog
//78 Magnitude %d!
    78: function(params){this.addCommand(["-activate", params.srcpoke, "magnitude", params.other])},
//    81 %s learned %m!
    81: function(params){this.addCommand(["-activate", params.srcpoke, "mimic", Tools.getMoveName(params.other)])},
//    82 But nothing happened!
    82: function(params){this.addCommand(["-nothing", params.srcpoke])},
//    84 %s identified %f!
    84: function(params){this.addCommand(["-start", params.foepoke, "foresight"])},
//    86 %ts's team became shrouded in mist!|%ts's Mist wore off!|The mist prevents %f from having its stats lowered!
    86: function(params){
        var part = params.part;
        var effects = ["-sidestart", "-sideend", "-activate"];
        var poke = [params.srcpoke, params.srcpoke, params.foepoke];
        this.addCommand([effects[part], poke[part], "mist"]);
    },
//    87 %s regained health!|%s regained a lot of health!|%s regained little health!
//    88 Electric's power has been weakened!|Fire's power has been weakened!
    88: function(params) { this.addCommand(["-start", params.srcpoke, params.part == 0 ? "mudsport" : "watersport"]);},
//    92 %s began having a nightmare!|%s is locked in a nightmare!
    90: [function(params){this.addCommand(["-start", params.srcpoke, "nightmare"])},
        function(){this.damageCause.from = "nightmare"}],
//    93 %s calmed down!|%s became confused due to fatigue!
//    94 The battlers shared their pain!
//    94: function(){this.damageCause.from = "painsplit"},
//    95 All Pokémon hearing the song will faint in three turns!|%s's perish count fell to %d.
    95: [function(){this.addCommand(["-fieldactivate", "perishsong"])},
        function(params){this.addCommand(["-start", params.srcpoke, "perish"+params.other])}],
//96 %s's present healed %f some HP!
    96: function(){this.damageCause.from = "move: Present"},
//97 %s copied %f's stat changes!
//98 %s moved its status onto %f!
    98: function(params){this.addCommand(["-curestatus", params.srcpoke, "psychoshift"], {from: params.foepoke})},
//    102 %s's rage is building!
//103 %s got free of %f's %m!|%s blew away Leech Seed!|%s blew away Spikes!|%s blew away Toxic Spikes!|%s blew away Stealth Rock!
    103: function(params) {
        var effects = ["partiallytrapped", "leechseed", "spikes", "toxicspikes", "stealthrock"];
        this.addCommand(["-end", params.srcpoke, effects[params.part]], {from: "rapidspin"});
    },
//104 %s prepared a gust of wind!|%s became cloaked in a harsh light!|%s tucked in its head!|%s absorbed light!|%s became cloaked in a freezing light!|%s became cloaked in freezing air!
    104: function(params){this.addCommand(["-prepare", params.srcpoke, "move: "+Tools.getMoveName(params.other)]);},
//    105 %s recycled %i!
    105: function(params){this.addCommand(["-item", params.srcpoke, Tools.getItemName(params.other)], {from: "recycle"})},
//    106 %s went to sleep and became healthy!
    106: function(){this.damageCause.from="rest"},
//    107 %s held on to the ground using its Suction Cups!|%s is solidly rooted to the ground!|%f was dragged out!
//    108 %s copied %f's %a!
    108: function(params){this.addCommand(["-ability", params.srcpoke, Tools.getAbilityName(params.other)], {from: "roleplay", of: params.foepoke})},
//109 %ts's team became cloaked in a mystical veil!|%ts's team is no longer protected by Safeguard!|Safeguard prevents %f from being inflicted by status!
    109: function(params){
        var part = params.part;
        var effects = ["-sidestart", "-sideend", "-activate"];
        var poke = [params.srcpoke, params.srcpoke, params.foepoke];
        this.addCommand([effects[part], poke[part], "safeguard"]);
    },
//    111 %s sketched %m!
    111: function(params){this.addCommand(["-activate", params.srcpoke, "sketch", Tools.getMoveName(params.other)])},
//    112 %s swapped abilities with its target!
    112: function(params){this.addCommand(["-activate", params.srcpoke, "skillswap"])},
//    114 %s's Damp prevents it from working!
//118 %s snatched %f's move!|%s waits for a target to make a move!
    118: function(params){this.addCommand(["-activate", params.srcpoke, "snatch"], {of:params.foepoke})},
//121 Spikes were scattered all around the feet of %tf's team!|%s is hurt by spikes!
    121: [function(params){this.addCommand(["-sidestart", params.foepoke, "spikes"])},
        function(){this.damageCause.from = "spikes"}],
//122 %s released!
//    123 It reduced the PP of %f's %m by 4!
    123: function(params){this.addCommand(["-activate", params.foepoke, "spite", Tools.getMoveName(params.other), 4])},
//124 Pointed stones float in the air around %tf's team!|Pointed stones dug into %s!
    124: [function(params){this.addCommand(["-sidestart", params.foepoke, "stealthrock"])},
        function(){this.damageCause.from = "steathrock"}],
//125 %s stockpiled %d!
    125: function(params){this.addCommand(["-start", params.srcpoke, "stockpile"+params.other])},
//    127 %s is hit with recoil!
//    128 %s already has a substitute.|%s's substitute faded!|%f's substitute blocked %m!|%s's substitute took the damage!|%s made a substitute!
    128: [function(params){this.addCommand(["-start", params.foepoke, "substitute"], {akready:true})}, undefined,
        function(params){this.addCommand(["-start", params.foepoke, "substitute"], {block:true})},
        function(params){this.addCommand(["-start", params.foepoke, "substitute"], {damage:true})}, undefined],
//131 %s swallowed!
//    132 %s switched items with %f!|%s obtained one %i!
    132: [function(params){this.addCommand(["-activate", params.srcpoke, "trick"], {of: params.foepoke})},
          function(params){this.addCommand(["-item", params.srcpoke, Tools.getItemName(params.other)])}],
//    133 A tailwind started blowing behind %ts's team!|%ts's team tailwind petered out!
    133: function(params){this.addCommand([params.part == 0 ? "-sidestart":"-sideend", params.srcpoke, "tailwind"])},
//    134 %s can't use %m after the taunt!|%f fell for the taunt!|%s's taunt ended!
    134: function(params) {
        if (params.part == 0) {
            this.addCommand(["cant", params.srcpoke, "taunt", Tools.getMoveName(params.other)]);
        } else if (params.part == 1) {
            this.addCommand(["-start", params.foepoke, "taunt"]);
        } else {
            this.addCommand(["-end", params.foepoke, "taunt"]);
        }
    },
//    135 %f is now tormented!
    135: function(params) {this.addCommand(["-start", params.foepoke, "torment"]);},
//    136 Poison spikes were scattered all around the feet of %tf's team!|The poison spikes disappeared around %s's feet!
    136: [function(params){this.addCommand([params.part == 0 ? "-sidestart" : "-sideend", params.part == 0 ? params.foepoke : params.srcpoke, "stealthrock"])}],
//    137 %s transformed into %p!
    137: function(params){this.addCommand(["-transform", params.srcpoke, params.foepoke])},
//    138 %s twisted the dimensions!|The twisted dimensions returned to normal!
    138: function(params){this.addCommand([params.part==0?"-fieldstart":"-fieldend", params.srcpoke, "trickroom"])},
//    141 %s caused an uproar!|%s is making an uproar!|%s calmed down!|%s woke up!|%s stays awake because of the uproar!
    141: function(params) {
        if (params.part == 0) {
            this.addCommand(["-start", params.srcpoke, "uproar"]);
        } else if (params.part == 2) {
            this.addCommand(["-end", params.srcpoke, "uproar"]);
        } else if (params.part == 3) {
            this.damageCause.from="uproar";
        } else if (params.part == 4) {
            this.addCommand(["-activate", params.srcpoke, "uproar"]);
        }
    },
//    142 %q's wish came true!
    142: function(params){this.damageCause.from = "wish"; this.damgeCause.wisher=params.data},
//143 %f now has %a!
    143: function(params){this.addCommand(["-ability", params.foepoke, Tools.getAbilityName(params.other)])},
//    144 %s made %f feel drowsy!|%s yawns!|%s's %a made it ineffective!
    144: [function(params) {this.addCommand(["-start", params.foepoke, "yawn"])},undefined,undefined],
//149 All stat changes were eliminated!|%f's stat changes were eliminated!|Haze wafted through the field!
    149: [function(){this.addCommand(["-clearallboost"])}, function(params){this.addCommand(["-clearboost", params.foepoke])}],
//150 %s landed on the ground!
    150: [function(){this.damageCause.from="roost"}],
//    151 %s planted its roots!|%s absorbed nutrients with its roots!
    151: [function(params){this.addCommand(["-start", params.srcpoke, "ingrain"])}, function(){this.damageCause.from = "ingrain"}],
//    155 %s and %f had their power shared!|%s and %f had their defenses shared!
//    156 %s cancelled the items' effects!|The items are now working again!
    156: function(params){this.addCommand([params.part==0?"-fieldstart":"-fieldend", params.srcpoke, "magicroom"])},
//157 %s became of the Water type!
    157: function(params) {this.addCommand(["-start", params.srcpoke, "typechange", "Water"])},
//    158 %f gained %a!
    158: function(params){this.addCommand(["-ability", params.foepoke, Tools.getAbilityName(params.other)])},
//    160 %f's %i burned!
    160: function(params){this.addCommand(["-enditem", params.foepoke, Tools.getItemName(params.other)], {from:"incinerate"})},
//162 %s gave %f its %i!
    162: function(params){
        this.addCommand(["-enditem", params.srcpoke, Tools.getItemName(params.other)], {from:"bestow"});
        this.addCommand(["-item", params.foepoke, Tools.getItemName(params.other)], {from:"bestow"});
    },
//    164 %s's status cleared!
//168 %s swapped the Sp. Def. and the Defense of all the pokemon!|The Sp. Def and Defense of the pokemon went back to normal!
    168: function(params){this.addCommand([params.part==0?"-fieldstart":"-fieldend", params.srcpoke, "wonderroom"])},
    //169:  %ts's team is protected by Wide Guard!|%ts's team Wide Guard was broken!
    169: function(params){this.addCommand([params.part==0?"-start":"-end", params.srcpoke, "wideguard"])},
//    170 %ts's team is protected by Quick Guard!|%ts's team Quick Guard was broken!
    170: function(params){this.addCommand([params.part==0?"-start":"-end", params.srcpoke, "quickguard"])},
//    171 %s is being sent back!
//    172 %s type changed to match %f's types!
//174 %f was hurled into the air!|%s was freed from the telekinesis!
    174: function(params){this.addCommand([params.part==0?"-start":"-end", params.part==0?params.foepoke: params.srcpoke, "telekinesis"])},
//    175 %s fell straight down!
    175: function(params){this.addCommand(["-start", params.srcpoke, "smackdown"])}
//    178 %s prepares its %m!|It is completely synchronised with %f!|%ts's team is standing on a burning field!|%s is hurt by the sea of fire!
//179 %s prepares its %m!|It is completely synchronised with %f!|%ts's team is floundering in a swamp!
//180 %s prepares its %m!|It is completely synchronised with %f!|%ts's team is under an amplifying rainbow!
//190 %f took the kind offer!
//    191 #

};

BattleTab.prototype.dealWithMovemessage = function(params) {
    var f = BattleTab.movesToPS[params.move];
    if (!f) {
        return;
    }
    if (Array.isArray(f)) {
        f = f[params.part];
    }
    if (!f) {
        return;
    }
    if (params.spot != -1) {
        params.srcpoke = this.spotToPlayer(params.spot);
    }
    if (params.foe != -1) {
        params.foepoke = this.spotToPlayer(params.foe);
    }
    f.call(this, params);
};