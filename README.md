Webclient for Pokémon Online
============================
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

Testing
=======

This uses [Mocha](http://visionmedia.github.io/mocha/) to run tests. Those tests are run for each commit on the
Travis-CI platform (check out the build icon!).

If you want to run them manually, have [Node.js](http://nodejs.com) installed and type `npm test` in a console. If you haven't installed Mocha yet, do that first (after you install node): `npm install`.

Info
====

Libraries used:
- jQuery (jquery.formValues, jquery.knob, jquery.tablesorter)
- jQuery UI
- alertify https://github.com/fabien-d/alertify.js
- md5 function http://www.webtoolkit.info/javascript-md5.html
- farbtastic color plugin http://acko.net/blog/farbtastic-jquery-color-picker-plug-in/
- loadcssjsfile: http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
- inherits https://github.com/isaacs/inherits

License
=======

Same license as PS' client (AGPL).
