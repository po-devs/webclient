

/* dealWithXxxx functions are all called from dealWithCommand */
BattleTab.prototype.dealWithTurn = function(params) {
    this.print("<h2>Turn " + params.turn + "</h2>")
};

BattleTab.prototype.dealWithBlank = function(params) {
    this.print("")
};

BattleTab.prototype.dealWithSend = function(params) {
    var poke = params.pokemon;

    if (this.isBattle()) {
        if (params.spot == this.myself) {
            var tpoke = this.request.side.pokemon[0];
            this.request.side.pokemon[0] = this.request.side.pokemon[params.slot];
            this.request.side.pokemon[params.slot] = tpoke;

            push_properties(this.request.side.pokemon[0], poke);
        }
    }
    /* Stores the pokemon in field memory */
    this.pokes[params.spot] = poke;

    this.addCommand(["switch", this.spotToPlayer(params.spot) + "a: " + poke.name, this.pokemonToPS(poke), this.pokemonDetails(poke)]);
};

BattleTab.prototype.dealWithTeampreview = function(params) {
    var team = params.team;
    var player = params.player;

    for (var i = 0; i < team.length; i++) {
        this.addCommand(["poke", this.spotToPlayer(player), this.pokemonToPS(team[i])]);
    }

    /* triggers the display */
    this.addCommand(["teampreview"]);

    /* triggers the choice */
    this.request.teamPreview = true;
    this.receiveRequest(this.request);
};

BattleTab.prototype.dealWithPpchange = function(params) {
    this.request.side.pokemon[Math.floor(params.spot/2)].moveDetails[params.move].pp = params.pp;
};

BattleTab.prototype.dealWithOfferchoice = function(params) {
    this.choices[params.choice.slot] = params.choice;

    /* Force the user to switch */
    if(params.choice.attack)
        this.request.forceSwitch = false;
    else
        this.request.forceSwitch = true;
};

BattleTab.prototype.dealWithKo = function(params) {
    this.addCommand(["faint", this.spotToPlayer(params.spot)]);
};

BattleTab.prototype.dealWithMove = function(params) {
    this.addCommand(["move", this.spotToPlayer(params.spot), Tools.getMoveName(params.move)]);
};

BattleTab.prototype.dealWithHpchange = function(params) {
    /* Checks & updates the pokemon in memory's life percent */
    var current = this.pokes[params.spot].life || this.pokes[params.spot].percent;
    if (this.pokes[params.spot].life) {
        this.pokes[params.spot].life = params.newHP;
        this.pokes[params.spot].percent = params.newHP/this.pokes[params.spot].totalLife;
        this.request.side.pokemon[0].condition = this.pokemonDetails(this.pokes[params.spot]);
    } else {
        this.pokes[params.spot].percent = params.newHP;
    }

    /* Is it healing or damage? */
    if (params.newHP > current || params.newHP == (this.pokes[params.spot].totalLife || 100)) {
        this.addCommand(["-heal", this.spotToPlayer(params.spot), this.pokemonDetails(this.pokes[params.spot])], this.damageCause);
    } else {
        this.addCommand(["-damage", this.spotToPlayer(params.spot), this.pokemonDetails(this.pokes[params.spot])], this.damageCause);
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
    this.print("<strong>Tier: </strong> " + params.tier);
};

BattleTab.prototype.dealWithRated = function(params) {
    this.print("<strong>Rule: </strong> " + (params.rated ? "Rated" : "Unrated"));

    /* Print the clauses, convert flags to actual clause numbers */
    var clauses = this.conf.clauses;
    var i = 0;

    while (clauses > 0) {
        if (clauses % 2) {
            this.print("<strong>Rule: </strong> " + BattleTab.clauses[i]);
        }
        clauses = Math.floor(clauses/2);
        i = i+1;
    }
};

BattleTab.prototype.dealWithChoiceselection = function(params) {
    this.addCommand(["callback", "decision"]);

    if (this.request && params.spot%2 == this.myself) {
        this.loadChoices();
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
