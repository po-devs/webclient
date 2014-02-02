// Loading dependencies
var glob = require("glob");

require('../js/db/initpokedex');
require('../js/db/pokes/images');

glob.sync("js/db/**/*.js", {dot: true}).forEach(function (f) {
    if (f !== 'js/db/initpokedex.js' && f !== 'js/db/pokes/images.js') {
        require('../' + f);
    }
});

require('../js/db/generations');
require('../js/db/generations.options');
require('../js/pokeinfo');

// Test suite
describe('pokeinfo', function () {
    describe('.toNum', function () {
        it('should return a number if given one', function () {
            pokeinfo.toNum(40).should.equal(40);
        });
        it('should deal with formes', function () {
            pokeinfo.toNum({num: 3, forme: 1}).should.equal((1 << 16) + 3);
        });
    });

    describe('.types', function () {
        it('should resolve data from older/newer gens when not found', function () {
            // Pidgeot
            pokeinfo.types(18, 4).should.eql([0, 2]); // Normal Flying

            // Clefairy in gen 1
            pokeinfo.types(35, 1).should.eql([0]); // Normal
            // Clefairy in gen 6
            pokeinfo.types(35).should.eql([17]); // Fairy

            // Retest, to make sure internal expand didn't touch anything
            // Clefairy in gen 1
            pokeinfo.types(35, 1).should.eql([0]); // Normal
            // Clefairy in gen 6
            pokeinfo.types(35).should.eql([17]); // Fairy
        });
    });

    describe('stats', function () {
        it("should use the given gen's data", function () {
            // Butterfree
            pokeinfo.stats(12, 3).should.eql([60, 45, 50, 80, 80, 70]);
            pokeinfo.stats(12, 6).should.eql([60, 45, 50, 90, 80, 70]);
        });
    });

    describe('sprites', function () {
        it('should generate sprite urls from parameters', function () {
            pokeinfo.sprite({num: 1, gen: 6}).should.equal("http://pokemon-online.eu/images/pokemon/x-y/1.png");
            pokeinfo.sprite({num: 1, gen: {num: 6}}).should.equal("http://pokemon-online.eu/images/pokemon/x-y/1.png");
            pokeinfo.sprite({num: 1}).should.equal("http://pokemon-online.eu/images/pokemon/x-y/1.png");
            pokeinfo.sprite({num: 3, forme: 1, gen: {num: 6}}).should.equal("http://pokemon-online.eu/images/pokemon/x-y/3-1.png");
            pokeinfo.sprite({num: 3, forme: 1, gen: {num: 6}}, {back: true}).should.equal("http://pokemon-online.eu/images/pokemon/x-y/back/3-1.png");
            pokeinfo.battlesprite({num: 671, gen: {num: 6}}, {back: true}).should.equal("http://pokemon-online.eu/images/pokemon/x-y/back/671.png");
            pokeinfo.battlesprite({num: 1, gen: {num: 6}}).should.equal("http://pokemon-online.eu/images/pokemon/x-y/animated/001.gif");
            pokeinfo.spriteData(212, {"back": true}).w.should.equal(68);
        });
    });
});

describe('typeinfo', function () {
    describe('.name', function () {
        it('should return the type name', function () {
            typeinfo.name(17).should.equal('Fairy');
        });
    });
});

describe('moveinfo', function () {
    describe('.accuracy', function () {
        it('should resolve data from older/newer gens when not found', function () {
            moveinfo.accuracy(3, 1).should.equal(85);
        });
    });
    describe('.damageClass', function () {
        it('should resolve data from older/newer gens when not found', function () {
            moveinfo.damageClass(44, 3).should.equal(1);
        });
    });
    describe('.effect', function () {
        it('should resolve data from older/newer gens when not found', function () {
            moveinfo.effect(34, 4).should.equal("Has a $effect_chance% chance to paralyze the target.");
        });
    });
    describe('.pp', function () {
        it('should resolve data from older/newer gens when not found', function () {
            moveinfo.pp(26, 2).should.equal(25);
        });
    });
    describe('.type', function () {
        it('should resolve data from older/newer gens when not found', function () {
            // Flower Shield
            moveinfo.type(592).should.equal(17);
        });
    });
    describe('.power', function () {
        it('should resolve data from older/newer gens when not found', function () {
            moveinfo.power(143, 2).should.equal(140);
        });

        it("should use the given gen's data", function () {
            // Crabhammer: 90 in 5th, 100 in 6th
            moveinfo.power(152, 5).should.equal(90);
            moveinfo.power(152, 6).should.equal(100);
        });
    });
});
