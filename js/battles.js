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

        /* Is it a battle we're taking part in ? */
        if (battle.team) {
            new BattleTab(battle.id, battle.conf, battle.team);
        }
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

function BattleTab(pid, conf, team) {
    /* me and meIdent are needed by PS stuff */
    this.me = {
        name: players.myname()
    };

    this.meIdent = {
        name: this.me.name,
        named: 'init'
    };

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
        $content.html('<div class="battlewrapper">' +
            '<div class="battle">Loading battle...</div><div class="foehint"></div><div class="battle-log"></div><div class="battle-log-add">'+ chatElem +'</div>' +
            '<div class="replay-controls"></div>' +
            '</div>'
            +'<div id="chatTextArea" class="textbox"></div><p><button onClick="battles.battle(' + pid + ').close();">Close</button></p>');
        battles.battles[pid] = this;
        switchToTab("#battle-"+pid);

        var $battle;
        this.battleElem = $battle = $content.find('.battle');
        this.$controls = $content.find('.replay-controls');

        var $chatFrame = this.$chatFrame = this.chatFrameElem = $content.find('.battle-log');
/*
        this.chatElem = null;*/
        this.chatAddElem = $content.find('.battle-log-add');
        /*this.chatboxElem = null;
        this.joinElem = null;*/
        this.$foeHint = $content.find('.foehint');

        /* Create a showdown battle window */
        this.battle = new Battle($battle, $chatFrame);

        this.battle.runMajor(["player", "p1", players.name(conf.players[0])]);
        this.battle.runMajor(["player", "p2", players.name(conf.players[1])]);
        this.battle.runMajor(["gametype", "singles"]);//could use this.conf.mode

        if (team) {
            this.myself = conf.players[1] == players.myid ? 1 : 0;
            this.convertTeamToPS(team, this.myself);
            this.updateSide(this.request.side, false);
        }

        this.initPSBattle();
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

    this.print("conf: " + JSON.stringify(conf));
    if (team) {
        //this.print("team: " + JSON.stringify(team));
    }
}

BattleTab.inherits(ChannelTab);

BattleTab.prototype.initPSBattle = function(data)
{
    var selfR = this;
    /* Needs to be instantiated that way since it can be called through a callback */
    this.callback = function (battle, type) {
        if (!battle) battle = selfR.battle;
        selfR.notifying = false;
        if (type === 'restart') {
            selfR.me.callbackWaiting = false;
            selfR.battleEnded = true;
            return;
        }

        var myPokemon = selfR.battle.mySide.active[0];
        var yourPokemon = selfR.battle.yourSide.active[0];
        var text = '';
        if (myPokemon) {
            text += '<div style="position:absolute;top:210px;left:130px;width:180px;height:160px;"' + selfR.tooltipAttrs(myPokemon.ident, 'pokemon', true, true) + '></div>';
        }
        if (yourPokemon) {
            text += '<div style="position:absolute;top:90px;left:390px;width:100px;height:100px;"' + selfR.tooltipAttrs(yourPokemon.ident, 'pokemon', true, 'foe') + '></div>';
        }
        selfR.$foeHint.html(text);

        if (!selfR.me.request) {
            selfR.$controls.html('<div class="controls"><em>Waiting for players...</em></div>');
            return;
        }
        if (selfR.me.request.side) {
            selfR.updateSide(selfR.me.request.side, true);
        }
        selfR.me.callbackWaiting = true;
        var active = selfR.battle.mySide.active[0];
        if (!active) active = {};
        selfR.$controls.html('<div class="controls"><em>Waiting for opponent...</em></div>');
        this.updateControlsForPlayer();
    };

    if (this.battle.activityQueue) {
        // re-initialize
        this.battleEnded = false;
//        this.battle = new Battle(this.battleElem, this.chatFrameElem);

/*
        if (widthClass !== 'tiny-layout') {
            this.battle.messageSpeed = 80;
        }
*/

        this.battle.setMute(this.me.mute);
        this.battle.customCallback = this.callback;
        this.battle.startCallback = this.updateJoinButton;
        this.battle.stagnateCallback = this.updateJoinButton;
        this.battle.endCallback = this.updateJoinButton;
        this.chatFrameElem.find('.inner').html('');
        this.$controls.html('');
    }
    this.battle.play();
    if (data && data.battlelog) {
        for (var i = 0; i < data.battlelog.length; i++) {
            this.battle.add(data.battlelog[i]);
        }
        this.battle.fastForwardTo(-1);
    }
    this.updateMe();
    if (this.chatElem) {
        this.chatFrameElem.scrollTop(this.chatElem.height());
    }
};

BattleTab.prototype.convertTeamToPS = function(team, slot) {
    this.request = this.request || {};
    this.request.side = this.request.side || {};

    this.request.side.name = players.myname();
    var id = this.request.side.id = "p" + (1+slot);
    this.request.active = [{moves:[]}];

    this.request.side.pokemon = team;

    for (var i = 0; i < this.request.side.pokemon.length; i++) {
        var pokemon = this.request.side.pokemon[i];
        pokemon.condition = this.pokemonDetails(pokemon);
        pokemon.details = this.pokemonToPS(pokemon);

        pokemon.ident = id + ": " + pokemon.name;

        if (pokemon.item) {
            if (!pokemon.itemNum) pokemon.itemNum = pokemon.item;
            pokemon.item = toId(Tools.getItemName(pokemon.itemNum));
        }
        if (pokemon.ability) {
            if (!pokemon.abilityNum) pokemon.abilityNum = pokemon.ability;
            pokemon.ability = pokemon.baseAbility = toId(Tools.getAbilityName(pokemon.abilityNum));
        }
        if (pokemon.moves) {
            if (!pokemon.moveNums) pokemon.moveNums = pokemon.moves;
            pokemon.moves = [];

            var moveDetails = [];
            for (var j = 0; j < pokemon.moveNums.length; j++) {
                pokemon.moves[j] = toId(Tools.getMoveName(pokemon.moveNums[j].move));
                moveDetails.push({
                    'move':Tools.getMoveName(pokemon.moveNums[j].move),
                    'id': pokemon.moves[j],
                    'disabled': false,
                    'maxpp': pokemon.moveNums[j].totalpp,
                    'pp': pokemon.moveNums[j].pp
                });
            }

            this.request.active[0].moves.push(moveDetails);
        }
    }
};

BattleTab.prototype.playerIds = function() {
    var array = [];
    for (var i = 0; i < this.conf.players.length; i++) {
        array.push(this.conf.players[i]);
    }
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
    if (this.conf.players[0] == players.myid || this.conf.players[1] == players.myid) {
        websocket.send("forfeit|"+this.id);
    } else {
        websocket.send("stopwatching|"+this.id);
    }
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
    var str = Tools.getSpecies(pokemon.num, pokemon.forme);
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
    var str = pokemon.totalLife ? pokemon.life + "/" + pokemon.totalLife : pokemon.percent + "/100";

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
    return str;
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

    if (this.request && params.spot%2 == this.myself) {
        this.receiveRequest(this.request);
    }
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
        function(){this.damageCause.from = "stealthrock"}],
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

BattleTab.abilitiesToPS = {
//        2 %s's Aftermath damages %f!
    2: function(params) {
        this.damageCause.from = "ability: Aftermath";
        this.damageCause.of = params.srcpoke;
    },
//        3 %s is extremely pissed off!
    3: function() {
        this.damageCause.from = "ability: Angerpoint";
    },
//    4 %s's Anticipation makes it shiver!
    4: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: Anticipation"]);
    },
//6 %f has bad dreams!
    6: function() {
        this.damageCause.from = "ability: Bad Dreams";
    },
//    9 %s's Color Change changes its type to %t!
    9: function(params) {
        this.addCommand(["-start", params.srcpoke, "typechange", Tools.getTypeName(params.type)], {from: "ability: Color Change"});
    },
//11 %s's Cute Charm infatuated %f!
    11: function(params) {
        this.addCommand(["-activate", params.foepoke, "attract"], {of: params.srcpoke});
    },
//12 %s won't flinch because of its Inner Focus!
    12: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: Inner Focus"]);
    },
//13 %s's Download activates!
    13: function() {
        this.damageCause.from = "ability: Download";
    },
//14 %s's Snow Warning whipped up a hailstorm!|%s's Drizzle made it rain!|%s's Sand Stream whipped up a sandstorm!|%s's Drought intensified the sun's rays!
//15 %s restored HP using its Dry Skin!|%s's Dry Skin hurts it!
    15: function() {
        this.damageCause.from = "ability: Dry Skin";
    },
//16 %s's Effect Spore activates!
    16: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: Effect Spore"]);
    },
//18 %s's %a activates!
    18: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: " + Tools.getAbilityName(params.other)]);
    },
//19 %s's Flash Fire raised the power of its Fire-type moves!|%s's Flash Fire made %m ineffective!
    19: function(params) {
        this.addCommand(["-start", params.srcpoke, "ability: Flash Fire"]);
    },
//    21 %s changed its type to %t!
    21: function(params) {
        this.addCommand(["-start", params.srcpoke, "typechange", Tools.getTypeName(params.type)], {from: "ability: Forecast"});
    },
//    22 %s's Forewarn makes it wary of %m!
    22: function(params) {
        this.addCommand(["-activate", params.srcpoke, "forewarn", Tools.getMoveName(params.other)]);
    },
//23 %s knows its foe holds %i because of Frisk!
    23: function(params) {
        this.addCommand(["-item", params.foepoke, Tools.getItemName(params.other)], {of: params.srcpoke, from: "ability: Frisk"});
    },
//    24 %s's Shield Dust blocked the secondary effects!
    24: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: Shield Dust"]);
    },
//29 %s's Hydration heals its status!
    29: function() {
        this.damageCause.from = "ability: Hydration";
    },
//30 %s's %a prevents its stat from being lowered!
    30: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: " + Tools.getAbilityName(params)]);
    },
//31 %s's %a prevented its stats from being lowered!
    31: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: " + Tools.getAbilityName(params)]);
    },
//32 %s's %a heals it!
    32: function(params) {
        this.damageCause.from = "ability: " + Tools.getAbilityName(params.other);
    },
//33 %s's %a cures it!|%s didn't get paralyzed because of its %a!|%s stayed awake because of its %a!|%s didn't get frozen because of its %a!|%s didn't get burnt because of its %a!|%s didn't get poisoned because of its %a!
    33: function(params) {
        if (params.part == 0) {
            this.damageCause.from = "ability: " + Tools.getAbilityName(params.other);
        } else {
            this.addCommand(["-activate", params.srcpoke, "ability: " + Tools.getAbilityName(params.other)]);
        }
    },
//34 %s intimidates %f!|%f's substitute suppressed %s's Intimidate!
    34: function(params) {
        if (params.part == 0) {
            this.addCommand(["-ability", params.srcpoke, "Intimidate"], {of: params.foepoke});
        }
    },
//    37 %s's Leaf Guard prevents it from being affected by any status from the opponent!
    37: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: Leafguard"]);
    },
//38 %s's %a took the attack!|%s's %a raised its special attack!|%s's %a made the attack useless!
    38: function(params) {
        if (params.part == 0 || params.part == 2) {
            this.addCommand(["-activate", params.srcpoke, "ability: " + Tools.getAbilityName(params.other)]);
        } else {
            this.damageCause.from = "ability: " + Tools.getAbilityName(params.other);
        }
    },
//40 %s has %a!
    40: function(params) {
        this.addCommand(["-ability", params.srcpoke, Tools.getAbilityName(params.other)]);
    },
//    41 %s's Motor Drive raises its speed!
    41: function() {
        this.damageCause.from = "ability: Motor Drive";
    },
//44 %s's Own Tempo cures its confusion!|%s's Own Tempo prevented it from getting confused!
    44: function(params) {
        if (params.part == 0) {
            this.damageCause.from = "ability: Own Tempo";
        } else {
            this.addCommand(["-activate", params.srcpoke, "ability: Own Tempo"]);
        }
    },
//    45 %s restored HP using its Poison Heal!
    45: function() {
        this.damageCause.from = "ability: Poison Heal";
    },
//    46 %s is exerting its Pressure!
    46: function(params) {
        this.addCommand(["-ability", params.srcpoke, "Pressure"]);
    },
//    47 %s's ability became Mummy!
    47: function(params) {
        this.addCommand(["-ability", params.srcpoke, "Mummy"]);
    },
//50 %s's %a hurts %f
    50: function(params) {
        this.damageCause.from = "ability: " + Tools.getAbilityName(params.ability);
        this.damageCause.of = params.srcpoke;
    },
//54 %s's Shed Skin heals its status!
    54: function() {
        this.damageCause.from = "ability: Shed Skin";
    },
//55 %s can't get it going because of it's Slow Start!|%s finally got its act together!
    55: function(params) {
        this.addCommand(["-start", params.srcpoke, "ability: Slow Start"]);
    },
//    56 %s lost some HP because of Solar Power!
    56: function() {
        this.damageCause.from = "ability: Solar Power";
    },
//    57 %s's Sound Proof blocks the attack!
    57: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: Sound Proof"]);
    },
//58 %s's Speed Boost increases its speed!|%s's Justice Heart increases its attack!
    58: function(params) {
        this.damageCause.from = (params.part == 0 ? "ability: Speed Boost": "ability: Justice Heart");
    },
//    60 %s's SteadFast increases its speed!
    60: function() {
        this.damageCause.from = "ability: SteadFast";
    },
//61 %s's Synchronize changes the status of %f!
    61: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: Synchronize"]);
    },
//66 %s traced %f's %a!
    66: function(params) {
        this.addCommand(["-ability", params.srcpoke, Tools.getAbilityName(params.other)], {from: "Ability: Trace", of: params.foepoke});
    },
//67 %s is carelessly slacking off!
    67: function(params) {
        this.addCommand(["cant", params.srcpoke, "ability: Truant"]);
    },
//    68 %s's %a raised its attack!|%s's %a made the attack useless!
    68: function(params) {
        if (params.part == 0) {
            this.damageCause.from = Tools.getAbilityName(params.other);
        } else {
            this.addCommand(["-activate", params.srcpoke, "ability: " + Tools.getAbilityName(params.other)]);
        }
    },
//    70 %s's %a absorbs the attack!|%s's %a made the attack useless!
    70: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: " + Tools.getAbilityName(params.other)]);
    },
//    71 %s's Wonder Guard evades the attack!
    71: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: " + Tools.getAbilityName(params.other)]);
    },
//74 %s lost part of its armor!
    74: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: Battle Armor"]);
    },
//    78 %s stole %f's %i!
    78: function(params) {
        this.addCommand(["-item", params.srcpoke, Tools.getItemName(params.other)], {of: params.foepoke, from: "ability: Pickpocket"});
        this.addCommand(["-enditem", params.foepoke, Tools.getItemName(params.other)], {silent: true, from: "ability: Pickpocket"});
    },
//80 %s's Defiant sharply raised its Attack!
    80: function() {
        this.damageCause.from = "ability: Defiant";
    },
//81 %s transformed into %p!
    81: function(params) {
        this.addCommand(["transform", params.srcpoke, params.foepoke]);
    },
//    85 %s avoided %f's attack thanks to its Telepathy!
    85: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: Telepathy"], {of: params.foepoke});
    },
//86 %s regains health with its Regenerator!
    86: function() {
        this.damageCause.from = "ability: Regenerator";
    },
//    88 %s's gained a %i thanks to its Harvest!
    88: function(params) {
        this.addCommand(["-item", params.srcpoke, Tools.getItemName(params.other)], {from: "ability: Harvest"});
    },
//90 %s's Miracle Skin protected it from status!
//91 %s held on thanks to Sturdy!
    91: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: Sturdy"]);
    },
//    93 %s picked up the %i!
    93: function(params) {
        this.addCommand(["-item", params.srcpoke, Tools.getItemName(params.other), {from: "ability: Pickup"}]);
    },
//    94 %s's Justice Heart raises its attack!
    94: function() {
        this.damageCause.from = "ability: Justice Heart";
    },
//95 %s's Moody sharply raises its %st!|%s's Moody lowers its %st!
    95: function() {
        this.damageCause.from = "ability: Moody";
    },
//    96 %s's Cursed Body activates!
    96: function(params) {
        this.addCommand(["-activate", params.srcpoke, "ability: Cursed Body"]);
    },
//97 %s raised its Speed in fear!
    97: function() {
        this.damageCause.from = "ability: Rattled";
    },
//    99 %s's Healing Heart cured %f's status!
    99: function(params) {
        this.damageCause.from = "ability: Healing Heart";
        this.damageCause.of = params.srcpoke;
    },
//    102 %s makes %tf's team too nervous to eat Berries!
    102: function(params) {
        this.addCommand(["-ability", params.srcpoke, Tools.getAbilityName(params.other), players.name(this.conf.players[params.foe])]);
    }
};

BattleTab.prototype.dealWithAbilitymessage = function(params) {
    var f = BattleTab.abilitiesToPS[params.ability];
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

BattleTab.prototype.add = function (log) {
    if (typeof log === 'string') log = log.split('\n');
    this.update({updates:log});
};

BattleTab.prototype.updateJoinButton = function()
{

};

BattleTab.prototype.update = function (update) {
    if (update.updates) {
        var updated = false;
        for (var i = 0; i < update.updates.length; i++) {
            if (!updated && (update.updates[i] === '')) {
                this.me.callbackWaiting = false;
                updated = true;
                this.$controls.html('');
            }
            if (update.updates[i] === 'RESET') {
                this.$foeHint.html('');
                var blog = this.chatFrameElem.find('.inner').html();
                delete this.me.side;
                this.battleEnded = false;
                this.battle = new Battle(this.battleElem, this.chatFrameElem);

/*
                if (widthClass !== 'tiny-layout') {
                    this.battle.messageSpeed = 80;
                }
*/

                this.battle.setMute(me.mute);
                this.battle.customCallback = this.callback;
                this.battle.startCallback = this.updateJoinButton;
                this.battle.stagnateCallback = this.updateJoinButton;
                this.battle.endCallback = this.updateJoinButton;
                this.chatFrameElem.find('.inner').html(blog + '<h2>NEW GAME</h2>');
                this.chatFrameElem.scrollTop(this.chatFrameElem.find('.inner').height());
                this.$controls.html('');
                this.battle.play();
                this.updateJoinButton();
                break;
            }
            if (update.updates[i].substr(0, 6) === '|chat|' || update.updates[i].substr(0, 9) === '|chatmsg|') {
                this.battle.instantAdd(update.updates[i]);
            } else {
                if (update.updates[i].substr(0,10) === '|callback|') this.$controls.html('');
                if (update.updates[i].substr(0,12) === '| callback | ') this.$controls.html('');
                this.battle.add(update.updates[i]);
            }
        }
    }
    if (update.request) {
        this.me.request = update.request;
        this.me.request.requestType = 'move';
        if (this.me.request.forceSwitch) {
            this.me.request.requestType = 'switch';
            notify({
                type: 'yourSwitch',
                room: this.id,
                user: this.battle.yourSide.name
            });
            this.notifying = true;
            updateRoomList();
        } else if (this.me.request.teamPreview) {
            this.me.request.requestType = 'team';
            notify({
                type: 'yourSwitch',
                room: this.id,
                user: this.battle.yourSide.name
            });
            this.notifying = true;
            updateRoomList();
        } else if (this.me.request.wait) {
            this.me.request.requestType = 'wait';
        } else {
            notify({
                type: 'yourMove',
                room: this.id,
                user: this.battle.yourSide.name
            });
            this.notifying = true;
            updateRoomList();
        }
        //if (this.me.callbackWaiting) this.callback();
    }
    if (typeof update.active !== 'undefined') {
        if (!update.active && this.me.side) {
            this.$controls.html('<div class="controls"><button onclick="return battles.battle(\'' + this.id + '\').formLeaveBattle()">Leave this battle</button></div>');
        }
    }
    if (update.side) {
        if (update.side === 'none') {
            $('#controls').html('');
            delete this.me.side;
        } else {
            this.me.side = update.side;
        }
    }
    if (update.sideData) {
        this.updateSide(update.sideData, update.midBattle);
    }
    this.updateMe();
};

BattleTab.prototype.updateSide = function(sideData, midBattle) {
    for (var i = 0; i < sideData.pokemon.length; i++) {
        var pokemonData = sideData.pokemon[i];
        var pokemon;
        if (i == 0) {
            pokemon = this.battle.getPokemon(''+pokemonData.ident, pokemonData.details);
            pokemon.slot = 0;
            pokemon.side.pokemon = [pokemon];
            // if (pokemon.side.active[0] && pokemon.side.active[0].ident == pokemon.ident) pokemon.side.active[0] = pokemon;
        } else if (i < this.battle.mySide.active.length) {
            pokemon = this.battle.getPokemon('new: '+pokemonData.ident, pokemonData.details);
            pokemon.slot = i;
            // if (pokemon.side.active[i] && pokemon.side.active[i].ident == pokemon.ident) pokemon.side.active[i] = pokemon;
            if (pokemon.side.active[i] && pokemon.side.active[i].ident == pokemon.ident) {
                pokemon.side.active[i].item = pokemon.item;
                pokemon.side.active[i].ability = pokemon.ability;
                pokemon.side.active[i].baseAbility = pokemon.baseAbility;
            }
        } else {
            pokemon = this.battle.getPokemon('new: '+pokemonData.ident, pokemonData.details);
        }
        pokemon.healthParse(pokemonData.condition);
        if (pokemonData.baseAbility) {
            pokemon.baseAbility = pokemonData.baseAbility;
            if (!pokemon.ability) pokemon.ability = pokemon.baseAbility;
        }
        pokemon.item = pokemonData.item;
        pokemon.moves = pokemonData.moves;
    }
    this.battle.mySide.updateSidebar();
};

BattleTab.prototype.updateMe = function () {
    return;
    if (this.meIdent.name !== me.name || this.meIdent.named !== me.named) {
        if (me.named) {
            this.chatAddElem.html('<form onsubmit="return false" class="chatbox"><label style="' + hashColor(me.userid) + '">' + sanitize(me.name) + ':</label> <textarea class="textbox" type="text" size="70" autocomplete="off" onkeypress="return battles.battle(\'' + this.id + '\').formKeyPress(event)"></textarea></form>');
            this.chatboxElem = this.chatAddElem.find('textarea');
            this.chatboxElem.autoResize({
                animateDuration: 100,
                extraSpace: 0
            });
            this.chatboxElem.focus();
        } else {
            this.chatAddElem.html('<form><button onclick="return battles.battle(\'' + this.id + '\').formRename()">Join chat</button></form>');
        }

        this.meIdent.name = me.name;
        this.meIdent.named = me.named;
    }
    var inner = this.chatFrameElem.find('.inner');
    if (inner.length) this.chatElem = inner;
    else this.chatElem = null;
    this.updateJoinButton();
};

BattleTab.prototype.formJoinBattle = function () {
    this.send('/joinbattle');
    return false;
};

BattleTab.prototype.formKickInactive = function () {
    this.send('/kickinactive');
    return false;
};

BattleTab.prototype.formForfeit = function () {
    this.send('/forfeit');
    return false;
};

BattleTab.prototype.formSaveReplay = function () {
    this.send('/savereplay');
    return false;
};

BattleTab.prototype.formRestart = function () {
    /* hideTooltip();
     this.send('/restart'); */
    this.me.request = null;
    this.battle.reset();
    this.battle.play();
    return false;
};

BattleTab.prototype.formUseMove = function (move) {
    this.hideTooltip();
    this.choices.push('move '+move);
    if (this.battle.mySide.active.length > this.choices.length) {
        this.callback(this.battle, 'move2');
        return false;
    }
    this.$controls.html('<div class="controls"><em>Waiting for opponent...</em> <button onclick="battles.battle(\'' + this.id + '\').formUndoDecision(); return false">Cancel</button></div> <br /><button onclick="battles.battle(\'' + this.id + '\').formKickInactive();return false"><small>Kick inactive player</small></button>');
    this.send('/choose '+this.choices.join(','));
    this.notifying = false;
    updateRoomList();
    return false;
};

BattleTab.prototype.formSwitchTo = function (pos) {
    this.hideTooltip();
    this.choices.push('switch '+(parseInt(pos,10)+1));
    if (this.me.request && this.me.request.requestType === 'move' && this.battle.mySide.active.length > this.choices.length) {
        this.callback(this.battle, 'move2');
        return false;
    }
    this.$controls.html('<div class="controls"><em>Waiting for opponent...</em> <button onclick="battles.battle(\'' + this.id + '\').formUndoDecision(); return false">Cancel</button></div> <br /><button onclick="battles.battle(\'' + this.id + '\').formKickInactive();return false"><small>Kick inactive player</small></button>');
    this.send('/choose '+this.choices.join(','));
    this.notifying = false;
    updateRoomList();
    return false;
};

BattleTab.prototype.formTeamPreviewSelect = function (pos) {
    pos = parseInt(pos,10);
    this.hideTooltip();
    if (this.teamPreviewHasIllusion) {
        var temp = this.teamPreviewChoice[pos];
        this.teamPreviewChoice[pos] = this.teamPreviewChoice[this.teamPreviewDone];
        this.teamPreviewChoice[this.teamPreviewDone] = temp;

        this.teamPreviewDone++;

        if (this.teamPreviewDone < this.teamPreviewChoice.length) {
            this.callback(this.battle, 'team2');
            return false;
        }
        pos = this.teamPreviewChoice.join('');
    } else {
        pos = pos+1;
    }
    this.$controls.html('<div class="controls"><em>Waiting for opponent...</em> <button onclick="battles.battle(\'' + this.id + '\').formUndoDecision(); return false">Cancel</button></div> <br /><button onclick="battles.battle(\'' + this.id + '\').formKickInactive();return false"><small>Kick inactive player</small></button>');
    this.send('/team '+(pos));
    this.notifying = false;
    updateRoomList();
    return false;
};

BattleTab.prototype.formUndoDecision = function (pos) {
    this.send('/undo');
    this.notifying = true;
    this.callback(this.battle, 'decision');
    return false;
};

BattleTab.prototype.formRename = function () {
    overlay('rename');
    return false;
};
BattleTab.prototype.formLeaveBattle = function () {
    this.hideTooltip();
    this.send('/leavebattle');
    this.notifying = false;
    updateRoomList();
    return false;
};

BattleTab.prototype.formSelectSwitch = function () {
    this.hideTooltip();
    this.$controls.find('.controls').attr('class', 'controls switch-controls');
    return false;
};

BattleTab.prototype.formSelectMove = function () {
    this.hideTooltip();
    this.$controls.find('.controls').attr('class', 'controls move-controls');
    return false;
};

function updateRoomList(){}
function overlay(){}

BattleTab.prototype.hideTooltip = function() {
    $('#tooltipwrapper').html('');
};

BattleTab.prototype.tooltipAttrs = function(thing, type, ownHeight, isActive) {
    return ' onmouseover="room.showTooltip(\'' + Tools.escapeHTML(''+thing, true) + '\',\'' + type + '\', this, ' + (ownHeight ? 'true' : 'false') + ', ' + (isActive ? 'true' : 'false') + ')" onmouseout="room.hideTooltip()" onmouseup="room.hideTooltip()"';
};

BattleTab.prototype.showTooltip = function(thing, type, elem, ownHeight, isActive) {
    var offset = {
        left: 150,
        top: 500
    };
    if (elem) offset = $(elem).offset();
    var x = offset.left - 2;
    if (elem) {
        if (ownHeight) offset = $(elem).offset();
        else offset = $(elem).parent().offset();
    }
    var y = offset.top - 5;

    if (x > 335) x = 335;
    if (y < 140) y = 140;
    if (!$('#tooltipwrapper').length) $(document.body).append('<div id="tooltipwrapper"></div>');
    $('#tooltipwrapper').css({
        left: x,
        top: y
    });

    var text = '';
    switch (type) {
        case 'move':
            var move = Tools.getMove(thing);
            if (!move) return;
            var basePower = move.basePower;
            if (!basePower) basePower = '&mdash;';
            var accuracy = move.accuracy;
            if (!accuracy || accuracy === true) accuracy = '&mdash;';
            else accuracy = '' + accuracy + '%';
            text = '<div class="tooltipinner"><div class="tooltip">';
            text += '<h2>' + move.name + '<br />'+Tools.getTypeIcon(move.type)+' <img src="' + Tools.resourcePrefix + 'sprites/categories/' + move.category + '.png" alt="' + move.category + '" /></h2>';
            text += '<p>Base power: ' + basePower + '</p>';
            text += '<p>Accuracy: ' + accuracy + '</p>';
            if (move.desc) {
                text += '<p class="section">' + move.desc + '</p>';
            }
            text += '</div></div>';
            break;

        case 'pokemon':
            var pokemon = this.battle.getPokemon(thing);
            if (!pokemon) return;
        //fallthrough
        case 'sidepokemon':
            if (!pokemon) pokemon = this.battle.mySide.pokemon[parseInt(thing)];
            text = '<div class="tooltipinner"><div class="tooltip">';
            text += '<h2>' + pokemon.getFullName() + (pokemon.level !== 100 ? ' <small>L' + pokemon.level + '</small>' : '') + '<br />';

            var types = pokemon.types;
            var template = pokemon;
            if (pokemon.volatiles.transform && pokemon.volatiles.formechange) {
                template = Tools.getTemplate(pokemon.volatiles.formechange[2]);
                types = template.types;
                text += '<small>(Transformed into '+pokemon.volatiles.formechange[2]+')</small><br />';
            } else if (pokemon.volatiles.formechange) {
                template = Tools.getTemplate(pokemon.volatiles.formechange[2]);
                types = template.types;
                text += '<small>(Forme: '+pokemon.volatiles.formechange[2]+')</small><br />';
            }
            if (pokemon.volatiles.typechange) {
                text += '<small>(Type changed)</small><br />';
                types = [pokemon.volatiles.typechange[2]];
            }
            if (types) {
                text += Tools.getTypeIcon(types[0]);
                if (types[1]) {
                    text += ' '+Tools.getTypeIcon(types[1]);
                }
            } else {
                text += 'Types unknown';
            }
            text += '</h2>';
            var exacthp = '';
            if (pokemon.maxhp != 100 && pokemon.maxhp != 1000 && pokemon.maxhp != 48) exacthp = ' ('+pokemon.hp+'/'+pokemon.maxhp+')';
            if (pokemon.maxhp == 48 && isActive) exacthp = ' <small>('+pokemon.hp+'/'+pokemon.maxhp+' pixels)</small>';
            text += '<p>HP: ' + pokemon.hpDisplay() +exacthp+(pokemon.status?' <span class="status '+pokemon.status+'">'+pokemon.status.toUpperCase()+'</span>':'')+'</p>';
            if (!pokemon.baseAbility && !pokemon.ability) {
                text += '<p>Possible abilities: ' + Tools.getAbility(template.abilities['0']).name;
                if (template.abilities['1']) text += ', ' + Tools.getAbility(template.abilities['1']).name;
                if (template.abilities['DW']) text += ', ' + Tools.getAbility(template.abilities['DW']).name;
                text += '</p>';
            } else if (pokemon.ability) {
                text += '<p>Ability: ' + Tools.getAbility(pokemon.ability).name + '</p>';
            } else if (pokemon.baseAbility) {
                text += '<p>Ability: ' + Tools.getAbility(pokemon.baseAbility).name + '</p>';
            }
            if (pokemon.item) {
                text += '<p>Item: ' + Tools.getItem(pokemon.item).name + '</p>';
            }
            if (pokemon.moves && pokemon.moves.length && (!isActive || isActive === 'foe')) {
                text += '<p class="section">';
                for (var i = 0; i < pokemon.moves.length; i++) {
                    var name = Tools.getMove(pokemon.moves[i]).name;
                    text += '&#8901; ' + name + '<br />';
                }
                text += '</p>';
            }
            text += '</div></div>';
            break;
    }
    $('#tooltipwrapper').html(text).appendTo(document.body);
};

BattleTab.prototype.updateControlsForPlayer = function() {
    var battle = this.battle;

    this.callbackWaiting = true;
    var active = this.battle.mySide.active[0];
    if (!active) active = {};

    var act = '';
    var switchables = [];
    if (this.request) {
        // TODO: investigate when to do this
        this.updateSide(this.request.side);

        act = this.request.requestType;
        if (this.request.side) {
            switchables = this.battle.mySide.pokemon;
        }
    }

    var type = '';
    var moveTarget = '';
    if (this.choice) {
        type = this.choice.type;
        moveTarget = this.choice.moveTarget;
        if (this.choice.waiting) act = '';
    }
    // The choice object:
    // !this.choice = nothing has been chosen
    // this.choice.choices = array of choice strings
    // this.choice.switchFlags = dict of pokemon indexes that have a switch pending

    switch (act) {
        case 'move':
        {
            if (!this.choice) {
                this.choice = {
                    choices: [],
                    switchFlags: {}
                }
                while (switchables[this.choice.choices.length] && switchables[this.choice.choices.length].fainted) {
                    this.choice.choices.push('pass');
                }
            }
            var pos = this.choice.choices.length - (type === 'movetarget'?1:0);

            // hp bar
            var hpbar = '';
            if (switchables[pos].hp * 5 / switchables[pos].maxhp < 1) {
                hpbar = '<small class="critical">';
            } else if (switchables[pos].hp * 2 / switchables[pos].maxhp < 1) {
                hpbar = '<small class="weak">';
            } else {
                hpbar = '<small class="healthy">';
            }
            hpbar += ''+switchables[pos].hp+'/'+switchables[pos].maxhp+'</small>';

            var active = this.request;
            if (active.active) active = active.active[pos];
            var moves = active.moves;
            var trapped = active.trapped;
            this.finalDecision = active.maybeTrapped || false;
            if (this.finalDecision) {
                for (var i = pos + 1; i < this.battle.mySide.active.length; ++i) {
                    var p = this.battle.mySide.active[i];
                    if (p && !p.fainted) {
                        this.finalDecision = false;
                    }
                }
            }

            var controls = '<div class="controls"><div class="whatdo">';
            if (type === 'move2' || type === 'movetarget') {
                controls += '<button name="clearChoice">Back</button> ';
            }

            // Target selector

            if (type === 'movetarget') {
                controls += 'At who? '+hpbar+'</div>';
                controls += '<div class="switchmenu" style="display:block">';

                var myActive = this.battle.mySide.active;
                var yourActive = this.battle.yourSide.active;
                var yourSlot = yourActive.length-1-pos;
                for (var i = yourActive.length-1; i >= 0; i--) {
                    var pokemon = yourActive[i];

                    var disabled = false;
                    if (moveTarget === 'adjacentAlly' || moveTarget === 'adjacentAllyOrSelf') {
                        disabled = true;
                    } else if (moveTarget === 'normal' || moveTarget === 'adjacentFoe') {
                        if (Math.abs(yourSlot-i) > 1) disabled = true;
                    }

                    if (!pokemon) {
                        controls += '<button disabled></button> ';
                    } else if (disabled || pokemon.zerohp) {
                        controls += '<button disabled' + this.tooltipAttrs(pokemon.getIdent(), 'pokemon', true, 'foe') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
                    } else {
                        var posString = '';
                        controls += '<button name="chooseMoveTarget" value="'+(i+1)+'"' + this.tooltipAttrs(pokemon.getIdent(), 'pokemon', true, 'foe') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
                    }
                }
                controls += '<div style="clear:both"></div> </div><div class="switchmenu" style="display:block">';
                for (var i = 0; i < myActive.length; i++) {
                    var pokemon = myActive[i];

                    var disabled = false;
                    if (moveTarget === 'adjacentFoe') {
                        disabled = true;
                    } else if (moveTarget === 'normal' || moveTarget === 'adjacentAlly' || moveTarget === 'adjacentAllyOrSelf') {
                        if (Math.abs(pos-i) > 1) disabled = true;
                    }
                    if (moveTarget !== 'adjacentAllyOrSelf' && pos == i) disabled = true;

                    if (!pokemon) {
                        controls += '<button disabled="disabled"></button> ';
                    } else if (disabled || pokemon.zerohp) {
                        controls += '<button disabled="disabled"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
                    } else {
                        controls += '<button name="chooseMoveTarget" value="' + (-(i+1)) + '"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
                    }
                }
                controls += '</div>';
                controls += '</div>';
                this.$controls.html(controls);
                break;
            }

            // Move chooser

            controls += 'What will <strong>' + Tools.escapeHTML(switchables[pos].name) + '</strong> do? '+hpbar+'</div>';
            var hasMoves = false;
            var hasDisabled = false;
            controls += '<div class="movecontrols"><div class="moveselect"><button name="selectMove">Attack</button></div><div class="movemenu">';
            var movebuttons = '';
            for (var i = 0; i < moves.length; i++) {
                var moveData = moves[i];
                var move = Tools.getMove(moves[i].move);
                if (!move) {
                    move = {
                        name: moves[i].move,
                        id: moves[i].move,
                        type: ''
                    };
                }
                var name = move.name;
                var pp = moveData.pp + '/' + moveData.maxpp;
                if (!moveData.maxpp) pp = '&ndash;';
                if (move.id === 'Struggle' || move.id === 'Recharge') pp = '&ndash;';
                if (move.id === 'Recharge') move.type = '&ndash;';
                if (name.substr(0, 12) === 'Hidden Power') name = 'Hidden Power';
                if (moveData.disabled) {
                    movebuttons += '<button disabled="disabled"' + this.tooltipAttrs(moveData.move, 'move') + '>';
                    hasDisabled = true;
                } else {
                    movebuttons += '<button class="type-' + move.type + '" name="chooseMove" value="' + Tools.escapeHTML(moveData.move) + '"' + this.tooltipAttrs(moveData.move, 'move') + '>';
                    hasMoves = true;
                }
                movebuttons += name + '<br /><small class="type">' + move.type + '</small> <small class="pp">' + pp + '</small>&nbsp;</button> ';
            }
            if (!hasMoves) {
                controls += '<button class="movebutton" name="chooseMove" value="Struggle">Struggle<br /><small class="type">Normal</small> <small class="pp">&ndash;</small>&nbsp;</button> ';
            } else {
                controls += movebuttons;
            }
            controls += '<div style="clear:left"></div>';
            controls += '</div></div><div class="switchcontrols"><div class="switchselect"><button name="selectSwitch">Switch</button></div><div class="switchmenu">';
            if (trapped) {
                controls += '<em>You are trapped and cannot switch!</em>';
            } else {
                controls += '';
                for (var i = 0; i < switchables.length; i++) {
                    var pokemon = switchables[i];
                    pokemon.name = pokemon.ident.substr(4);
                    if (pokemon.zerohp || i < this.battle.mySide.active.length || this.choice.switchFlags[i]) {
                        controls += '<button disabled' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
                    } else {
                        controls += '<button name="chooseSwitch" value="' + i + '"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
                    }
                }
                if (this.finalDecision) {
                    controls += '<em style="display:block;clear:both">You <strong>might</strong> be trapped, so you won\'t be able to cancel a switch!</em><br/>';
                }
            }
            controls += '</div></div></div>';
            this.$controls.html(controls);
        }
            break;

        case 'switch':
            this.finalDecision = false;
            if (!this.choice) {
                this.choice = {
                    choices: [],
                    switchFlags: {}
                };
                if (this.request.forceSwitch !== true) {
                    while (!this.request.forceSwitch[this.choice.choices.length] && this.choice.choices.length < 6) this.choice.choices.push('pass');
                }
            }
            var pos = this.choice.choices.length;
            var controls = '<div class="controls"><div class="whatdo">';
            if (type === 'switch2') {
                controls += '<button name="clearChoice">Back</button> ';
            }
            controls += 'Switch <strong>'+Tools.escapeHTML(switchables[pos].name)+'</strong> to:</div>';
            controls += '<div class="switchcontrols"><div class="switchselect"><button name="selectSwitch">Switch</button></div><div class="switchmenu">';
            for (var i = 0; i < switchables.length; i++) {
                var pokemon = switchables[i];
                if (pokemon.zerohp || i < this.battle.mySide.active.length || this.choice.switchFlags[i]) {
                    controls += '<button disabled' + this.tooltipAttrs(i, 'sidepokemon') + '>';
                } else {
                    controls += '<button name="chooseSwitch" value="' + i + '"' + this.tooltipAttrs(i, 'sidepokemon') + '>';
                }
                controls += '<span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
            }
            controls += '</div></div></div>';
            this.$controls.html(controls);
            this.selectSwitch();
            break;

        case 'team':
            var controls = '<div class="controls"><div class="whatdo">';
            if (!this.choice || !this.choice.done) {
                this.choice = {
                    teamPreview: [1,2,3,4,5,6].slice(0,switchables.length),
                    done: 0,
                    count: 0
                }
                if (this.battle.gameType === 'doubles') {
                    this.choice.count = 2;
                }
                controls += 'How will you start the battle?</div>';
                controls += '<div class="switchcontrols"><div class="switchselect"><button name="selectSwitch">Choose Lead</button></div><div class="switchmenu">';
                for (var i = 0; i < switchables.length; i++) {
                    var pokemon = switchables[i];
                    if (i >= 6) {
                        break;
                    }
                    if (toId(pokemon.baseAbility) === 'illusion') {
                        this.choice.count = 6;
                    }
                    controls += '<button name="chooseTeamPreview" value="'+i+'"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
                }
                if (this.battle.teamPreviewCount) this.choice.count = parseInt(this.battle.teamPreviewCount,10);
                controls += '</div>';
            } else {
                controls += '<button name="clearChoice">Back</button> What about the rest of your team?</div>';
                controls += '<div class="switchcontrols"><div class="switchselect"><button name="selectSwitch">Choose a pokemon for slot '+(this.choice.done+1)+'</button></div><div class="switchmenu">';
                for (var i = 0; i < switchables.length; i++) {
                    var pokemon = switchables[this.choice.teamPreview[i]-1];
                    if (i >= 6) {
                        break;
                    }
                    if (i < this.choice.done) {
                        controls += '<button disabled="disabled"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
                    } else {
                        controls += '<button name="chooseTeamPreview" value="'+i+'"' + this.tooltipAttrs(this.choice.teamPreview[i]-1, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
                    }
                }
                controls += '</div>';
            }
            controls += '</div></div>';
            this.$controls.html(controls);
            this.selectSwitch();
            break;

        default:
            var buf = '<div class="controls"><p><em>Waiting for opponent...</em> ';
            if (this.choice && this.choice.waiting && !this.finalDecision) {
                buf += '<button name="undoChoice">Cancel</button>';
            }
            buf += '</p>';
            if (this.battle.kickingInactive) {
                buf += '<p class="timer"><button name="setTimer" value="off"><small>Stop timer</small></button></p>';
            } else {
                buf += '<p class="timer"><button name="setTimer" value="on"><small>Start timer</small></button></p>';
            }
            buf += '</div>';
            this.$controls.html(buf);
            break;
    }
};

BattleTab.prototype.receiveRequest = function(request) {
    if (!request) {
        this.side = '';
        return;
    }
    request.requestType = 'move';

    if (request.forceSwitch) {
        request.requestType = 'switch';
    } else if (request.teamPreview) {
        request.requestType = 'team';
    } else if (request.wait) {
        request.requestType = 'wait';
    }

    this.choice = null;
    this.request = request;
    if (request.side) {
        this.updateSideLocation(request.side, true);
    }
    this.notifyRequest();
    this.updateControls();
};

BattleTab.prototype.notifyRequest = function() {
    var oName = this.battle.yourSide.name;
    if (oName) oName = " against "+oName;
    switch (this.request.requestType) {
        case 'move':
            this.notify("Your move!", "Move in your battle"+oName, 'choice');
            break;
        case 'switch':
            this.notify("Your switch!", "Switch in your battle"+oName, 'choice');
            break;
        case 'team':
            this.notify("Team preview!", "Choose your team order in your battle"+oName, 'choice');
            break;
    }
};

BattleTab.prototype.notify = function(title, msg, type, once) {
    /* supposed to do an alert (browser notification */
};

BattleTab.prototype.updateSideLocation = function(sideData, midBattle) {
    if (!sideData.id) return;
    this.side = sideData.id;
    if (this.battle.sidesSwitched !== !!(this.side === 'p2')) {
        sidesSwitched = true;
        this.battle.reset(true);
        this.battle.switchSides();
        if (midBattle) {
            this.battle.fastForwardTo(-1);
        } else {
            this.battle.play();
        }
        this.$chat = this.$chatFrame.find('.inner');
    }
};

BattleTab.prototype.updateControls = function() {
    if (this.$join) {
        this.$join.remove();
        this.$join = null;
    }

    var controlsShown = this.controlsShown;
    this.controlsShown = false;

    if (this.battle.playbackState === 5) {

        // battle is seeking
        this.$controls.html('');
        return;

    } else if (this.battle.playbackState === 2 || this.battle.playbackState === 3) {

        // battle is playing or paused
        this.$controls.html('<p><button name="skipTurn">Skip turn <i class="icon-step-forward"></i></button></p>');
        return;

    }

    // tooltips
    var myActive = this.battle.mySide.active;
    var yourActive = this.battle.yourSide.active;
    var buf = '';
    if (yourActive[1]) {
        buf += '<div style="position:absolute;top:85px;left:320px;width:90px;height:100px;"' + this.tooltipAttrs(yourActive[1].getIdent(), 'pokemon', true, 'foe') + '></div>';
    }
    if (yourActive[0]) {
        buf += '<div style="position:absolute;top:90px;left:390px;width:100px;height:100px;"' + this.tooltipAttrs(yourActive[0].getIdent(), 'pokemon', true, 'foe') + '></div>';
    }
    if (myActive[0]) {
        buf += '<div style="position:absolute;top:210px;left:130px;width:180px;height:160px;"' + this.tooltipAttrs(myActive[0].getIdent(), 'pokemon', true, true) + '></div>';
    }
    if (myActive[1]) {
        buf += '<div style="position:absolute;top:210px;left:270px;width:160px;height:160px;"' + this.tooltipAttrs(myActive[1].getIdent(), 'pokemon', true, true) + '></div>';
    }
    this.$foeHint.html(buf);

    if (this.battle.done) {

        // battle has ended
        this.$controls.html('<div class="controls"><p><em><button name="instantReplay"><i class="icon-undo"></i> Instant Replay</button> <button name="saveReplay"><i class="icon-upload"></i> Share replay</button></p></div>');

    } else if (!this.battle.mySide.initialized || !this.battle.yourSide.initialized) {

        // empty battle

        if (this.side) {
            if (this.battle.kickingInactive) {
                this.$controls.html('<div class="controls"><p><button name="setTimer" value="off"><small>Stop timer</small></button> <small>&larr; Your opponent has disconnected. This will give them more time to reconnect.</small></p></div>');
            } else {
                this.$controls.html('<div class="controls"><p><button name="setTimer" value="on"><small>Claim victory</small></button> <small>&larr; Your opponent has disconnected. Click this if they don\'t reconnect.</small></p></div>');
            }
        } else {
            this.$controls.html('<p><em>Waiting for players...</em></p>');
            this.$join = $('<div class="playbutton"><button name="joinBattle">Join Battle</button></div>');
            this.$battle.append(this.$join);
        }

    } else if (this.side) {

        // player
        if (!this.request) {
            if (this.battle.kickingInactive) {
                this.$controls.html('<div class="controls"><p><button name="setTimer" value="off"><small>Stop timer</small></button> <small>&larr; Your opponent has disconnected. This will give them more time to reconnect.</small></p></div>');
            } else {
                this.$controls.html('<div class="controls"><p><button name="setTimer" value="on"><small>Claim victory</small></button> <small>&larr; Your opponent has disconnected. Click this if they don\'t reconnect.</small></p></div>');
            }
        } else {
            this.controlsShown = true;
            if (!controlsShown || (this.choice && this.choice.waiting)) {
                this.updateControlsForPlayer();
            }
        }

    } else {

        // full battle
        this.$controls.html('<p><em>Waiting for players...</em></p>');

    }

    // This intentionally doesn't happen if the battle is still playing,
    // since those early-return.
    app.topbar.updateTabbar();
};