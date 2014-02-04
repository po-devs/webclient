var should = require("should");
require('./loadpokedex');

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
