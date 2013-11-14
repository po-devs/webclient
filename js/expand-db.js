(function () {
    var gens = Object.keys(pokedex.generations.generations);
    var movefiles = ['accuracy', 'effect', 'damage_class', 'power', 'pp', 'type'],
        pokefiles = ['all_moves', 'type1', 'type2', 'ability1', 'ability2', 'ability3', 'min_levels'],
        fileindex, fileslen, file;
    var lastGen = gens[gens.length - 1], gen, obj;
    var numPokemon, i;

    function previousGens(file, gen, poke) {
        var obj = pokedex.moves[file] || pokedex.pokes[file];
        while (gen < lastGen) {
            if (obj[gen][poke]) {
                return obj[gen][poke];
            }
            gen += 1;
        }
        return obj[lastGen][poke];
    }
    
    for (gen = lastGen - 1; gen >= gens[0]; gen -= 1) { // The last gen has all the latest information, so we don't expand that.
        numPokemon = pokedex.generations.options[gen].num_pokemon;
        numMoves = pokedex.generations.options[gen].num_moves;

        // Move files
        for (fileindex = 0, fileslen = movefiles.length; fileindex < fileslen; fileindex += 1) {
            file = movefiles[fileindex];
            if (!pokedex.moves[file]) {
                continue;
            }
            obj = pokedex.moves[file][gen];
            for (i = 1; i <= numMoves; i += 1) {
                if (typeof obj[i] === 'undefined') {
                    obj[i] = previousGens(file, gen, i);
                }
            }
        }
        
        // Poke files
        for (fileindex = 0, fileslen = pokefiles.length; fileindex < fileslen; fileindex += 1) {
            file = pokefiles[fileindex];
            if (!pokedex.pokes[file] || !pokedex.pokes[file][gen]) {
                continue;
            }
            obj = pokedex.pokes[file][gen];
            for (i = 1; i <= numPokemon; i += 1) {
                if (typeof obj[i] === 'undefined') {
                    obj[i] = previousGens(file, gen, i);
                }
            }
        }
    }
}());