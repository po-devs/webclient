/*
 * This file contains functions to help to format HTML for PO-way
 */


String.prototype.format = function() {
    /* http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436 */
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
        ;
    });
};

function convertPOLinks(element) {
    $(element).find("img").each(function(index, img) {
        img = $(img);
        var proto = img.attr("src").split(":")[0],
            query = img.attr("src").split(":")[1]

        switch (proto) {
        case "pokemon":
            var poke = query.split("&")[0] || "1",
                gen = getQuerystring("gen","5",query),
                shiny = getQuerystring("shiny","false",query) === "true",
                gender = getQuerystring("gender","male",query),
                back = getQuerystring("back","false",query) === "true",
                cropped = getQuerystring("cropped","false",query) === "true";
            img.error(function() {
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
        file = "yellow/{1}{0}.png".format(pokeid, back?"back/":"");
    } else if (gen == 2) {
        file = "crystal/{1}{2}{0}.png".format(pokeid, back?"back/":"",shiny?"shiny/":"");
    } else if (gen == 3) {
        file = "firered-leafgreen/{1}{2}{0}.png".format(pokeid, back?"back/":"",shiny?"shiny/":"");
    } else if (gen == 4) {
        file = "heartgold-soulsilver/{1}{3}{2}{0}.png".format(pokeid, back?"back/":"",gender=="female"?"female/":"",shiny?"shiny/":"");
    } else if (gen == 5) {
        file = "black-white/{1}{3}{2}{0}.png".format(pokeid, back?"back/":"",gender=="female"?"female/":"",shiny?"shiny/":"");
    }
    console.log("[pokemonPictureURl]: " + file);
    return BASE + file;
}

function format(element) {
    convertPOLinks(element);
}
