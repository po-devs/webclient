var should = require("should");
require('./loadpokedex');

describe('statusinfo', function () {
    describe('.list', function () {
        it('should return the list of statuses', function () {
            statusinfo.list().should.equal(pokedex.status.status);
            Object.keys(statusinfo.list()).length.should.equal(7);
        });
    });
    describe('.name', function () {
        it("should return the status' name", function () {
            statusinfo.name(0).should.equal('fine');
            statusinfo.name(2).should.equal('asleep');
            statusinfo.name(5).should.equal('poisoned');
            statusinfo.name(6).should.equal('confused');
        });
    });
});
