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
