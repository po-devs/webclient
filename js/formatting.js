/*
 * This file contains functions to help to format HTML for PO-way
 */

function convertPOLinks(element) {
    element = $(element);
    element.find("img").each(function (index, img) {
        img = $(img);
        var src = img.attr("src").split(":"),
            proto = src[0],
            query = src[1];

        switch (proto) {
            case "pokemon":
                query = "?" + query;
                var poke = utils.queryField("num", query.slice(1).split("&")[0], query) || "1",
                    gen = utils.queryField("gen", "6", query),
                    shiny = utils.queryField("shiny", "false", query) === "true",
                    gender = utils.queryField("gender", "male", query),
                    back = utils.queryField("back", "false", query) === "true",
                    cropped = utils.queryField("cropped", "false", query) === "true";

                img.error(function () {
                    if (gender == "female") {
                        gender = "male";
                    } else if (gen < 6) {
                        gen = 6;
                    } else if (gen === 6) {
                        gen = 5;
                    } else if (shiny) {
                        shiny = false;
                    } else if (back) {
                        back = false;
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
    return element;
}

(function () {
    var iframe = document.createElement('iframe');
    var hasIframeSandbox = 'sandbox' in iframe;

    function showHtmlInFrame(selector, html) {
        html = html || '';
        var elem = $(selector),
            containsHtml = html.contains("<"),
            secureIframe, formattedHtml, contentDocument, docbody;

        if (containsHtml && hasIframeSandbox) {
            // If we want to format html, we will have to use a sandboxed iframe.
            // Otherwise things like
            // <img src='xss' onerror='alert("xss");">
            // Will execute

            // To access the contentDocument, we must set allow-same-origin
            elem.html("<iframe width='100%' frameborder='0' seamless sandbox='allow-same-origin'></iframe>");
            secureIframe = elem.find("iframe").get(0);
            contentDocument = secureIframe.contentDocument;

            if (!contentDocument) {
                elem.text(html);
                return;
            }

            docbody = contentDocument.body;

            // There is a really complicated security problem going on here.
            // We can't just run format on html, otherwise events are executed:
            // <img src='xss' onerror='alert("xss");">
            // This is because html is executed on the master window ($("<div>").html(...))

            // We first set the html (which is safe, thanks to sandbox)
            docbody.innerHTML = html;

            // Then format that
            convertPOLinks(docbody);
            formattedHtml = docbody.innerHTML;

            // Then clear the entire document (probably not necessary but doing it anyway)
            contentDocument.getElementsByTagName('html')[0].innerHTML = '';
            // Then add the formatted html
            docbody.innerHTML = "<link rel=\"stylesheet\" href=\"css/style.css\">" + formattedHtml;

            // Remove allow-same-origin (just in case)
            secureIframe.sandbox = '';
        } else {
            elem.text(html);
        }
    }

    window.showHtmlInFrame = showHtmlInFrame;
}());
