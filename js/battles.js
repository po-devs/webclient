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
    this.request.active = [{}];

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
            pokemon.moveDetails = [];

            for (var j = 0; j < pokemon.moveNums.length; j++) {
                pokemon.moves[j] = toId(Tools.getMoveName(pokemon.moveNums[j].move));
                pokemon.moveDetails[j] = {
                    'move':Tools.getMoveName(pokemon.moveNums[j].move),
                    'id': pokemon.moves[j],
                    'disabled': false,
                    'maxpp': pokemon.moveNums[j].totalpp,
                    'pp': pokemon.moveNums[j].pp
                };
            }
        }
    }
};

/* Loads the choices in PS format in this.request.active[x], x being the pokemon slot */
BattleTab.prototype.loadChoices = function() {
    this.request.active[0].moves = this.request.side.pokemon[0].moveDetails;
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

BattleTab.weathers = {
    0: "none",
    1: "hail",
    2: "raindance",
    3: "sandstorm",
    4: "sunnyday"
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

loadjscssfile("js/battle/commandshandling.js", "js");