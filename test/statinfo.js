var should = require("should");
require('./loadpokedex');

describe('statinfo', function () {
    describe('.list', function () {
        it('should return the list of stats', function () {
            statinfo.list().should.equal(pokedex.status.stats);
            Object.keys(statinfo.list()).length.should.equal(8);
        });
    });
    describe('.name', function () {
        it("should return the stat's name", function () {
            statinfo.name(0).should.equal('HP');
            statinfo.name(3).should.equal('Sp. Att.');
            statinfo.name(5).should.equal('Speed');
            statinfo.name(7).should.equal('Evasion');
        });
    });
});
