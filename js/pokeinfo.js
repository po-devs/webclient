geninfo = {}; pokeinfo = {}; genderinfo = {}; natureinfo = {}; moveinfo = {}; categoryinfo = {}; statinfo = {}; statusinfo = {}; iteminfo = {}; typeinfo = {}; abilityinfo = {};
defaultgen = {"num":5, "subnum": 1};

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

pokeinfo.sprite = function(poke, gen, back) {
    if (!gen && !poke.gen) {
        gen = defaultgen;
    }

    return pokedex.generations.options[gen.num].sprite_folder + (gen.num == 5 ? "animated/" : "" ) + (back ? "back/" : "")
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
    return pokedex.pokes.gender[this.toNum(poke)];
};

pokeinfo.heightList = function() {
    return pokedex.pokes.height;
};

pokeinfo.height = function(poke) {
    return pokedex.pokes.height[this.toNum(poke)];
};

pokeinfo.weightList = function() {
    return pokedex.pokes.weight;
};

pokeinfo.weight = function(poke) {
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
    return pokedex.pokes.stats[this.toNum(poke)][stat];
};

pokeinfo.allMovesList = function(gen) {
    if (!gen) {
        return pokedex.pokes.all_moves;
    }
    else {
        return pokedex.pokes.all_moves[gen];
    }
};

pokeinfo.allMoves = function(poke, gen) {
    return pokedex.pokes.all_moves[gen][this.toNum(poke)];
};

pokeinfo.type1List = function(gen) {
    if (!gen) {
        return pokedex.pokes.type1;
    }
    else {
        return pokedex.pokes.type1[gen];
    }
};

pokeinfo.type1 = function(poke, gen) {
    return pokedex.pokes.type1[gen][this.toNum(poke)];
};

pokeinfo.type2List = function(gen) {
    if (!gen) {
        return pokedex.pokes.type2;
    }
    else {
        return pokedex.pokes.type2[gen];
    }
};

pokeinfo.type2 = function(poke, gen) {
    return pokedex.pokes.type2[gen][this.toNum(poke)];
};

pokeinfo.ability1List = function(gen) {
    if (!gen) {
        return pokedex.pokes.ability1;
    }
    else {
        return pokedex.pokes.ability1[gen];
    }
};

pokeinfo.ability1 = function(poke, gen) {
    return pokedex.pokes.ability1[gen][this.toNum(poke)];
};

pokeinfo.ability2List = function(gen) {
    if (!gen) {
        return pokedex.pokes.ability2;
    }
    else {
        return pokedex.pokes.ability2[gen];
    }
};

pokeinfo.ability2 = function(poke, gen) {
    return pokedex.pokes.ability2[gen][this.toNum(poke)];
};

pokeinfo.ability3List = function(gen) {
    if (!gen) {
        return pokedex.pokes.ability3;
    }
    else {
        return pokedex.pokes.ability3[gen];
    }
};

pokeinfo.ability3 = function(poke, gen) {
    return pokedex.pokes.ability3[gen][this.toNum(poke)];
};

pokeinfo.releasedList = function(gen) {
    if (!gen) {
        return pokedex.pokes.released;
    }
    else {
        return pokedex.pokes.released[gen];
    }
};

pokeinfo.released = function(poke, gen) {
    return pokedex.pokes.released[gen].hasOwnProperty(this.toNum(poke));
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

moveinfo.list = function() {
    return pokedex.moves.moves;
};

moveinfo.name = function(move) {
    return pokedex.moves.moves[move];
};

moveinfo.accuracyList = function(gen) {
    if (!gen) {
        return pokedex.moves.accuracy;
    }
    else {
        return pokedex.moves.accuracy[gen];
    }
};

moveinfo.accuracy = function(move, gen) {
    return pokedex.moves.accuracy[gen][move];
};

moveinfo.damageClassList = function(gen) {
    if (!gen) {
        return pokedex.moves.damage_class;
    }
    else {
        return pokedex.moves.damage_class[gen];
    }
};

moveinfo.damageClass = function(move, gen) {
    return pokedex.moves.damage_class[gen][move];
};

moveinfo.effectList = function(gen) {
    if (!gen) {
        return pokedex.moves.effect;
    }
    else {
        return pokedex.moves.effect[gen];
    }
};

moveinfo.effect = function(move, gen) {
    return pokedex.moves.effect[gen][move];
};

moveinfo.powerList = function(gen) {
    if (!gen) {
        return pokedex.moves.power;
    }
    else {
        return pokedex.moves.power[gen];
    }
};

moveinfo.power = function(move, gen) {
    return pokedex.moves.power[gen][move];
};

moveinfo.messageList = function() {
    return pokedex.moves.move_message;
};

moveinfo.ppList = function(gen) {
    if (!gen) {
        return pokedex.moves.pp;
    }
    else {
        return pokedex.moves.pp[gen];
    }
};

moveinfo.pp = function(move, gen) {
    return pokedex.moves.pp[gen][move];
};

moveinfo.typeList = function(gen) {
    if (!gen) {
        return pokedex.moves.type;
    }
    else {
        return pokedex.moves.type[gen];
    }
};

moveinfo.type = function(move, gen) {
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
    return {
        items: pokedex.items.items,
        berries: pokedex.items.berries
    };
};

iteminfo.name = function(item) {
    if (item >= 8000) {
        return pokedex.items.berries[item-8000];
    } else {
        return pokedex.items.items[item];
    }
};

iteminfo.releasedList(gen) {
    if (!gen){
        return {
            items: pokedex.items.released_items,
            berries: pokedex.items.released_berries
        }
    }
    else {
        return {
            items: pokedex.items.released_items[gen],
            berries: pokedex.items.released_berries[gen]
        }
    }
};

iteminfo.released(item, gen) {
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