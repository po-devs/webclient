var should = require("should");
require('./loadpokedex');

describe('abilityinfo', function () {
    describe('.list', function () {
        it('should return the list of abilities', function () {
            abilityinfo.list().should.equal(pokedex.abilities.abilities);
        });
    });
    describe('.name', function () {
        it("should return the ability's name", function () {
            abilityinfo.name(62).should.equal('Guts');
            abilityinfo.name(105).should.equal('Super Luck');
            abilityinfo.name(141).should.equal('Moody');
            abilityinfo.name(171).should.equal('Fur Coat');
            abilityinfo.name(187).should.equal('Magician');
        });
    });
    describe('.desc', function () {
        it("should return the ability's description", function () {
            abilityinfo.desc(62).should.equal("Boosts Attack if there is a status problem.");
            abilityinfo.desc(105).should.equal("Heightens the critical-hit ratios of moves.");
            abilityinfo.desc(141).should.equal("Raises a random stat two stages and lowers another one stage after each turn.");
            // Unimplemented
            //abilityinfo.desc(171).should.equal('');
            //abilityinfo.desc(187).should.equal('');
        });
    });
    describe('.message', function () {
        it("should return an empty string if the ability doesn't have a message", function () {
            abilityinfo.message(-1).should.equal('');
            abilityinfo.message(Object.keys(pokedex.abilities.abilities).length).should.equal('');
        });
        it("should return the ability's message", function () {
            // Wonder Guard
            abilityinfo.message(71).should.equal("%s's Wonder Guard evades the attack!");
            // Flash Fire
            abilityinfo.message(19).should.equal("%s's Flash Fire raised the power of its Fire-type moves!");
            abilityinfo.message(19, 1).should.equal("%s's Flash Fire made %m ineffective!");
        });
        it("it should return an empty string if the requested part doesn't exist", function () {
            // Defiant - Defiant sharply raised %s's Attack!
            abilityinfo.message(80, 1).should.equal('');
        });
    });
});
