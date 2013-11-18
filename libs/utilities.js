function sanitize(str, jsEscapeToo) {
    str = (str?''+str:'');
    str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    if (jsEscapeToo) str = str.replace(/'/g, '\\\'');
    return str;
}

function cleanHtmlAttribute(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

String.prototype.startsWith = function(str) { return this.lastIndexOf(str, 0) === 0; }

function getQueryString(key, default_,query_) {
    var match = RegExp('[?&]' + key + '=([^&]*)')
        .exec(query_ || window.location.search);
    return (match && decodeURIComponent(match[1].replace(/\+/g, ' '))) || default_;
}

function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script');
        fileref.setAttribute("src", filename);
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (typeof fileref!="undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref)
    }
}

function push_properties(from, to) {
    for (var p in from) {
        to[p] = from[p];
    }
}

function toId(text) {
    text = text || '';
    if (typeof text === 'number') text = ''+text;
    if (typeof text !== 'string') return toId(text && text.id);
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/* https://github.com/isaacs/inherits/blob/master/inherits_browser.js */

Function.inherits = function (ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
};

mobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
