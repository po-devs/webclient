$(function() {
    var mode = 'content',
        $teambuilder = $("#teambuilder"),
        $user_params = $("#user_params"),
        $content = $("#content"),
        $middle_block = $(".middle_block"),
        $teampreview = $(".team_preview"),
        previewsInit = false;

    $("#tab-titles").on('click', 'li i', function() {
        if ($("#tab-titles li").length > 1) {
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
            webclient.teambuilder.loadTeamPreviews();
        }
    });

    $teampreview.click(function () {
        var $this = $(this);
        $teampreview.removeClass('current_team');
        $this.addClass('current_team');
    }).dblclick(function () {
        toggleContent('teambuilder');
        webclient.teambuilder.loadTeamFrom($(this));
    });

    var animframe = function (fn) {
        return requestAnimationFrame(fn) || setTimeout(fn, 1000 / 60);
    };

    // Type should be one of: content, user_params, teambuilder
    function toggleContent(type, checks) {
        // From user_params
        if (mode === 'user_params' && checks !== false) {
            $("#user_params_submit").trigger('click', [true]);
        }

        // From user_params/teambuilder, to content
        if (mode === 'user_params' || mode === 'teambuilder' || type === 'content') {
            $content.show();
            type = 'content';
        } else if (type === 'user_params') { // To user_params
            $user_params.show();
        } else if (mode === 'content' || type === 'teambuilder') { // From content, to teambuilder
            NProgress.start();
            webclient.teambuilder.init();
            animframe(function () {
                $teambuilder.show();
                NProgress.done();
            });
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
    $("#user_params").load("user_params.html");
    $teambuilder.load("teambuilder.html");
});

$(function() {
    var storedRelayIp = poStorage("relay");
    $("#relay").keydown(function (e) {
        if (e.which === 13) { // Enter
            initWebsocket();
        }
    }).val(storedRelayIp || "server.pokemon-online.eu:10508");

    var username = poStorage("player.name");
    if (username) {
        $("#username").val(username);
    }

    $("#servers-list tbody").on('click', 'tr', function() {
        var $this = $(this);
        $("#advanced-connection").val($this.find('.server-ip').text());
        showHtmlInFrame("#server-description", webclient.registry.descriptions[$this.find('.server-name').text()]);
    }).on('dblclick', 'tr', function () {
        connect();
    });

    $("#advanced-connection, #username, #password").on("keydown", function (e) {
        if (e.which === 13) { // Enter
            connect();
        }
    });

    var $channeltabs = $("#channel-tabs");
    $('#channel-tabs').tabs()
        .find(".ui-tabs-nav")
        .sortable({
            axis: "x",
            stop: function() {
                $channeltabs.tabs("refresh");
            }
        }); // Makes the channel tabs sortable.

    /* Gets the current object owning a tab from the hrefid of the tab */
    objFromId = function(hrefid) {
        var id = hrefid.substr(hrefid.lastIndexOf("-") + 1),
            ret;

        if (/^#channel-/.test(hrefid)) {
            ret = webclient.channels.hasChannel(id) ? webclient.channels.channel(id) : undefined;
        } else if (/^#pm-/.test(hrefid)) {
            ret = webclient.pms.pm(id);
        } else if (/^#battle-/.test(hrefid)) {
            ret = battles.battle(id);
        }
        return ret;
    };

    switchToTab = function(hrefid) {
        webclient.channel = objFromId(hrefid);
        $('#channel-tabs').tabs("select", hrefid);
    };

    $("#channel-tabs").on('tabsselect', function(event, ui) {
        var hrefid = $(ui.tab).attr("href");

        /* Changes the current object in memory */
        webclient.channel = objFromId(hrefid);

        /* Update player list when switching channels */
        webclient.ui.playerList.setPlayers(webclient.channel.playerIds());
    }).bind('tabsshow', function(event, ui) {
        var hrefid = $(ui.tab).attr("href");

        /* Resizes chat area in funciton of the height of the channel tab */
        /* Scrolls down the chat of the current tab */
        var chattextarea = $(hrefid + " .chatTextArea");
        chattextarea.animate({scrollTop: chattextarea.height()}, "fast");

        /* The tab is selected now, so any unseen activity is removed */
        $(ui.tab).removeClass("tab-active tab-flashing");
    }).bind('tabscreate', function(event, ui) {
        var hrefid = $(ui.tab).attr("href");
        webclient.channel = objFromId(hrefid);
    });

    $("#colorDialog").dialog({
        autoOpen: false,
        beforeClose: function(event) {
            network.command('teamchange', {
                color: colorPickerColor,
                name: $("#trainer-name").val() || webclient.ownName()
            });
        }
    });

    $(document).on("click", "a", function (event) {
        var href = this.href;

        if (/^po:/.test(href)) {
            event.preventDefault();

            var params = [href.slice(3, href.indexOf("/")), decodeURIComponent(href.slice(href.indexOf("/")+1))];

            // Add other commands here..
            var pid = webclient.players.id(params[1]);
            if (pid === -1)
                pid = parseInt(params[1]);
            if (params[0] === "join") {
                joinChannel(params[1]);
            } else if (params[0] == "pm") { // Create pm window
                if (!isNaN(pid)) {
                    webclient.pms.pm(pid).activateTab();
                }
            } else if (params[0] == "ignore") {
                // Ignore the user
                if (!isNaN(pid)) {
                    if (webclient.players.isIgnored(pid)) {
                        webclient.players.addIgnore(pid);
                    } else {
                        webclient.players.removeIgnore(pid);
                    }
                }
            } else if (params[0] == "watch") {
                network.command('watch', {battle: params[1]});
            }
            // TODO: watchbattle(id/name), reconnect(void)
        } else {
            /* Make sure link opens in a new window */
            this.target = "_blank";
        }
    });

    var $trainerUsername = $("#trainer_username");

    webclient.players = new webclient.classes.PlayerHolder();
    webclient.pms = new webclient.classes.PMHolder();
    webclient.channels = new webclient.classes.ChannelHolder();
    battles = new Battles();

    webclient.ui.playerList = new webclient.classes.PlayerList();

    webclient.players.on("login", function (id, info) {
        webclient.ownId = id;

        $trainerUsername.text(webclient.ownName()).trigger('received');
    }).on("playeradd", function (player, id, name) {
        if (webclient.currentChannel() !== -1 && webclient.channels.current().hasPlayer(id)) {
            webclient.ui.playerList.updatePlayer(id);
        }

        webclient.pms.trigger("playerlogin", id);
        if (webclient.ownId === id) {
            $trainerUsername.text(webclient.ownName()).trigger('received');
        }
    }).on("playerremove", function (id, friend) {
        if (friend) {
            webclient.pms.trigger("playerlogout", id);
        }

        battles.removePlayer(id);
    });

    webclient.channels.on("playerlistadd", function (id) {
        webclient.ui.playerList.addPlayer(id);
    }).on("playerlistremove", function (id) {
        webclient.ui.playerList.removePlayer(id);
    }).on("generateplayerlist", function (ids) {
        webclient.ui.playerList.setPlayers(ids);
    });

    $("#join-channel").autocomplete({
        source: function (request, response) {
            var channelNames = (Object.keys(webclient.channels.names).map(function (value, index, array) {
                return webclient.channels.names[value];
            }));

            var req = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "gi");
            var possibleChannels = [];

            channelNames.forEach(function (value, index, array) {
                /* Limits result to 30 channels. In the future should not limit but instead css the
                 autocomplete so that a long results list would be scrollable */
                if (possibleChannels.length <= 29 && req.test(value)) {
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

    var $autoload = $("#autoload");

    if (poStorage("autoload", "boolean")) {
        $autoload.attr("checked", true);
        initWebsocket();
    }

    $autoload.click(function() {
        if ($autoload.is(':checked')) {
            poStorage.set("autoload", true);
        } else {
            poStorage.remove("autoload");
        }
    });

    $('#search_filter').filterFor('#player-list', {
        caseSensitive: false
    }).keyup(function () { /* The players list also needs to know the filter, when it adds new elements whether to show them or not */
        webclient.ui.playerList.filter = $(this).val().toLowerCase();
    });

    $("#connect-button").click(connect);
    $(".find-battle").click(findBattle);

    // Make register button disabled
    $("#register").attr("disabled", true);
});

/* Player that is shown in the trainer window */
$("#player-dialog").dialog({
    autoOpen: false,
    modal: true,
    resizeable: false,
    close: function() {
        webclient.shownPlayer = -1;
    }
});

var updatePlayerInfo = function(player) {
    $("#player-dialog .avatar").html("<img src='http://pokemon-online.eu/images/trainers/" + (player.avatar||1) + ".png' />");
    showHtmlInFrame("#player-dialog .trainer-info", player.info);
};

$("#player-list").on("click", "li", function(event) {
    var id = event.currentTarget.id.split("-")[1];
    webclient.shownPlayer = id;

    var dialog = $("#player-dialog");
    dialog.html('<div class="avatar"></div><div class="trainer-info">loading...</div>');
    var player = webclient.players.id(id);

    if (player.hasOwnProperty("info")) {
        updatePlayerInfo(player);
    } else {
        network.command('player', {id: id});
    }

    /* Show the list of battles in the player info */
    if (battles.isBattling(id)) {
        for (var bid in battles.battlesByPlayer[id]) {
            var battle = battles.battlesByPlayer[id][bid];
            var opp = (battle.ids[0] == id ? battle.ids[1] : battle.ids[0]);
            var element = $(
                "<div class='player-info-battle'><a href='po:watch/"+ bid +"' class='watch-battle-link'>Watch</a> battle against " + utils.escapeHtml(webclient.players.name(opp)) + "</div>"
            );

            element.find(".watch-battle-link").click(function () {
                dialog.dialog('close');
            });

            dialog.append(element);
        }
    }
    var buttons = [
        {
            text: "Private Message",
            'class': "click_button",
            click: function() {
                webclient.pms.pm(id).activateTab();
                dialog.dialog("close");
            }
        }
    ];

    if (webclient.players.isIgnored(id)) {
        buttons.push({
            text: "Unignore",
            'class': "click_button",
            click: function() {
                webclient.players.removeIgnore(id);
                dialog.dialog("close");
            }
        });
    } else {
        buttons.push({
            text: "Ignore",
            'class': "click_button",
            click: function() {
                webclient.players.addIgnore(id);
                dialog.dialog("close");
            }
        });
    }

    dialog
        .dialog("option", "title", webclient.players.name(id))
        .dialog("option", "buttons", buttons)
        .dialog({ position: { my: "center top", at: "center top+40px", of: window } })
        .dialog("open");
});

function wannaRegister() {
    network.command('register');
}

colorPickerTriggered = false;
var colorPickerColor;
function openColorPicker() {
    $("#colorDialog").dialog("open");
    var colorPicker = $("#colorPicker");
    colorPicker.farbtastic(function(color) {
        colorPickerColor = color;
    });

    $("#trainer-name").val(webclient.players.name(webclient.ownId));
}

var announcement = $("#announcement");
function displayMessage(message, html, parseExtras) {
    var id;
    html = !!html;

    for (id in webclient.channels.channels) {
        webclient.channels.channel(id).print(message, html, !parseExtras);
    }
}

function findBattle() {
    network.command('findbattle', {sameTier: true, range: 300});
}

function sendMessage(sender) {
    if (!network.isOpen()) {
        displayMessage("ERROR: Connect to the relay station before sending a message.");
        return;
    }

    var $inputText = $(sender),
        message = $inputText.val().trim().split("\n"),
        idsender = $inputText[0].id,
        targetid = idsender.substr(idsender.lastIndexOf("-") + 1);

    message.forEach(function(msg) {
        if (!msg.length) {
            return;
        }

        if (/^send-channel-/.test(idsender)) {
            /* Temporary until interface is improved */
            if (/^\/pm/i.test(msg)) {
                var pid = webclient.players.id(msg.slice(4));
                if (pid !== -1) {
                    webclient.pms.pm(pid).activateTab();
                    return;
                }
            }
            network.command('chat', {channel: targetid, message: msg});
        } else if (/^send-pm-/.test(idsender)) {
            webclient.pms.pm(targetid).print(webclient.ownId, msg);
            network.command('pm', {to: targetid, message: msg});
        } else if (/^send-battle-/.test(idsender)) {
            var battle = battles.battles[targetid];
            network.command((battle.isBattle() ? "battlechat": "spectatingchat"), {battle: targetid, message: msg});
        }
    });
}

function joinChannel(chan) {
    var $inputChannel = $("#join-channel"),
        channel = chan || $inputChannel.val();

    $inputChannel.val("");
    network.command('joinchannel', {channel: channel});
}

function initWebsocket() {
    try {
        if (network.isOpen()) {
            network.close();
            $("#servers-list tbody").html('');
        }

        var fullIP = $("#relay").val();

        displayMessage("Connecting to " + fullIP);
        poStorage.set("relay", fullIP);

        network.open(
            fullIP,
            // open
            function () {
                displayMessage("Connected to relay.");
            },
            // error
            function (e) {
                displayMessage("Error: " + e.data);
            },
            // close
            function () {
                displayMessage("Disconnected from relay.");
            }
        );
    } catch(exception) {
        console.log('Websocket error:', exception);
        displayMessage( 'ERROR: ' + exception );
    }
}

function connect() {
    if (network.isOpen()) {
        network.command('connect', {ip: $("#advanced-connection").val()});
        $(".page").toggle();
    }
}
