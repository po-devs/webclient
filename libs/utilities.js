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
        fileref.setAttribute("type", "text/javascript");
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

/* Inheritance http://www.crockford.com/javascript/inheritance.html */

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

Function.method('inherits', function (parent) {
    this.prototype = new parent();
    var d = {},
        p = this.prototype;
    this.prototype.constructor = parent;
    this.method('uber', function uber(name) {
        if (!(name in d)) {
            d[name] = 0;
        }
        var f, r, t = d[name], v = parent.prototype;
        if (t) {
            while (t) {
                v = v.constructor.prototype;
                t -= 1;
            }
            f = v[name];
        } else {
            f = p[name];
            if (f == this[name]) {
                f = v[name];
            }
        }
        d[name] += 1;
        r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
        d[name] -= 1;
        return r;
    });
    return this;
});

mobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
