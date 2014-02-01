geninfo = {};
pokeinfo = {};
genderinfo = {};
natureinfo = {};
moveinfo = {};
categoryinfo = {};
statinfo = {};
statusinfo = {};
iteminfo = {};
typeinfo = {};
abilityinfo = {};
lastgen = null;

(function () {
    var i;
    for (i in pokedex.generations.generations) {
        lastgen = {num: +i};
    }
}());

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

geninfo.getGen = getGen;
geninfo.list = function () {
    return pokedex.generations.generations;
};

geninfo.name = function (num) {
    return pokedex.generations.generations[num];
};

geninfo.options = function (num) {
    num = +num;
    if (!isNaN(num)) {
        return pokedex.generations.options[num];
    }

    return pokedex.generations.options;
};

pokeinfo.toNum = function(poke) {
    if (typeof poke == "object") {
        return poke.num + ( (poke.forme || 0) << 16);
    }

    return poke;
};

pokeinfo.species = function(poke) {
    return poke & ((1 << 16) - 1);
};

pokeinfo.forme = function(poke) {
    return poke >> 16;
};

pokeinfo.find = function(id, what, gen) {
    gen = getGen(gen);
    id = this.toNum(id);

    var gennum = gen.num;
    var array = pokedex.pokes[what][gennum];

    if (id in array) {
        return array[id];
    }

    var ornum = this.species(id);

    if (ornum in array) {
        return array[ornum];
    }

    while (gennum < lastgen.num && ! (id in array) && !(ornum in array)) {
        array = pokedex.pokes[what][++gennum];
    }

    if (!(id in array)) {
        id = ornum;
    } else {
        /* expand */
        if (gennum != gen.num) {
            pokedex.pokes[what][gen.num][id] = array[id];
        }
    }

    return array[id];
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

pokeinfo.battlesprite = function(poke, params) {
    params = params || {};

    var back = params.back || false;
    var data = pokeinfo.spriteData(poke, params);

    console.log(data);

    return pokedex.generations.options[lastgen.num].sprite_folder + ( (data.ext || "gif") == "gif" ? "animated/" : "" ) + (back ? "back/" : "")
        + (poke.shiny ? "shiny/" : "") + (poke.female ? "female/" : "")
        + ((data.ext || "gif") == "gif" ? ("00"+poke.num).slice(-3) : poke.num ) + (poke.forme && !data.noforme ? "-" + poke.forme : "")
        + ("." + (data.ext || "gif"));
};

pokeinfo.spriteData = function(poke, params) {
    var back = params.back || false;
    var num = this.toNum(poke);

    var ret = (back ? pokedex.pokes.images.back[num] : pokedex.pokes.images[num]);
    if (!ret) {
        ret = (back ? pokedex.pokes.images.back[num%65356] : pokedex.pokes.images[num%65356]) || {"w":96,"h":96};
        ret.noforme = true;
    }
    return ret;
};

pokeinfo.icon = function(poke) {
    return "http://pokemon-online.eu/images/poke_icons/" + poke.num + (poke.forme ? "-" + poke.forme : "") + ".png";
};

pokeinfo.name = function(poke) {
    return pokedex.pokes.pokemons[this.toNum(poke)];
};

pokeinfo.gender = function(poke) {
    if (!pokedex.pokes.gender[this.toNum(poke)]) {
        poke %= 65536;
    }
    return pokedex.pokes.gender[this.toNum(poke)];
};

pokeinfo.height = function(poke) {
    if (!pokedex.pokes.height[this.toNum(poke)]) {
        poke %= 65536;
    }
    return pokedex.pokes.height[this.toNum(poke)];
};

pokeinfo.weight = function(poke) {
    if (!pokedex.pokes.weight[this.toNum(poke)]) {
        poke %= 65536;
    }
    return pokedex.pokes.weight[this.toNum(poke)];
};

pokeinfo.heldItem = function (poke) {
    return pokedex.pokes.items[this.toNum(poke)];
};

pokeinfo.stats = function(poke, gen) {
    return this.find(poke, "stats", gen);
};

pokeinfo.stat = function(poke, stat, gen) {
    return this.stats(poke, gen)[stat];
};

pokeinfo.allMoves = function(poke, gen) {
    var moves = this.find(poke, "all_moves", gen);
    if (!Array.isArray(moves)) {
        moves = [moves];
    }
    return moves;
};

pokeinfo.types = function(poke, gen) {
    var type1 = this.find(poke, "type1", gen);
    var type2 = this.find(poke, "type2", gen);
    var types = [type1];
    if (type2 != 18) {
        types.push(type2);
    }
    return types;
};

pokeinfo.abilities = function(poke, gen, keep) {
    return [this.find(poke, "ability1", gen),
        this.find(poke, "ability2", gen),
        this.find(poke, "ability3", gen)].filter(function(arg) { if (keep) { return true; } else { return arg !== 0; }});
};

pokeinfo.releasedList = function(gen, excludeFormes) {
    var list = pokedex.pokes.released[getGen(gen).num],
        formeless = {}, num, i;

    if (excludeFormes) {
        for (i in list) {
            num = +i;
            if (num < 65536) {
                formeless[num] = list[i];
            }
        }

        list = formeless;
    }

    return list;
};

pokeinfo.excludeFormes = true;

pokeinfo.released = function(poke, gen) {
    return pokedex.pokes.released[getGen(gen).num].hasOwnProperty(this.toNum(poke));
};

pokeinfo.calculateStat = function(infos) {
    if (infos.stat_id == this.default_settings.hp_id) {
        if (infos.generation > 2) {
            return Math.floor(Math.floor((infos.stat_ivs + (2 * infos.base_stat) + Math.floor(infos.stat_evs/4) + 100) * infos.level)/100) + 10;
        } else {
            return Math.floor(((infos.stat_ivs + infos.base_stat + Math.sqrt(65535)/8 + 50) * infos.level)/50 + 10);
        }
    } else {
        if (infos.generation > 2) {
            return Math.floor(Math.floor(((infos.stat_ivs + (2 * infos.base_stat) + Math.floor(infos.stat_evs/4)) * infos.level)/100 + 5)*infos.nature);
        } else {
            return Math.floor(Math.floor((infos.stat_ivs + infos.base_stat + Math.sqrt(65535)/8) * infos.level)/50 + 5);
        }
    }
};

genderinfo.name = function(gender) {
    return {1: 'male', 2: 'female', 3: 'neutral'}[gender];
};

natureinfo.list = function() {
    return pokedex.natures.nature;
};

natureinfo.name = function(nature) {
    return pokedex.natured.nature[nature];
};

natureinfo.getNatureEffect = function(nature_id, stat_id) {
    var arr = {0:0, 1:1, 2:2, 3:4, 4:5, 5:3};
    return (10+(-(nature_id%5 == arr[stat_id]-1) + (Math.floor(nature_id/5) == arr[stat_id]-1)))/10;
};

moveinfo.list = function() {
    return pokedex.moves.moves;
};

moveinfo.hasMove = function (move) {
    return move in pokedex.moves.moves;
};

moveinfo.name = function(move) {
    return pokedex.moves.moves[move];
};

moveinfo.findId = function (move) {
    var list = pokedex.moves.moves,
        moveNum, moveName;

    for (moveNum in list) {
        moveName = list[moveNum];

        if (move === moveName) {
            return +moveNum;
        }
    }

    return 0;
}

moveinfo.find = function(id, what, gen) {
    gen = getGen(gen);

    var gennum = gen.num;
    var array = pokedex.moves[what][gennum];

    if (id in array) {
        return array[id];
    }

    while (gennum < lastgen.num && ! (id in array)) {
        array = pokedex.moves[what][++gennum];
    }

    /* expand */
    if (gennum != gen.num && id in array) {
        pokedex.moves[what][gen.num][id] = array[id];
    }

    return array[id];
};

moveinfo.accuracy = function(move, gen) {
    return this.find(move, "accuracy", gen);
};

moveinfo.damageClass = function(move, gen) {
    return this.find(move, "damage_class", gen);
};

moveinfo.effect = function(move, gen) {
    return this.find(move, "effect", gen);
};

moveinfo.power = function(move, gen) {
    return this.find(move, "power", gen);
};

moveinfo.pp = function(move, gen) {
    return this.find(move, "pp", gen);
};

moveinfo.type = function(move, gen) {
    return this.find(move, "type", gen);
};

moveinfo.message = function(move, part) {
    var messages = pokedex.moves.move_message[move];

    if (!messages) {
        return '';
    }

    var parts = messages.split('|');
    if (part >= 0 && part < parts.length) {
        return parts[part];
    }

    return '';
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

iteminfo.hasItem = function(item) {
    if (item >= 8000) {
        return (item-8000) in pokedex.items.berries;
    } else {
        return item in pokedex.items.items;
    }
};

iteminfo.name = function(item) {
    if (item >= 8000) {
        return pokedex.items.berries[item-8000];
    } else {
        return pokedex.items.items[item];
    }
};

iteminfo.berryName = function (item) {
    return pokedex.items.berries[item];
};

iteminfo.releasedList = function(gen) {
    gen = getGen(gen).num;
    var list = {},
        releasedItems = pokedex.items.released_items[gen],
        releasedBerries = pokedex.items.released_berries[gen],
        i;

    for (i in releasedItems) {
        list[i] = true;
    }
    for (i in releasedBerries) {
        list[i + 8000] = true;
    }
    return list;
};

iteminfo.released = function (item, gen) {
    gen = getGen(gen).num;
    if (item >= 8000) {
        return pokedex.items.released_berries[gen].hasOwnProperty(item-8000);
    } else {
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
        return '';
    }

    var parts = messages.split('|');
    if (part >= 0 && part < parts.length) {
        return parts[part];
    }

    return '';
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

abilityinfo.desc = function(ability) {
    return pokedex.abilities.ability_desc[ability];
};

abilityinfo.message = function(ability, part) {
    var messages = pokedex.abilities.ability_messages[ability];

    if (!messages) {
        return '';
    }

    var parts = messages.split('|');
    if (part >= 0 && part < parts.length) {
        return parts[part];
    }

    return '';
};
