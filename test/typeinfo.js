var should = require("should");
require('./loadpokedex');

describe('typeinfo', function () {
    describe('.list', function () {
        it('should return the list of types', function () {
            typeinfo.list().should.equal(pokedex.types.types);
            Object.keys(typeinfo.list()).length.should.equal(19);
        });
    });
    describe('.name', function () {
        it('should return the type name', function () {
            typeinfo.name(0).should.equal('Normal');
            typeinfo.name(17).should.equal('Fairy');
            typeinfo.name(18).should.equal('???');
        });
    });
    describe('.categoryList', function () {
        it('should return the list of categories', function () {
            typeinfo.categoryList().should.equal(pokedex.types.category);
            Object.keys(typeinfo.categoryList()).length.should.equal(19);
        });
    });
    describe('.category', function () {
        it('should return the category id', function () {
            typeinfo.category(0).should.equal(1);
            typeinfo.category(9).should.equal(2);
            typeinfo.category(14).should.equal(2);
            typeinfo.category(18).should.equal(1);
        });
    });
});
