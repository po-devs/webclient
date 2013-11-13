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

Thanks to github pages you can test the current repository with this url: http://po-devs.github.io/webclient/?server=default&autoconnect=true

Add the query parameter 'user' to automatically have your username set up, or 'server' to use a different server than PO's main server.

Buster Testing
==============

This uses [buster.js](http://docs.busterjs.org/en/latest/) to run tests. Those tests are run for each commit on the
Travis-CI platform (check out the build icon!).

Info
====

Libraries used:
- jQuery
- jQuery UI
- alertify https://github.com/fabien-d/alertify.js
- md5 function http://www.webtoolkit.info/javascript-md5.html
- farbtastic color plugin http://acko.net/blog/farbtastic-jquery-color-picker-plug-in/
- loadcssjsfile: http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
- inheritance http://www.crockford.com/javascript/inheritance.html
