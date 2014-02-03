var should = require("should");
require('./loadpokedex');

describe('genderinfo', function () {
    describe('.name', function () {
        it("should return the gender's name", function () {
            genderinfo.name(1).should.equal('male');
            genderinfo.name(2).should.equal('female');
            genderinfo.name(3).should.equal('neutral');
        });
    });
});
