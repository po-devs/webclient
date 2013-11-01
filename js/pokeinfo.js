geninfo = {}; pokeinfo = {}; genderinfo = {}; natureinfo = {}; moveinfo = {}; categoryinfo = {}; statinfo = {}; statusinfo = {}; iteminfo = {}; typeinfo = {}; abilityinfo = {};
var lastgen;

for (var i in pokedex.generations.generations) {
    lastgen = i;
}

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
    return poke.num + ( (poke.forme || 0) << 16);
};

pokeinfo.sprite = function(stuff) {
    var id = stuff.id;
    var gen = stuff.gen;
    var type = stuff.type.toLowerCase();
    var female = stuff.female;
    var shiny = stuff.shiny;
    if (!id) {
        return;
    }
    if (!gen) {
        gen = lastgen;
    }
    if (type != "back" && type != "icon") {
        type = "front";
    }
    if (type == "icon") {
        return "http://pokemon-online.eu/images/poke_icons/" + poke.num + (poke.forme ? "-" + poke.forme : "") + ".png";
    }
    else {
        var back = (type == "back");
        return pokedex.generations.options[gen].sprite_folder + (gen == 5 ? "animated/" : "" ) + (back ? "back/" : "") + (shiny ? "shiny/" : "") + (female ? "female/" : "")
        + (gen == 5 ? ("00"+poke.num).slice(-3) : poke.num ) + (poke.forme ? "-" + poke.forme : "")
        + (gen == 5 ? ".gif" : ".png");
    }
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
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.pokes.all_moves[gen];
};

pokeinfo.allMoves = function(poke, gen) {
    if (!gen) {
        gen = lastgen;
    }
    if (!pokedex.pokes.all_moves[this.toNum(poke)]) {
        poke %= 65536;
    }
    return pokedex.pokes.all_moves[gen][this.toNum(poke)];
};

pokeinfo.typesList = function(gen) {
    if (!gen) {
        gen = lastgen;
    }
    return {
        1: pokedex.pokes.type1[gen],
        2: pokedex.pokes.type2[gen]
    };
};

pokeinfo.types = function(poke, gen) {
    if (!gen) {
        gen = lastgen;
    }
    var id = this.toNum(poke);
    if (!pokedex.pokes.type1[gen][id]) {
        id %= 65536;
    }
    var type1 = pokedex.pokes.type1[gen][id];
    var type2 = pokedex.pokes.type2[gen][id];
    var types = [].push(type1);
    if (type2) {
        types.push(type2);
    }
    return types;
};

pokeinfo.abilityList = function(gen) {
    if (!gen) {
        gen = lastgen;
    }
    return {
        1: pokedex.pokes.ability1[gen],
        2: pokedex.pokes.ability2[gen],
        3: pokedex.pokes.ability3[gen]
    }
};

pokeinfo.ability = function(poke, hidden, gen) {
    if (!gen) {
        gen = lastgen;
    }
    var id = this.toNum(poke);
    if (!pokedex.pokes.ability1[gen][id]) {
        id %= 65536;
    }
    if (hidden) {
        return pokedex.pokes.ability3[gen][id];
    }
    else {
        var ability1 = pokedex.pokes.ability1[gen][id];
        var ability2 = pokedex.pokes.ability2[gen][id];
        var abilities = [].push(ability1);
        if (ability2) {
            abilities.push(ability2);
        }
        return abilities;
    }
};

pokeinfo.releasedList = function(gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.pokes.released[gen];
};

pokeinfo.released = function(poke, gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.pokes.released[gen].hasOwnProperty(this.toNum(poke));
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
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.accuracy[gen];
};

moveinfo.accuracy = function(move, gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.accuracy[gen][move];
};

moveinfo.damageClassList = function(gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.damage_class[gen];
};

moveinfo.damageClass = function(move, gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.damage_class[gen][move];
};

moveinfo.effectList = function(gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.effect[gen];
};

moveinfo.effect = function(move, gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.effect[gen][move];
};

moveinfo.powerList = function(gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.power[gen];
};

moveinfo.power = function(move, gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.power[gen][move];
};

moveinfo.messageList = function() {
    return pokedex.moves.move_message;
};

moveinfo.ppList = function(gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.pp[gen];
};

moveinfo.pp = function(move, gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.pp[gen][move];
};

moveinfo.typeList = function(gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.type[gen];
};

moveinfo.type = function(move, gen) {
    if (!gen) {
        gen = lastgen;
    }
    return pokedex.moves.type[gen][move];
};

moveinfo.message = function(move, part) {
    var messages = pokedex.moves.move_message[move];

    if (!messages) {
        return undefined;
    }

    var parts = messages.split('|');
    if (part >= 0 && part < parts.length) {
        return parts[part];
    } else {
        return undefined;
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
    if (!gen) {
        gen = lastgen;
    }
    var list = pokedex.items.released_items[gen];
    for (var i in pokedex.items.released_berries[gen]) {
        list[y + 8000] = pokedex.items.released_berries[gen][i];
    }
    return list;
    }
};

iteminfo.released = function (item, gen) {
    if (!gen) {
        gen = lastgen;
    }
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
        return undefined;
    }

    var parts = messages.split('|');
    if (part >= 0 && part < parts.length) {
        return parts[part];
    } else {
        return undefined;
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
        return undefined;
    }

    var parts = messages.split('|');
    if (part >= 0 && part < parts.length) {
        return parts[part];
    } else {
        return undefined;
    }
};
