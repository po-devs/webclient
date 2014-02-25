var should = require('should');
require('../js/utilities.js');

describe('utils', function () {
    describe('.toAlphanumeric', function () {
        it('should remove non-alphanumeric characters and lower case the string', function () {
            utils.toAlphanumeric(30).should.equal('30');
            utils.toAlphanumeric(1.301).should.equal('1301');
            utils.toAlphanumeric('abcdef1234').should.equal('abcdef1234');
            utils.toAlphanumeric('AB-C').should.equal('abc');
            utils.toAlphanumeric({}).should.equal('objectobject'); // [object Object]
        });
    });

    describe('.inherits', function () {
        // No tests for now
    });

    describe('.queryField', function () {
        // ...
    });

    describe('.escapeHtmlQuotes', function () {
        it('should escape quotes to their HTML equivalent', function () {
            utils.escapeHtmlQuotes('abcdef').should.equal('abcdef');
            utils.escapeHtmlQuotes('"Once upon a time, ..."').should.equal('&quot;Once upon a time, ...&quot;');
            utils.escapeHtmlQuotes("'\"'\"").should.equal('&#39;&quot;&#39;&quot;');
        });
    });

    describe('.escapeHtml', function () {
    });

    describe('.stripHtml', function () {
    });

    describe('.addDatePadding', function () {
        it('should prefix a 0 to a number if it is below 10', function () {
            utils.addDatePadding(0).should.equal('00');
            utils.addDatePadding(10).should.equal('10');
            utils.addDatePadding(9).should.equal('09');
        });
    });

    describe('.timestamp', function () {
        // ...
    });

    describe('.addChannelLinks', function () {
        var chans = [
            'tohjo',
            'tohjo falls',
            'tournaments',
            'mafia',
            'trivia',
            'hangman'
        ];

        it('should add links to channel tags', function () {
            utils.addChannelLinks('#Tohjo', chans).should.equal("<a href='po:join/Tohjo'>#Tohjo</a>");

            // Case sensitive
            utils.addChannelLinks('#tohjo', chans).should.equal("<a href='po:join/tohjo'>#tohjo</a>");

            // Two channels
            utils.addChannelLinks('#Tohjo #Hangman', chans).should.equal("<a href='po:join/Tohjo'>#Tohjo</a> <a href='po:join/Hangman'>#Hangman</a>");

            // Longest match wins
            utils.addChannelLinks('#Tohjo Falls #Tohjo', chans).should.equal("<a href='po:join/Tohjo Falls'>#Tohjo Falls</a> <a href='po:join/Tohjo'>#Tohjo</a>");
            utils.addChannelLinks('#Tohjo #Tohjo Falls', chans).should.equal("<a href='po:join/Tohjo'>#Tohjo</a> <a href='po:join/Tohjo Falls'>#Tohjo Falls</a>");

            utils.addChannelLinks('#Mafia Tutoring', chans).should.equal("<a href='po:join/Mafia'>#Mafia</a> Tutoring");
        });

        it('should not add links to non-existent channels', function () {
            utils.addChannelLinks('No channels here.', chans).should.equal('No channels here.');
            utils.addChannelLinks('#Indigo Plateau', chans).should.equal('#Indigo Plateau');
        });
    });

    describe('.unenumerable', function () {
        var obj = {};
        function func() {}
        function ts() {
            return '[object obj]';
        }

        it('should add properties to an object with [[Enumerable]] being false', function () {
            var hasFunc = false, i;
            utils.unenumerable(obj, 'f', func);
            obj.f.should.equal(func);

            for (i in obj) {
                if (i === 'f') {
                    hasFunc = true;
                    break;
                }
            }

            hasFunc.should.equal(false);
        });

        it('should not overwrite own properties', function () {
            utils.unenumerable(obj, 'toString', ts); // toString is not an own property, fine
            obj.toString.should.equal(ts);
            obj.toString().should.equal('[object obj]');

            // f is an own property, don't overwrite
            utils.unenumerable(obj, 'f', ts);
            obj.f.should.equal(func);
            should(obj.f()).equal(undefined);
        });
    });

    describe('.rank', function () {
        var set2 = ['', '~', '~', '%', ''],
            rangeTest = ['a', '', '', '', 'b'];
        it('should replace an auth level with a rank icon', function () {
            utils.rank(0).should.equal('');
            utils.rank(3).should.equal('+');
        });

        it('should accept custom rank sets', function () {
            utils.rank(0, set2).should.equal('');
            utils.rank(1, set2).should.equal('~');
            utils.rank(2, set2).should.equal('~');
            utils.rank(3, set2).should.equal('%');
            utils.rank(4, set2).should.equal('');
        });

        it('should range limit auth', function () {
            utils.rank(-3, rangeTest).should.equal('a');
            utils.rank(1000, rangeTest).should.equal('b');
        });
    });

    describe('.rankStyle', function () {
        // ...
    });

    describe('.onEnterPressed', function () {
        it('should return a wrapper around the callback listening to enter events', function () {
            var called = false;
            // Additional argument verification
            function cb(event) {
                called = event.which === 13;
            }

            // Event code is 13, cb should have been called
            utils.onEnterPressed(cb)({which: 13});
            called.should.equal(true);

            called = false;
            // Which is not 13, should not have been called.
            utils.onEnterPressed(cb)({which: 1});
            called.should.equal(false);
        });
    });
});
