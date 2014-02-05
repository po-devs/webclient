/*
 * This file contains functions to help to format HTML for PO-way
 */

function convertPOLinks(element) {
    $(element).find("img").each(function (index, img) {
        img = $(img);
        var proto = img.attr("src").split(":")[0],
            query = img.attr("src").split(":")[1];

        switch (proto) {
            case "pokemon":
                query = "?" + query;
                var poke = utils.queryField("num", query.slice(1).split("&")[0], query) || "1",
                    gen = utils.queryField("gen", "5", query),
                    shiny = utils.queryField("shiny", "false", query) === "true",
                    gender = utils.queryField("gender", "male", query),
                    back = utils.queryField("back", "false", query) === "true",
                    cropped = utils.queryField("cropped", "false", query) === "true";

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

                    img.attr("src", pokeinfo.sprite({num: poke, female: gender === "female", shiny: shiny}, {gen: gen, back: back}));
                }).attr("src", pokeinfo.sprite({num: poke, female: gender === "female", shiny: shiny}, {gen: gen, back: back}));
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

(function () {
    var testIframe = document.createElement('iframe');
    var hasIframeSrcdoc = typeof testIframe.srcDoc === 'string' || typeof testIframe.srcdoc === 'string';

    // TODO: Support for older browsers (that have the sandbox attribute).
    function showHtmlInFrame(selector, html) {
        var elem = $(selector);
        html = html || '';
        if (html.indexOf("<") !== -1 && hasIframeSrcdoc) {
            elem.html("<iframe frameBorder='0' width='100%' seamless sandbox='' srcdoc='<link rel=\"stylesheet\" href=\"css/style.css\">" + utils.escapeHtmlQuotes(format(html)) + "'></iframe>");
        } else {
            elem.text(html);
        }
    }

    window.showHtmlInFrame = showHtmlInFrame;
}());
