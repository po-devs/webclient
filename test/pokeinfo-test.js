var buster = require("buster");
var assert = buster.assert;

buster.testCase("pokeinfo", {
    "bulbasaur sprite url": function () {
        assert.equals("http://pokemon-online.eu/images/pokemon/x-y/1.png", pokeinfo.sprite({num: 1, gen: 6}));
        assert.equals("http://pokemon-online.eu/images/pokemon/x-y/1.png", pokeinfo.sprite({num: 1, gen: {num: 6}}));
        assert.equals("http://pokemon-online.eu/images/pokemon/x-y/1.png", pokeinfo.sprite({num: 1}));
    },
    "compact database": function () {
        assert.equals(85, moveinfo.accuracy(3, 1));
        assert.equals(1, moveinfo.damageClass(44, 3));
        assert.equals(2, pokeinfo.types(18, 4)[0]);
    }
});