/* Function to search names in the playerlist */
(function($) {
    $.fn.extend({
        filterFor: function(listSelector) {
            var   self = this
                , $titles = $(listSelector)
            // The list with keys to skip (esc, arrows, return, etc)
            // 8 is backspace, you might want to remove that for better usability
                , keys = [13, 27, 32, 37, 38, 39, 40 /*,8*/ ]
                ;

            if ($titles.length !== 0) {
                if(!$titles.is('ul,ol')){
                    $titles = $titles.find('ul,ol');
                }
//                                    $titles.each(function(index, node) {
//                                        cache[index] = $(node);
//                                    });

                $(this).keyup(function(e) {
                    var val = $(self).val().toLowerCase();
                    if ($.inArray(e.keyCode, keys) === -1) {
                        $titles.find('li').each(function() {
                            var $node = $(this);

                            if ($node.html().toLowerCase().indexOf(val) === -1) {
                                $node.hide();
                            } else {
                                $node.show();
                            }
                        });
                    }
                });
            }

            return this;
        }
    });
}(jQuery));

$(function() {
    $('#search_filter').filterFor('#player-list', {caseSensitive : false});
    /* The Player list also needs to know the filter, when it adds new elements whether to show them or not */
    $('#search_filter').keyup(function(){playerList.filter=$(this).val().toLowerCase();});
});

$(function() {
    var cookieRelay = $.cookie("relay");
    if (cookieRelay) {
        $("#relay").val(cookieRelay);
    }
    if ($.cookie("username")) {
        $("#username").val($.cookie("username"));
    }
    if ($.cookie("password")) {
        $("#password").val($.cookie("password"));
    }

    $("#servers-list tbody").on('click', 'tr', function() {
        $("#advanced-connection").val($(this).find(' td:last-child').text());
    });
    $('#channel-tabs').tabs()
        .find(".ui-tabs-nav")
        .sortable({
            axis: "x",
            stop: function() {
                $("#channel-tabs").tabs("refresh");
            }
        }); // Makes the channel tabs sortable.

    /* Gets the current object owning a tab from the hrefid of the tab */
    objFromId = function(hrefid) {
        var id = hrefid.substr(hrefid.lastIndexOf("-")+1);
        var ret = undefined;
        if (/^#channel-/.test(hrefid)) {
            ret = channels.hasChannel(id) ? channels.channel(id) : undefined;
        } else if (/^#pm-/.test(hrefid)) {
            ret = pms.pm(id);
        } else if (/^#battle-/.test(hrefid)) {
            ret = battles.battle(id);
        }
        return ret;
    };

    room = null;
    currentChannel = -1;

    switchToTab = function(hrefid) {
        room = objFromId(hrefid);
        $('#channel-tabs').tabs("select", hrefid);
    };

    $("#channel-tabs").on('tabsselect', function(event, ui) {
        var hrefid = $(ui.tab).attr("href");
        var id = hrefid.substr(hrefid.lastIndexOf("-")+1);

        /* Changes the current object in memory */
        room = objFromId(hrefid);
        currentChannel = -1;

        if (/^#channel-/.test(hrefid)) {
            if (channels.hasChannel(id)) {
                currentChannel = id;
            }
        }
        /* Update player list when switching channels */
        playerList.setPlayers(room.playerIds());
    });

    $("#channel-tabs").bind('tabsshow', function(event, ui) {
        var hrefid = $(ui.tab).attr("href");

        /* Resizes channel tabs, if window height changed */
        $("#channel-tabs").height($(window).height()-$("#channel-tabs").offset().top-10);
        /* Resizes chat area in funciton of the height of the channel tab */
        /* Scrolls down the chat of the current tab */
        $(hrefid+" #chatTextArea").get(0).scrollTop = $(hrefid+" #chatTextArea").get(0).scrollHeight;

        /* The tab is selected now, so any unseen activity is removed */
        $(ui.tab).removeClass("tab-active tab-flashing");
    });

    $("#channel-tabs").bind('tabscreate', function(event, ui) {
        var hrefid = $(ui.tab).attr("href");
        room = objFromId(hrefid);
    });

    $("#colorDialog").dialog({autoOpen: false, beforeClose:function(event) {
        websocket.send("teamChange|" + JSON.stringify({"color": colorPickerColor, "name": $("#trainer-name").val() || players.myname()}));
    }
    });
    $("#channel-tabs").height($(window).height()-$("#channel-tabs").offset().top-10);
    $(document).on("click", "a", function (event) {
        var href = this.href;

        if (/^po:/.test(href)) {
            event.preventDefault();

            var params = [href.slice(3, href.indexOf("/")), decodeURIComponent(href.slice(href.indexOf("/")+1))];

            // Add other commands here..
            var pid = players.id(params[1]);
            if (pid === -1)
                pid = parseInt(params[1]);
            if (params[0] === "join") {
                joinChannel(params[1]);
            } else if (params[0] == "pm") {
                if (!isNaN(pid))
                    pms.pm(pid);
            } else if (params[0] == "ignore") {
                // Ignore the user
                if (!isNaN(pid)) {
                    if (players.isIgnored(pid)) {
                        players.addIgnore(pid);
                    } else {
                        players.removeIgnore(pid);
                    }
                }
            } else if (params[0] == "watch") {
                var bid = params[1];
                websocket.send("watch|"+bid);
            }
            // TODO: watchbattle(id/name), reconnect(void)
        } else {
            /* Make sure link opens in a new window */
            this.target = "_blank";
        }
    });

    $(document).on("keydown", "input[history=true],textarea[history=true]", function (event) {
        var elem = event.currentTarget,
            maxHistSize = 100;
        elem.hist = elem.hist || [];
        elem.histIndex = elem.histIndex || 0;
        if (event.which == 38) { // Up
            if (elem.histIndex == elem.hist.length && elem.value.match(/\S/)) {
                elem.hist.push(elem.value);
                if (elem.hist.length > maxHistSize) {
                    elem.hist.shift();
                }
            }
            if (elem.histIndex > 0) {
                elem.value = elem.hist[--elem.histIndex];
            }
        } else if (event.which == 40) { // Down
            if (elem.histIndex < elem.hist.length) {
                elem.value = elem.hist[++elem.histIndex] || "";
            }
        } else if (event.which == 13) { // Return
            elem.hist.push(elem.value);
            if (elem.hist.length > maxHistSize) {
                elem.hist.shift();
            }
            elem.histIndex = elem.hist.length;
            elem.value = "";
        }
    });

    playerList = new PlayerList();
    players = new Players();
    pms = new PMs();
    channels = new Channels();
    battles = new Battles();
    currentChannel = 0;

    $("#join-channel").autocomplete({
        source: function (request, response) {
            var channelNames = (Object.keys(channels.names).map(function (value, index, array) {
                return channels.names[value];
            }));

            var req = new RegExp("^"+$.ui.autocomplete.escapeRegex(request.term), "gi");
            var possibleChannels = [];

            channelNames.forEach(function (value, index, array) {
                /* Limits result to 30 channels. In the future should not limit but instead css the
                 autocomplete so that a long results list would be scrollable */
                if (req.test(value) && possibleChannels.length <= 29) {
                    possibleChannels.push(value);
                }
            });
            possibleChannels.sort();

            response(possibleChannels);
        },
        /* Makes you join the channel as soon as element is selected */
        select: function(event, ui) {
            joinChannel(ui.item.value);
            return false;
        }
    });

    $(window).bind("beforeunload", function () {
        if (websocket && websocket.readyState === 1 && $("#option-ConfirmExit").is(":checked")) {
            return "Are you sure that you want to close the Pokémon Online Webclient?\n\nYou are currently connected to a server.";
        }
    });

    $("#option-ConfirmExit").attr("checked",  localStorage.getItem("ConfirmExit") === "true");

    $(window).unload(function () {
        localStorage.setItem("ConfirmExit", $("#option-ConfirmExit").is(":checked"));
    });

    if ($.cookie("autoload")) {
        $("#autoload").attr("checked", true);
        initWebsocket();
    }

    $("#autoload").click(function() {
        if($(this).is(':checked')) {
            $.cookie("autoload", true, {expires:365});
        } else {
            $.removeCookie("autoload");
        }
    });
});

var dataInitiated = false;
initBattleData = function() {
    if (dataInitiated) {
        return;
    }

    /* Loading PS files */
    /* TODO: Show a loading image for the time it takes to load all this */
    dataInitiated = 'loading';

//                loadjscssfile("libs/ps/js/battledata.js", "js");
//                loadjscssfile("libs/ps/data/pokedex-mini.js", "js");
//                loadjscssfile("libs/ps/js/battle.js", "js");
//                /* loadjscssfile("libs/ps/js/sim.js", "js");*/
//                /* loadjscssfile("libs/ps/data/learnsets.js", "js"); */
//                loadjscssfile("libs/ps/data/graphics.js", "js");
//                loadjscssfile("libs/ps/data/pokedex.js", "js");
//                loadjscssfile("libs/ps/formats-data.js", "js");
//                loadjscssfile("libs/ps/data/moves.js", "js");
//                loadjscssfile("libs/ps/data/items.js", "js");
//                loadjscssfile("libs/ps/data/abilities.js", "js");
//                loadjscssfile("libs/ps/data/formats.js", "js");
//                /* loadjscssfile("libs/data/typechart.js", "js"); */
//                loadjscssfile("libs/ps/js/utilichart.js", "js");
//                /* loadjscssfile("libs/data/aliases.js", "js"); */
    loadjscssfile("ps/style/battle.css", "css");
    loadjscssfile("ps/style/sim-types.css", "css");
    loadjscssfile("ps/style/replayer.css", "css");
    loadjscssfile("css/ps.css", "css");

    dataInitiated = true;
};

/* Player that is shown in the trainer window */
currentOpenPlayer = -1;
$("#player-dialog").dialog({
    autoOpen: false,
    modal: true,
    resizeable: false,
    close: function() {
        currentOpenPlayer = -1;
    }
});

var updatePlayerInfo = function(player) {
    $("#player-dialog .avatar").html("<img src='http://pokemon-online.eu/images/trainers/" + (player.avatar||1) + ".png' />");
    var info = player.info || '';
    if (info.indexOf("<") != -1) {

        /* If there's even the slightest risk of XSS attack, use an iframe to protect ourselves */
        /* Use two different domain names depending on where the webclient is hosted */
        var remotepage = "http://po-devs.github.com/webclient/trainerinfo.html";
        if (window.location.protocol !== "file:" && remotepage.indexOf(document.domain) !== -1) {
            remotepage = "http://pokemon-online.eu/webclient/trainerinfo.html";
        }

        /* Make sure to use a different domain to block XSS */
        if (window.location.protocol === "file:" || remotepage.indexOf(document.domain) === -1) {
            var path = window.location.pathname;
            var dir = path.substr(0, path.lastIndexOf("/"));
            info = "<div class='iframe-trainer-info'>"+info+"</div>"
            $("#player-dialog .trainer-info").html("<iframe src='" + remotepage + "?content=" + window.btoa(format(info))+"&css="
                + window.btoa(window.location.protocol + "//" + window.location.hostname + dir + "/css/webclient.css") + "'></iframe>");
        } else {
            $("#player-dialog .trainer-info").text(info);
        }
    } else {
        $("#player-dialog .trainer-info").text(info);
    }
};
$("#player-list").on("click", "li", function(event) {
    var id = event.currentTarget.id.split("-")[1];
    currentOpenPlayer = id;
    var dialog = $("#player-dialog");
    dialog.html('<div class="avatar"></div><div class="trainer-info">loading...</div>');
    var player = players.id(id);

    if (player.hasOwnProperty("info")) {
        updatePlayerInfo(player);
    } else {
        websocket.send("player|"+id);
    }
    /* Show the list of battles in the player info */
    if (battles.isBattling(id)) {
        for (var bid in battles.battlesByPlayer[id]) {
            var battle = battles.battlesByPlayer[id][bid];
            var opp = (battle.ids[0] == id ? battle.ids[1] : battle.ids[0]);
            dialog.append($("<div class='player-info-battle'><a href='po:watch/"+ bid +"' onclick='$(\"#player-dialog\").dialog(\"close\");'>Watch</a> battle against "
                + escapeHtml(players.name(opp)) +"</div>"));
        }
    }
    dialog.dialog("option", "title", players.name(id));
    var buttons = [
        {
            text: "Send Private Message",
            click: function() { pms.pm(id); dialog.dialog("close"); }
        }
    ];
    if (players.isIgnored(id)) {
        buttons.push({
            text: "Unignore",
            click: function() { players.removeIgnore(id); dialog.dialog("close"); }
        });
    } else {
        buttons.push({
            text: "Ignore",
            click: function() { players.addIgnore(id); dialog.dialog("close"); }
        });
    }
    dialog.dialog("option", "buttons", buttons);
    dialog.dialog("option", "position", [event.pageX, event.pageY]);
    dialog.dialog("open");
});

// Make register button disabled
$("#register").attr("disabled", true);

function wannaRegister() {
    if (!(websocket && websocket.readyState === 1)) {
        return;
    }
    websocket.send("register|");
}

colorPickerTriggered = false;
var colorPickerColor;
function openColorPicker() {
    $("#colorDialog").dialog("open");
    var colorPicker = $("#colorPicker");
    colorPicker.farbtastic(function(color) {colorPickerColor = color;});

    $("#trainer-name").val(players.name(players.myid));
}

websocket = null;
var announcement = $("#announcement");

function displayMessage(message, html, parseExtras)
{
    if (!html) {
        html = false;
    }

    for (id in channels.channels) {
        channels.channel(id).print(message, html, !parseExtras);
    }
}

function findBattle()
{
    websocket.send("findbattle|"+JSON.stringify({"sameTier":true, "range":300}));
}

function sendMessage(sender)
{
    if (websocket !== null) {
        var $inputText = $(sender);
        var message = $.trim($inputText.val()).split("\n");
        var idsender = $inputText.attr("id");
        var targetid = idsender.substr(idsender.lastIndexOf("-")+1);

        message.forEach(function(msg) {
            if (/^send-channel-/.test(idsender)) {
                /* Temporary until interface is improved */
                if (/^\/pm/i.test(msg)) {
                    var pid = players.id(msg.slice(4));
                    if (pid !== -1) {
                        pms.pm(pid);
                        return;
                    }
                }
                var strToSend = "chat|" + JSON.stringify({"channel": targetid, message: msg});
            } else if (/^send-pm-/.test(idsender)) {
                var strToSend = "pm|" + JSON.stringify({"to": targetid, message: msg});
                pms.pm(targetid).print(players.myid, msg);
            } else if (/^send-battle-/.test(idsender)) {
                var battle = battles.battles[targetid];
                var strToSend = (battle.isBattle() ? "battlechat|": "spectatingchat|") + targetid + "|" + msg;
            }
            websocket.send( strToSend );
            console.log( "Message sent :", '"'+strToSend+'"' );
        });
    } else {
        displayMessage("ERROR: Connect to the relay station before sending a message.");
    }
}

function joinChannel(chan)
{
    if (websocket)  {
        var $inputChannel = $("#join-channel");
        var channel = chan || $inputChannel.val();

        $inputChannel.val("");
        websocket.send("join|"+channel);
    }
}

var parseCommand;
var relayIP;

function initWebsocket()
{
    try
    {
        if ( typeof MozWebSocket == 'function' )
            WebSocket = MozWebSocket;
        if ( websocket && websocket.readyState == 1 )
            websocket.close();

        var fullIP = $("#relay").val();
        displayMessage("Connecting to " + fullIP);

        relayIP = fullIP;
        relayIP = relayIP.substr(0, relayIP.lastIndexOf(":"));

        $.cookie("relay", fullIP, { expires: 365 });

        websocket = new WebSocket( "ws://"+fullIP );
        websocket.onopen = function( evt ) {
            displayMessage( "CONNECTED" );
        };
        websocket.onclose = function( evt ) {
            displayMessage( "DISCONNECTED" );
        };
        websocket.onmessage = function( evt ) {
            if (evt.data.length < 120) {
                //console.log( "Message received :", evt.data );
            }

            if (evt.data.indexOf("|") != -1) { parseCommand(evt.data);} else displayMessage( evt.data );
        };
        websocket.onerror = function( evt ) {
            displayMessage( 'ERROR: ' + evt.data );
        };
    }
    catch( exception )
    {
        displayMessage( 'ERROR: ' + exception );
    }
}

function stopWebsocket()
{
    if ( websocket ) {
        websocket.close();
    }
}

function checkSocket()
{
    if ( websocket != null )
    {
        var stateStr;
        switch ( websocket.readyState )
        {
            case 0:
                stateStr = "CONNECTING";
                break;
            case 1:
                stateStr = "OPEN";
                break;
            case 2:
                stateStr = "CLOSING";
                break;
            case 3:
                stateStr = "CLOSED";
                break;
            default:
                stateStr = "UNKNOW";
                break;
        }
        displayMessage( "Websocket state = " + websocket.readyState + " ( " + stateStr + " )" );
    }
    else
    {
        displayMessage( "Websocket is null" );
    }
}

function connect() {
    websocket.send("connect|" + $("#advanced-connection").val());
    $(".page").toggle();
}

parseCommand = function(message) {
    var cmd = message.substr(0, message.indexOf("|"));
    var data = message.slice(message.indexOf("|")+1);

    if (cmd == "defaultserver") {
        /* If the server is on the same IP as the relay, we display the server IP but
         send localhost */
        var server = data.replace("localhost", relayIP);

        var qserver = getQueryString("server");

        if (qserver != "default" && qserver) {
            $("#advanced-connection").val(qserver);
        } else {
            $("#advanced-connection").val(server);
        }

        if (getQueryString("autoconnect") === "true") {
            connect();
        } else {
            websocket.send("registry");
        }
    } else if (cmd == "servers") {
        var servers = JSON.parse(data);

        for (var i = 0; i < servers.length; i++) {
            var server = servers[i];
            var html = "<tr><td>" + server.name + "</td><td>" + server.num + ("max" in server ? " / " + server.max : "") + "</td>"
                + "<td>"+server.ip+":" + server.port + "</td></tr>";
            $("#servers-list tbody").prepend(html);
        }

        $("#servers-list").tablesorter({sortList: [[1,1]]});
    } else if (cmd == "connected") {
        displayMessage("Connected to server!");

        var username = $("#username").val();
        if (username && username.length > 0) {
            $.cookie("username", username, {expires:365});
        } else {
            $.removeCookie("username");
        }

        var data = {version: 1};
        if (getQueryString("user") || username) {
            data.name = getQueryString("user") || username;
            data.default = getQueryString("channel");
            data.autojoin = getQueryString("autojoin");
            if (data.autojoin) {
                data.autojoin = data.autojoin.split(",");
            }
            websocket.send("login|"+JSON.stringify(data));
        } else {
            var oldLabel = alertify.labels.cancel + '';

            alertify.labels.cancel = "Login as Guest";
            alertify.prompt("Username", function (e, str) {

                if (e && str) {
                    data.name = str;
                }

                /* Optional parameters: away, color, ladder */
                websocket.send("login|"+JSON.stringify(data));
            });

            alertify.labels.cancel = oldLabel;
        }
    } else if (cmd == "disconnected") {
        displayMessage("Disconnected from server!");
        announcement.hide("slow");
    } else if (cmd == "msg" || cmd == "error") {
        displayMessage(data);
    } else if (cmd == "chat") {
        var params = JSON.parse(data);
        var msg = params.message;

        if (params.channel == -1 && params.message.charAt(0) != "~") {
            displayMessage(msg, params.html, true);
        } else {
            channels.channel(params.channel).print(msg, params.html);
        }
    } else if (cmd == "challenge") {
        var password = $("#password").val();
        if (password) {
            var hash = MD5(MD5(password)+data);
            $.cookie("pass-"+data, hash, {expires:365});
            websocket.send("auth|" + hash);
        } else {
            if ($.cookie("pass-"+data)) {
                websocket.send("auth|" + $.cookie("pass-"+data));
            } else {
                alertify.pass("Please enter your password", function (e, str) {
                    if (e) {
                        // after clicking OK
                        // str is the value from the textbox
                        var hash = MD5(MD5(str)+data);
                        websocket.send("auth|" + hash);
                    } else {
                        // after clicking Cancel
                        stopWebsocket();
                    }
                });
            }
        }
    } else if (cmd == "announcement") {
        announcement.html(data);
        format(announcement);

        announcement.css("visibility", "visible");
    } else if (cmd == "channels") {
        var params = JSON.parse(data);
        channels.setNames(params);
    } else if (cmd == "newchannel") {
        var params = JSON.parse(data);
        channels.newChannel(params.id, params.name);
    } else if (cmd == "removechannel") {
        channels.removeChannel(data);
    } else if (cmd == "channelnamechange") {
        var params = JSON.parse(data);
        channels.changeChannelName(params.id, params.name);
    } else if (cmd === "players") {
        /* Can contain multiple players */
        var params = JSON.parse(data);
        players.addPlayer(params);

        if (currentOpenPlayer !== -1 && currentOpenPlayer in params && "info" in params[currentOpenPlayer]) {
            updatePlayerInfo(params[currentOpenPlayer]);
        }
    } else if (cmd === "playerlogout") {
        players.removePlayer(data);
    } else if (cmd === "join") {
        var channel = data.split("|")[0];
        var player = data.split("|")[1];

        channels.channel(channel).newPlayer(player);
    } else if (cmd === "leave") {
        var channel = data.split("|")[0];
        var player = data.split("|")[1];

        channels.channel(channel).removePlayer(player);
        players.testPlayerOnline(player);
    } else if (cmd === "channelplayers") {
        var params = JSON.parse(data);
        channels.channel(params.channel).setPlayers(params.players);
    } else if (cmd === "login") {
        var params = JSON.parse(data);
        players.login(params.id, params.info);
    } else if (cmd === "unregistered") {
        $("#register").attr("disabled", false);
    } else if (cmd === "pm") {
        var params = JSON.parse(data);
        pms.pm(params.src).print(params.src, params.message);
    } else if (cmd === "watchbattle") {
        initBattleData();
        var id = data.split("|")[0];
        var params = JSON.parse(data.slice(id.length+1));
        battles.watchBattle(+(id), params);
    } else if (cmd === "battlecommand") {
        var battleid = data.split("|")[0];
        if (battleid in battles.battles) {
            battles.battle(battleid).dealWithCommand(JSON.parse(data.slice(battleid.length+1)));
        }
    } else if (cmd === "battlestarted") {
        var battleid = data.split("|")[0];
        var battle = JSON.parse(data.slice(battleid.length+1));

        if (battle.team) {
            initBattleData();
        }

        var obj = {};
        obj[battleid] = battle;
        battles.addBattle(obj);
    } else if (cmd === "channelbattle") {
        var chanid = data.split("|")[0];
        var params = JSON.parse(data.slice(chanid.length+1));
        var battleid = params.battleid;
        var battle = params.battle;
        var obj = {};
        obj[battleid] = battle;
        battles.addBattle(obj);
    } else if (cmd === "channelbattlelist") {
        var chanid = data.split("|")[0];
        var batt = JSON.parse(data.slice(chanid.length+1));
        battles.addBattle(batt);

        /* Update whole player list */
        if (chanid == currentChannel) {
            playerList.setPlayers(room.playerIds());
        }
    } else if (cmd === "battlefinished") {
        var battleid = data.split("|")[0];
        var result = JSON.parse(data.slice(battleid.length+1));
        battles.battleEnded(battleid, result);
    }
};
