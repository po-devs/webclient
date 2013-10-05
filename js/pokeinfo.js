pokeinfo = {}; moveinfo = {};
defaultgen = {"num":5, "subnum": 1};

pokeinfo.toNum = function(poke) {
    return poke.num + ( (poke.forme || 0) << 16);
};

pokeinfo.sprite = function(poke, gen, back) {
    if (!gen && !poke.gen) {
        gen = defaultgen;
    }

    return pokedex.generations.options[gen.num].sprite_folder + (gen.num == 5 ? "animated/" : "" )
        + (back ? "back/" : "") + poke.num + (poke.forme ? "-" + poke.forme : "") + (gen.num == 5 ? ".gif" : ".png");
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