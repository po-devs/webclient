pokeinfo = {}; moveinfo = {}; statinfo = {}; statusinfo = {}; iteminfo = {}; typeinfo = {}; abilityinfo = {};
defaultgen = {"num":5, "subnum": 1};

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


pokeinfo.name = function(poke) {
    return pokedex.pokes.pokemons[this.toNum(poke)];
};

moveinfo.name = function(move) {
    return pokedex.moves.moves[move];
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

iteminfo.name = function(item) {
    if (item >= 8000) {
        return pokedex.items.berries[item-8000];
    } else {
        return pokedex.items.items[item];
    }
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

statinfo.name = function(stat) {
    return pokedex.status.stats[stat];
};

statusinfo.name = function(status) {
    return pokedex.status.status[status];
};

typeinfo.name = function(type) {
    return pokedex.types.types[type];
};

abilityinfo.name = function(ability) {
    return pokedex.abilities.abilities[ability];
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