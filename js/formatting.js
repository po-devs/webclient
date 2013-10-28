/*
 * This file contains functions to help to format HTML for PO-way
 */

/* Provides support for browsers that have defineProperty - so that functions who which are
    added through .prototype aren't enumerable. Still works fine with IE < 9 (8 can only do this on DOM objects)
    and browsers that don't have it in the first place.
*/
var defineOn = function (core, props) {
    var x, hasDefineProperty = true;

    if ($.browser.msie) {
        if (parseInt($.browser.version, 10) < 9) {
            hasDefineProperty = false;
        }
    }

    if (!Object.defineProperty) {
        hasDefineProperty = false;
    }

    if (hasDefineProperty) {
        for (x in props) {
            Object.defineProperty(core, x, {
                "value": props[x],

                writable: true,
                configurable: true
            });
        }
    } else {
        for (x in props) {
            core[x] = props[x];
        }
    }
};

defineOn(String.prototype, {
    format: function () {
        // http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    },
    splice: function (pos1, n, replace) {
        return this.slice(0, pos1) + replace + this.slice(pos1+n);
    },
    /* Converts xx-yy-zz into Xx-Yy-Zz */
    tu: function() {
        var s = this;
        var prevLetter=false;
        for (var i=0; i < s.length; i++) {
            if (/[a-zA-Z]/.test(s[i])) {
                if (!prevLetter){s[i] = s[i].toUpperCase()}
                prevLetter = true;
            } else {
                prevLetter = false;
            }
        }
        return s;
    }
});

function convertPOLinks(element) {
    $(element).find("img").each(function (index, img) {
        img = $(img);
        var proto = img.attr("src").split(":")[0],
            query = img.attr("src").split(":")[1];

        switch (proto) {
            case "pokemon":
                query = "?" + query;
                var poke = getQueryString("num", query.slice(1).split("&")[0], query) || "1",
                    gen = getQueryString("gen", "5", query),
                    shiny = getQueryString("shiny", "false", query) === "true",
                    gender = getQueryString("gender", "male", query),
                    back = getQueryString("back", "false", query) === "true",
                    cropped = getQueryString("cropped", "false", query) === "true";
                img.error(function () {
                    if (gender == "female") {
                        gender = "male";
                    } else if (shiny) {
                        shiny = false;
                    } else if (gen < 5) {
                        gen = 5;
                    } else {

                        return;
                    }
                    img.attr("src", pokemonPictureUrl(poke, gen, gender, shiny, back));
                }).attr("src", pokemonPictureUrl(poke, gen, gender, shiny, back));
                break;
            case "http":
            case "https":
            case "data": /* base64 */
                break;
            default:
                console.log("Unknown protocol: " + proto);
                break;
        }
    });
}

function pokemonPictureUrl(pokeid, gen, gender, shiny, back) {
    var BASE = "http://pokemon-online.eu/images/pokemon/",
        file;
    if (gen == 1) {
        file = "yellow/{1}{0}.png".format(pokeid, back ? "back/" : "");
    } else if (gen == 2) {
        file = "crystal/{1}{2}{0}.png".format(pokeid, back ? "back/" : "", shiny ? "shiny/" : "");
    } else if (gen == 3) {
        file = "firered-leafgreen/{1}{2}{0}.png".format(pokeid, back ? "back/" : "", shiny ? "shiny/" : "");
    } else if (gen == 4) {
        file = "heartgold-soulsilver/{1}{3}{2}{0}.png".format(pokeid, back ? "back/" : "", gender === "female" ? "female/" : "", shiny ? "shiny/" : "");
    } else if ((gen||5) == 5) {
        file = "black-white/{1}{3}{2}{0}.png".format(pokeid, back ? "back/" : "", gender === "female" ? "female/" : "", shiny ? "shiny/" : "");
    }

    console.log("Pokémon Image URL: " + BASE + file);
    return BASE + file;
}

/* Alias */
function format(element) {
    if (typeof element === "object") {
        convertPOLinks(element);
    } else {
        var el = $("<div>");
        el.html(element);
        convertPOLinks(el);
        return el.html();
    }
}

/* Ported from PO */
function addChannelLinks(line) {
    if (line.indexOf('#') === -1) {
        return line;
    }

    /* scan for channel links */
    var pos = line.indexOf('#', pos);
    var channelNames = channels.channelsByName();

    while (pos !== -1) {
        ++pos;
        var longestName = "";

        channelNames.forEach(function (channelName) {
            if (channelName.length <= longestName.length) {
                return;
            }

            var name = line.substr(pos, channelName.length).toString();

            if (channelName.toLowerCase() === name.toLowerCase()) {
                longestName = name;
            }
        });
        if (longestName) {
            var html = "<a href=\"po:join/" + escapeSlashes(longestName) + "\">#" + longestName + "</a>";
            line = line.splice(pos - 1, longestName.length + 1, html);
            pos += html.length - 1;
        }
        pos = line.indexOf('#', pos);
    }
    return line;
}

/* Ported from PO */
function escapeHtml(toConvert)
{
    var ret = toConvert;

    ret = ret.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\b((?:https?|ftp):\/\/\S+)/gi, "<a href='$1' target='_blank'>$1</a>")
        .replace(/&amp;(?=[^\s<]*<\/a>)/gi, "&");
    /* Revert &amp;'s to &'s in URLs */


    return ret;
}

function stripHtml(str)
{
    return str.replace(/<\/?[^>]*>/g, "");
}

function escapeSlashes(str) {
    return str.replace(/'/g, "&apos;").replace(/"/g, '&quot;');
}

function unescapeSlashes(str) {
    return str.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
}
