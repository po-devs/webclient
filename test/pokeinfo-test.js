var buster = require("buster")
var assert = buster.assert;

buster.testCase("pokeinfo", {
    "bulbasaur sprite url": function () {
        assert.equals("http://pokemon-online.eu/images/pokemon/x-y/1.png", pokeinfo.sprite({num: 1, gen: 6}));
    }
});