Webclient for Pokémon Online
============================

It connects to a relay station, which in turns connects to a PO server. If
you want multiple webclients to be able to connect to your server through
a relay station, you'd better add the relay station to the proxy servers
in your server config.

The host of the official PO relay station is ws://server.pokemon-online.eu:10508

Cloning
=======

This contains a submodule, so don't forget to do the following commands after the initial clone:
```sh
git submodule init
git submodule update
```

When merging a commit, if their ps/ folder has changed head, you need to do the following command in order to update the submodule folder in your local directory:
```sh
git submodule update
```

Info
====

Libraries used:
- jQuery
- jQuery UI
- alertify https://github.com/fabien-d/alertify.js
- md5 function http://www.webtoolkit.info/javascript-md5.html
- farbtastic color plugin http://acko.net/blog/farbtastic-jquery-color-picker-plug-in/
- loadcssjsfile: http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
- Pokemon Showdown http://play.pokemonshowdown.com/
- inheritance http://www.crockford.com/javascript/inheritance.html
