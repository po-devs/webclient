geninfo = {}; pokeinfo = {}; genderinfo = {}; natureinfo = {}; moveinfo = {}; categoryinfo = {}; statinfo = {}; statusinfo = {}; iteminfo = {}; typeinfo = {}; abilityinfo = {};
var lastgen;

for (var i in pokedex.generations.generations) {
    lastgen = {num: i};
}

var getGen = function(gen) {
    gen = gen || lastgen;
    if (typeof gen != "object") {
        gen = {"num": gen};
    }
    
    if (gen.num < 1 || gen.num > lastgen.num) {
        gen = lastgen;
    }

    return gen;
};

geninfo.list = function() {
    return pokedex.generations.generations;
};

geninfo.name = function(gen) {
    return pokedex.generations.generations[gen];
};

geninfo.versionList = function() {
    return pokedex.gens.versions;
};

geninfo.version = function(gen, subgen) {
    return pokedex.gens.versions[gen][subgen];
};

pokeinfo.toNum = function(poke) {
    if (typeof poke == "object") {
        return poke.num + ( (poke.forme || 0) << 16);
    } else {
        return poke;
    }
};

pokeinfo.sprite = function(poke, params) {
    params = params || {};
    var gen = getGen(params.gen || poke.gen);
    var back = params.back || false;

    return pokedex.generations.options[gen.num].sprite_folder + (gen.num == 5 ? "animated/" : "" ) + (back ? "back/" : "")
        + (poke.shiny ? "shiny/" : "") + (poke.female ? "female/" : "")
        + (gen.num == 5 ? ("00"+poke.num).slice(-3) : poke.num ) + (poke.forme ? "-" + poke.forme : "")
        + (gen.num == 5 ? ".gif" : ".png");
};

pokeinfo.icon = function(poke) {
    return "http://pokemon-online.eu/images/poke_icons/" + poke.num + (poke.forme ? "-" + poke.forme : "") + ".png";
};

pokeinfo.list = function() {
    return pokedex.pokes.pokemons;
};

pokeinfo.name = function(poke) {
    return pokedex.pokes.pokemons[this.toNum(poke)];
};

pokeinfo.genderList = function() {
    return pokedex.pokes.gender;
};

pokeinfo.gender = function(poke) {
    if (!pokedex.pokes.gender[this.toNum(poke)]) {
        poke %= 65536;
    }
    return pokedex.pokes.gender[this.toNum(poke)];
};

pokeinfo.heightList = function() {
    return pokedex.pokes.height;
};

pokeinfo.height = function(poke) {
if (!pokedex.pokes.height[this.toNum(poke)]) {
        poke %= 65536;
    }
    return pokedex.pokes.height[this.toNum(poke)];
};

pokeinfo.weightList = function() {
    return pokedex.pokes.weight;
};

pokeinfo.weight = function(poke) {
if (!pokedex.pokes.weight[this.toNum(poke)]) {
        poke %= 65536;
    }
    return pokedex.pokes.weight[this.toNum(poke)];
};

pokeinfo.statList = function(poke) {
    if (!poke) {
        return pokedex.pokes.stats;
    }
    else {
        return pokedex.pokes.stats[this.toNum(poke)];
    }
};

pokeinfo.stat = function(poke, stat) {
    if (!pokedex.pokes.stats[this.toNum(poke)]) {
        poke %= 65536;
    }
    return pokedex.pokes.stats[this.toNum(poke)][stat];
};

pokeinfo.allMovesList = function(gen) {
    gen = getGen(gen);
    return pokedex.pokes.all_moves[gen.num];
};

pokeinfo.allMoves = function(poke, gen) {
    gen = getGen(gen);
    if (!pokedex.pokes.all_moves[gen.num][this.toNum(poke)]) {
        poke %= 65536;
    }
    var moves = pokedex.pokes.all_moves[gen.num][this.toNum(poke)];
    if (!Array.isArray(moves)) {
        moves = [moves];
    }
    return moves;
};

pokeinfo.typesList = function(gen) {
    gen = getGen(gen);
    return {
        1: pokedex.pokes.type1[gen.num],
        2: pokedex.pokes.type2[gen.num]
    };
};

pokeinfo.types = function(poke, gen) {
    gen = getGen(gen);
    var id = this.toNum(poke);
    if (!pokedex.pokes.type1[gen.num][id]) {
        id %= 65536;
    }
    var type1 = pokedex.pokes.type1[gen.num][id];
    var type2 = pokedex.pokes.type2[gen.num][id];
    var types = [type1];
    if (type2 != 18) {
        types.push(type2);
    }
    return types;
};

pokeinfo.abilityList = function(gen) {
    gen = getGen(gen);
    return {
        1: pokedex.pokes.ability1[gen.num],
        2: pokedex.pokes.ability2[gen.num],
        3: pokedex.pokes.ability3[gen.num]
    };
};

pokeinfo.ability = function(poke, hidden, gen) {
    gen = getGen(gen);
    var id = this.toNum(poke);
    if (!pokedex.pokes.ability1[gen.num][id]) {
        id %= 65536;
    }
    if (hidden) {
        return pokedex.pokes.ability3[gen.num][id];
    }
    else {
        var ability1 = pokedex.pokes.ability1[gen.num][id];
        var ability2 = pokedex.pokes.ability2[gen.num][id];
        var abilities = [].push(ability1);
        if (ability2) {
            abilities.push(ability2);
        }
        return abilities;
    }
};

pokeinfo.releasedList = function(gen) {
    gen = getGen(gen);
    return pokedex.pokes.released[gen.num];
};

pokeinfo.released = function(poke, gen) {
    gen = getGen(gen);
    return pokedex.pokes.released[gen.num].hasOwnProperty(this.toNum(poke));
};

pokeinfo.getSpecieId = function(poke) {
    return poke & ((1 << 16) - 1);
};

pokeinfo.getFormId = function(poke) {
    return Math.floor(poke / 65536);
};

pokeinfo.calculateStat = function(infos) {
    if(infos.stat_id == this.default_settings.hp_id) {
        if(infos.generation > 2) {
            return Math.floor(Math.floor((infos.stat_ivs + (2 * infos.base_stat) + Math.floor(infos.stat_evs/4) + 100) * infos.level)/100) + 10;
        }
        else {
            return Math.floor(((infos.stat_ivs + infos.base_stat + Math.sqrt(65535)/8 + 50) * infos.level)/50 + 10);
        }
    }
    else {
        if(infos.generation > 2) {
            return Math.floor(Math.floor(((infos.stat_ivs + (2 * infos.base_stat) + Math.floor(infos.stat_evs/4)) * infos.level)/100 + 5)*infos.nature);
        }
        else {
            return Math.floor(Math.floor((infos.stat_ivs + infos.base_stat + Math.sqrt(65535)/8) * infos.level)/50 + 5);
        }
    }
};

genderinfo.list = function() {
    return pokedex.genders.genders;
};

genderinfo.name = function(gender) {
    return pokedex.genders.genders[gender];
};

natureinfo.list = function() {
    return pokedex.natures.natures;
};

natureinfo.name = function(nature) {
    return pokedex.natured.natures[nature];
};

natureinfo.getNatureEffect = function(nature_id, stat_id) {
    var arr = {0:0, 1:1, 2:2, 3:4, 4:5, 5:3};
    return (10+(-(nature_id%5 == arr[stat_id]-1) + (Math.floor(nature_id/5) == arr[stat_id]-1)))/10;
};

moveinfo.list = function() {
    return pokedex.moves.moves;
};

moveinfo.name = function(move) {
    return pokedex.moves.moves[move];
};

moveinfo.accuracyList = function(gen) {
    gen = getGen(gen);
    return pokedex.moves.accuracy[gen.num];
};

moveinfo.accuracy = function(move, gen) {
    gen = getGen(gen);
    return pokedex.moves.accuracy[gen.num][move];
};

moveinfo.damageClassList = function(gen) {
    gen = getGen(gen);
    return pokedex.moves.damage_class[gen.num];
};

moveinfo.damageClass = function(move, gen) {
    gen = getGen(gen);
    return pokedex.moves.damage_class[gen.num][move];
};

moveinfo.effectList = function(gen) {
    gen = getGen(gen);
    return pokedex.moves.effect[gen.num];
};

moveinfo.effect = function(move, gen) {
    gen = getGen(gen);
    return pokedex.moves.effect[gen.num][move];
};

moveinfo.powerList = function(gen) {
    gen = getGen(gen);
    return pokedex.moves.power[gen.num];
};

moveinfo.power = function(move, gen) {
    gen = getGen(gen);
    return pokedex.moves.power[gen.num][move];
};

moveinfo.messageList = function() {
    return pokedex.moves.move_message;
};

moveinfo.ppList = function(gen) {
    gen = getGen(gen);
    return pokedex.moves.pp[gen.num];
};

moveinfo.pp = function(move, gen) {
    gen = getGen(gen);
    return pokedex.moves.pp[gen.num][move];
};

moveinfo.typeList = function(gen) {
    gen = getGen(gen);
    return pokedex.moves.type[gen.num];
};

moveinfo.type = function(move, gen) {
    gen = getGen(gen);
    return pokedex.moves.type[gen.num][move];
};

moveinfo.message = function(move, part) {
    var messages = pokedex.moves.move_message[move];

    if (!messages) {
        return;
    }

    var parts = messages.split('|');
    if (part >= 0 && part < parts.length) {
        return parts[part];
    }
};

categoryinfo.list = function() {
    return pokedex.categories.categories;
};

categoryinfo.name = function(category) {
    return pokedex.categories.categories[category];
};

iteminfo.list = function() {
    var list = pokedex.items.items;
    for (var i in pokedex.items.berries) {
        list[i + 8000] = pokedex.items.berries[i];
    }
    return list;
};

iteminfo.name = function(item) {
    if (item >= 8000) {
        return pokedex.items.berries[item-8000];
    } else {
        return pokedex.items.items[item];
    }
};

iteminfo.releasedList = function(gen) {
    gen = getGen(gen);
    var list = pokedex.items.released_items[gen];
    for (var i in pokedex.items.released_berries[gen]) {
        list[y + 8000] = pokedex.items.released_berries[gen][i];
    }
    return list;
};

iteminfo.released = function (item, gen) {
    gen = getGen(gen);
    if (item >= 8000) {
        return pokedex.items.released_berries[gen].hasOwnProperty(item-8000);
    }
    else {
        return pokedex.items.released_items[gen].hasOwnProperty(item);
    }
};

iteminfo.usefulList = function() {
    return pokedex.items.item_useful;
};

iteminfo.useful = function(item) {
    return pokedex.items.item_useful.hasOwnProperty(item);
};

iteminfo.message = function(item, part) {
    var messages = (item >= 8000 ? pokedex.items.berry_messages[item-8000] : pokedex.items.item_messages[item]);

    if (!messages) {
        return;
    }

    var parts = messages.split('|');
    if (part >= 0 && part < parts.length) {
        return parts[part];
    }
};

statinfo.list = function() {
    return pokedex.status.stats;
};

statinfo.name = function(stat) {
    return pokedex.status.stats[stat];
};

statusinfo.list = function() {
    return pokedex.status.status;
};

statusinfo.name = function(status) {
    return pokedex.status.status[status];
};

typeinfo.list = function() {
    return pokedex.types.types;
};

typeinfo.name = function(type) {
    return pokedex.types.types[type];
};

typeinfo.categoryList = function() {
    return pokedex.types.category;
};

typeinfo.category = function(type) {
    return pokedex.types.category[type];
};

abilityinfo.list = function() {
    return pokedex.abilities.abilities;
};

abilityinfo.name = function(ability) {
    return pokedex.abilities.abilities[ability];
};

abilityinfo.descList = function() {
    return pokedex.abilities.ability_desc;
};
abilityinfo.desc = function(ability) {
    return pokedex.abilities.ability_desc[ability];
};

abilityinfo.messageList = function() {
    return pokedex.abilities.ability_messages;
};

abilityinfo.message = function(ability, part) {
    var messages = pokedex.abilities.ability_messages[ability];

    if (!messages) {
        return;
    }

    var parts = messages.split('|');
    if (part >= 0 && part < parts.length) {
        return parts[part];
    }
};
