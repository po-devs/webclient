Webclient for Pokémon Online
============================

[![Join the chat at https://gitter.im/po-devs/webclient](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/po-devs/webclient?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/po-devs/webclient.png)](https://travis-ci.org/po-devs/webclient)

It connects to a relay station, which in turns connects to a PO server. If
you want multiple webclients to be able to connect to your server through
a relay station, you'd better add the relay station to the proxy servers
in your server config.

The host of the official PO relay station is ws://server.pokemon-online.eu:10508

Testing
=======

Thanks to github pages you can test the current repository with this url: http://po-devs.github.io/webclient/

Add the query parameter 'user' to automatically have your username set up, or 'server' to use a different server than PO's main server.

If you're cloning this repository, test locally with Firefox, as Chrome blocks some features when dealing with `file://`.

Test suite
==========

This uses [Mocha](http://visionmedia.github.io/mocha/) to run tests. Those tests are run for each commit on the
Travis-CI platform (check out the build icon!).

If you want to run them manually, have [Node.js](http://nodejs.com) installed and type `npm test` in a terminal. If you haven't installed Mocha yet, do that first (after you install node): `npm install`.

Tasks
=====

Grunt is used to run a few (build) tasks. Currently, only `grunt-autoprefixer` is used, which "[parses CSS and add vendor prefixes to CSS rules using values from the Can I Use.](https://github.com/ai/autoprefixer)".

First, you will need grunt-cli installed globally. For that, you will need node/npm. Run `npm install grunt-cli -g` in a terminal to install it. The grunt tasks are bundled as `devDependencies`, so an `npm install` will do the trick.

Then finally type `grunt` in a terminal, it will do all the work for you.

Info
====

Libraries used:
* jQuery (jquery.formValues, jquery.knob, jquery.tablesorter) http://jquery.com
* jQuery UI http://jqueryui.com
* jQuery Toggles https://github.com/simontabor/jquery-toggles
* Vex http://github.hubspot.com/vex/
* Riot.js https://github.com/moot/riotjs
* NProgress https://github.com/rstacruz/nprogress
* Farbtastic color picker http://acko.net/blog/farbtastic-jquery-color-picker-plug-in/
* md5 function http://www.webtoolkit.info/javascript-md5.html
* inherits https://github.com/isaacs/inherits
* loadcssjsfile: http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml

License
=======

Same license as PS' client (AGPL).
