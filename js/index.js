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

vex.defaultOptions.className = 'vex-theme-os';
teambuilder = null;
$(function() {
    var mode = 'content',
        $teambuilder = $("#teambuilder"),
        $user_params = $("#user_params"),
        $content = $("#content"),
        $middle_block = $(".middle_block"),
        $teampreview = $(".team_preview"),
        previewsInit = false;

    $("#tab-titles").on('click', 'li i', function() {
        if($("#tab-titles li").length > 1)
        {
            var dparent = $(this).parent().parent();
            var href = dparent.attr("href");
            objFromId(href).close();
        }
    });

    $(".dropdown_button").click(function() {
        var $this = $(this);
        $this.find('i').toggle();
        $this.parent().find('.dropdown_content').toggle();
        if ($this.data('teambuilder') && !previewsInit) {
            previewsInit = true;
            teambuilder.loadTeamPreviews();
        }
    });

    $teampreview.click(function () {
        var $this = $(this);
        $teampreview.removeClass('current_team');
        $this.addClass('current_team');
    }).dblclick(function () {
        toggleContent('teambuilder');
        teambuilder.loadTeamFrom($(this));
    });

    // Type should be one of: content, user_params, teambuilder
    function toggleContent(type) {
        if (mode === 'user_params' || mode === 'teambuilder' || type === 'content') {
            $content.show();
            type = 'content';
        } else if (type === 'user_params') {
            $user_params.show();
        } else if (mode === 'content' || type === 'teambuilder') {
            teambuilder.init();
            $teambuilder.show();
            type = 'teambuilder';
        }

        mode = type;
    }

    $("#trainer_username, #create_team, #po_title").on('click', function() {
        $middle_block.hide();

        switch(this.id) {
        case 'trainer_username':
            toggleContent('user_params');
        break;
        case 'create_team':
            toggleContent('teambuilder');
        break;
        case 'po_title':
            toggleContent();
        break;
        }
    });
    $("#battle-html").load("battle.html");
    $("#teambuilder").load("teambuilder.html", function() {
        setTimeout(function () {
            /* Teambuilder */
            teambuilder = new Teambuilder();
        }, 4); // 4 is the minimum delay
    });
});

$(function() {
    var storedRelayIp = poStorage("relay");
    $("#relay").keydown(function (e) {
        if (e.which === 13) { // Enter
            initWebsocket();
        }
    }).val(storedRelayIp || "server.pokemon-online.eu:10508");

    var username = poStorage("username"), password = poStorage("password");
    if (username) {
        $("#username").val(username);
    }
    if (password) {
        $("#password").val(password);
    }

    $("#servers-list tbody").on('click', 'tr', function() {
        var $this = $(this);
        $("#advanced-connection").val($this.find('.server-ip').text());
        showHtmlInFrame("#server-description", serverDescriptions[$this.find('.server-name').text()]);
    }).on('dblclick', 'tr', function () {
        connect();
    });

    $("#advanced-connection, #username, #password").on("keydown", function (e) {
        if (e.which === 13) { // Enter
            connect();
        }
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
        var ret;
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
    }).bind('tabsshow', function(event, ui) {
        var hrefid = $(ui.tab).attr("href");

        /* Resizes chat area in funciton of the height of the channel tab */
        /* Scrolls down the chat of the current tab */
        var chattextarea = $(hrefid+" #chatTextArea").get(0);
        chattextarea.animate({scrollTop: chattextarea.height()}, "fast");

        /* The tab is selected now, so any unseen activity is removed */
        $(ui.tab).removeClass("tab-active tab-flashing");
    }).bind('tabscreate', function(event, ui) {
        var hrefid = $(ui.tab).attr("href");
        room = objFromId(hrefid);
    });

    $("#colorDialog").dialog({
        autoOpen: false,
        beforeClose: function(event) {
            websocket.send("teamChange|" + JSON.stringify({"color": colorPickerColor, "name": $("#trainer-name").val() || players.myname()}));
        }
    });

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

    /*$(window).bind("beforeunload", function () {
        if (websocket && websocket.readyState === 1 && poStorage("confirm-exit", "boolean")) {
            return "Are you sure that you want to close the Pokémon Online Webclient?\n\nYou are currently connected to a server.";
        }
    });

    $("#confirmexit-option").change(poStorage("confirm-exit", "boolean"));
    $("#confirmexit-option").change(function () {
        poStorage.set("confirm-exit", $(this).is(":checked"));
    });
    */

    //poStorage.set("chat.timestamps", true);

    if (poStorage("autoload", "boolean")) {
        $("#autoload").attr("checked", true);
        initWebsocket();
    }

    $("#autoload").click(function() {
        if($(this).is(':checked')) {
            poStorage.set("autoload", true);
        } else {
            poStorage.remove("autoload");
        }
    });
});

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
    showHtmlInFrame("#player-dialog .trainer-info", player.info);
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
                + utils.escapeHtml(players.name(opp)) +"</div>"));
        }
    }
    dialog.dialog("option", "title", players.name(id));
    var buttons = [
        {
            text: "Private Message",
            class: "click_button",
            click: function() { pms.pm(id); dialog.dialog("close"); }
        }
    ];
    if (players.isIgnored(id)) {
        buttons.push({
            text: "Unignore",
            class: "click_button",
            click: function() { players.removeIgnore(id); dialog.dialog("close"); }
        });
    } else {
        buttons.push({
            text: "Ignore",
            class: "click_button",
            click: function() { players.addIgnore(id); dialog.dialog("close"); }
        });
    }
    dialog.dialog("option", "buttons", buttons);
    dialog.dialog({ position: { my: "center top", at: "center top+40px", of: window } });
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
    var id;
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
            if (!msg.length) {
                return;
            }
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

        if ( websocket && websocket.readyState == 1 ) {
            websocket.close();
            $("#servers-list tbody").html('');
        }

        var fullIP = $("#relay").val();
        displayMessage("Connecting to " + fullIP);

        relayIP = fullIP;
        relayIP = relayIP.substr(0, relayIP.lastIndexOf(":"));

        poStorage.set("relay", fullIP);

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
        console.log('Websocket error:', exception);
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
    if (websocket) {
        websocket.send("connect|" + $("#advanced-connection").val());
        $(".page").toggle();
    }
}

var serverDescriptions = {};
parseCommand = function(message) {
    var cmd = message.substr(0, message.indexOf("|"));
    var data = message.slice(message.indexOf("|")+1);

    if (cmd == "defaultserver") {
        /* If the server is on the same IP as the relay, we display the server IP but
         send localhost */
        var server = data.replace("localhost", relayIP);

        var qserver = utils.queryField("server");

        if (qserver != "default" && qserver) {
            $("#advanced-connection").val(qserver);
        } else {
            $("#advanced-connection").val(server);
        }

        if (utils.queryField("autoconnect") === "true") {
            connect();
        } else {
            try {
                websocket.send("registry");
            } catch (ex) {} // Ignore InvalidStateErrors when you spam the 'Load' button.
        }
    } else if (cmd == "servers") {
        var servers = JSON.parse(data), html = "";

        for (var i = 0; i < servers.length; i++) {
            var server = servers[i];
            html += "<tr><td class='server-name'>" + server.name + "</td><td>" + server.num + ("max" in server ? " / " + server.max : "") + "</td>"
                + "<td class='server-ip'>"+server.ip+":" + server.port + "</td></tr>";
            serverDescriptions[server.name] = server.description;
        }


        $("#servers-list tbody").prepend(html);
        $("#servers-list").tablesorter({sortList: [[1,1]]});
    } else if (cmd == "connected") {
        displayMessage("Connected to server!");

        var username = $("#username").val();
        if (username && username.length > 0) {
            poStorage.set("username", username);
        } else {
            poStorage.remove("username");
        }

        var data = {version: 1};
        if (utils.queryField("user") || username) {
            data.name = utils.queryField("user") || username;
            data.default = utils.queryField("channel");
            data.autojoin = utils.queryField("autojoin");
            if (data.autojoin) {
                data.autojoin = data.autojoin.split(",");
            }
            websocket.send("login|"+JSON.stringify(data));
        } else {
            vex.dialog.open({
                message: 'Enter your username:',
                input: '<input name="username" type="text" placeholder="Username"/>',
                buttons: [
                    $.extend({}, vex.dialog.buttons.YES, {text: 'Login'}),
                    $.extend({}, vex.dialog.buttons.NO, {text: 'Login as Guest'})
                ],
                callback: function (res) {
                    if (res && res.username) {
                        data.name = res.username;
                    }
                    /* Optional parameters: away, color, ladder */
                    websocket.send("login|"+JSON.stringify(data));
                }
            });
        }
    } else if (cmd == "disconnected") {
        displayMessage("Disconnected from server!");
        announcement.hide("slow");
    } else if (cmd == "msg" || cmd == "error") {
        displayMessage(data);
    } else if (cmd == "chat") {
        var params = JSON.parse(data);
        var msg = params.message;
        var chan = channels.channel(params.channel);

        if ((params.channel == -1 && params.message.charAt(0) != "~") || !chan) {
            displayMessage(msg, params.html, true);
        } else {
            chan.print(msg, params.html);
        }
    } else if (cmd == "challenge") {
        var password = $("#password").val();
        if (password) {
            var hash = MD5(MD5(password)+data);

            poStorage.set("passhash-" + data, hash);
            websocket.send("auth|" + hash);
        } else {
            var passHash = poStorage("passhash-" + data);
            if (passHash) {
                websocket.send("auth|" + passHash);
            } else {
                vex.dialog.open({
                    message: 'Enter your password:',
                    input: '<input name="password" type="password" placeholder="Password" required />',
                    callback: function (res) {
                        if (res && res.password) {
                            // after clicking OK
                            // res.password is the value from the textbox
                            var hash = MD5(MD5(res.password)+data);
                            websocket.send("auth|" + hash);
                        } else {
                            // after clicking Cancel
                            stopWebsocket();
                        }
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

        websocket.send("getrankings|" + params.id);
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
    } else if (cmd === "rankings") {
        var id = data.split("|")[0];
        var rankings = JSON.parse(data.split("|")[1]), tier, rank;
        var html = "";

        for (tier in rankings) {
            rank = rankings[tier];
            if (rank.ranking === -1) {
                html += "<li><strong>Unranked</strong>";
            } else {
                html += "<li><strong>#" + rank.ranking + "/" + rank.total + "</strong> <em>(" + rank.rating + ")</em>";
            }

            html += " - <strong>" + tier + "</strong></li>";
        }

        $("#rankings").html(html);
    }
    else if (cmd == "tiers") {
        var params = JSON.parse(data);
        tiersList = params;
    }
};
