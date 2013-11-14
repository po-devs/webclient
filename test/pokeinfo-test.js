var buster = require("buster");
var assert = buster.assert;

buster.testCase("pokeinfo", {
    "toNum": function() {
        assert.equals(pokeinfo.toNum(40), 40, "Expecting toNum(40) to be 40");
        assert.equals(pokeinfo.toNum({"num": 3, "forme": 1}), (1<<16)+3, "Testing toNum({num: 3, forme: 1})");
    },
    "bulbasaur sprite url": function () {
        assert.equals("http://pokemon-online.eu/images/pokemon/x-y/1.png", pokeinfo.sprite({num: 1, gen: 6}));
        assert.equals("http://pokemon-online.eu/images/pokemon/x-y/1.png", pokeinfo.sprite({num: 1, gen: {num: 6}}));
        assert.equals("http://pokemon-online.eu/images/pokemon/x-y/1.png", pokeinfo.sprite({num: 1}));
    },
    "typeinfo": function() {
        assert.equals("Fairy", typeinfo.name(17));
    },
    "compact database": function () {
        assert.equals(85, moveinfo.accuracy(3, 1));
        assert.equals(1, moveinfo.damageClass(44, 3));
        /* Test Pidgeot types */
        assert.equals(["Normal", "Flying"], pokeinfo.types(18, 4).map(typeinfo.name));
        /* Test clefairy is normal type in gen 1 */
        assert.equals(["Normal"], pokeinfo.types(35, 1).map(typeinfo.name));
        /* Test clefairy is fairy type in gen 6 */
        assert.equals(["Fairy"], pokeinfo.types(35).map(typeinfo.name));
        //Retest, to make sure internal expand didn't touch anything
        /* Test clefairy is normal type in gen 1 */
        assert.equals(["Normal"], pokeinfo.types(35, 1).map(typeinfo.name));
        /* Test clefairy is fairy type in gen 6 */
        assert.equals(["Fairy"], pokeinfo.types(35).map(typeinfo.name));
    },
    "stats": function() {
        /* Butterfree stats */
        assert.equals([60,45,50,90,80,70], pokeinfo.stats(12, 6));
        assert.equals([60,45,50,80,80,70], pokeinfo.stats(12, 3));
    }
});