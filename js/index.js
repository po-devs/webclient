$(function() {
    var mode = 'content',
        $teambuilder = $("#teambuilder"),
        $user_params = $("#user_params"),
        $content = $("#content"),
        $middle_block = $(".middle_block"),
        $teampreview = $(".team_preview"),
        previewsInit = false;

    function animframe(fn) {
        return requestAnimationFrame(fn) || setTimeout(fn, 1000 / 60);
    }

    $("#tab-titles").on('click', 'li i', function () {
        var dparent, href;

        if ($("#tab-titles li").length > 1) {
            dparent = $(this).parent().parent();
            href = dparent.attr("href");
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
        // Remove from all team previews
        $teampreview.removeClass('current_team');
        // Add to the current one
        $(this).addClass('current_team');
    }).dblclick(function () {
        toggleContent('teambuilder');
        webclient.teambuilder.loadTeamFrom($(this));
    });

    // Type should be one of: content, user_params, teambuilder
    function toggleContent(type, checks) {
        // From user_params
        if (mode === 'user_params') {
            webclient.sendProfile();
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

    $("#trainer_username, #create_team, #po_title").click(function () {
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
    $("#user_params").load("user_params.html", function () {
        webclient.initUserParams();
    });
    $teambuilder.load("teambuilder.html");
});

$(function() {
    var $advancedConnection = $("#advanced-connection"),
        $serverDescription = $("#server-description"),
        $username = $("#username"),
        $trainerUsername = $("#trainer_username"),
        $channeltabs = $("#channel-tabs");

    var storedRelayIp = poStorage("relay");
    $("#relay").keydown(utils.onEnterPressed(webclient.connectToRelay))
        .val(storedRelayIp || "server.pokemon-online.eu:10508");

    var username = poStorage("player.name");
    if (username) {
        $username.val(username);
        $trainerUsername.val(username);
    }

    $("#servers-list tbody").on('click', 'tr', function() {
        var $this = $(this);

        $advancedConnection.val($this.find('.server-ip').text());
        webclient.sandboxHtml($serverDescription, webclient.registry.descriptions[$this.find('.server-name').text()]);
    }).on('dblclick', 'tr', webclient.connectToServer);

    $("#advanced-connection, #username, #password").keydown(utils.onEnterPressed(webclient.connectToServer));

    $channeltabs.tabs()
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

    $channeltabs.on('tabsselect', function (event, ui) {
        var hrefid = $(ui.tab).attr("href");

        /* Changes the current object in memory */
        webclient.channel = objFromId(hrefid);

        /* Update player list when switching channels */
        webclient.ui.playerList.setPlayers(webclient.channel.playerIds());
    }).on('tabsshow', function (event, ui) {
        var hrefid = $(ui.tab).attr("href");

        /* Resizes chat area in funciton of the height of the channel tab */
        /* Scrolls down the chat of the current tab */
        var chattextarea = $(hrefid + " .chatTextArea");
        chattextarea.animate({scrollTop: chattextarea.height()}, "fast");

        /* The tab is selected now, so any unseen activity is removed */
        $(ui.tab).removeClass("tab-active tab-flashing");
    }).on('tabscreate', function(event, ui) {
        var hrefid = $(ui.tab).attr("href");
        webclient.channel = objFromId(hrefid);
    });

    webclient.players = new webclient.classes.PlayerHolder();
    webclient.pms = new webclient.classes.PMHolder();
    webclient.channels = new webclient.classes.ChannelHolder();
    battles = new Battles();

    webclient.ui.playerList = new webclient.classes.PlayerList();
    webclient.ui.channellist = new webclient.classes.ChannelList();

    webclient.players.on("login", function (id, info) {
        webclient.ownId = id;

        $trainerUsername.text(webclient.ownName()).trigger('received');
    }).on("playeradd", function (player, id, name) {
        if (webclient.currentChannel() !== -1 && webclient.channel.hasPlayer(id)) {
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
    }).on("testplayers", function (players) {
        var id;

        for (id in players) {
            webclient.players.testPlayerOnline(id);
        }
    });

    $("#join-channel").autocomplete({
        source: function (request, response) {
            var channelNames = webclient.channels.channelsByName(),
                value, len, i;

            var req = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "gi"),
                possibleChannels = [];

            for (i = 0, len = channelNames.length; i < len; i += 1) {
                if (possibleChannels.length >= 30) {
                    break;
                }

                /* Limits result to 30 channels. In the future should not limit but instead css the
                 autocomplete so that a long results list would be scrollable */
                value = channelNames[i];
                if (req.test(value)) {
                    possibleChannels.push(value);
                }
            }

            possibleChannels.sort();
            response(possibleChannels);
        },
        /* Makes you join the channel as soon as element is selected */
        select: function(event, ui) {
            webclient.joinChannel(ui.item.value);
            return false;
        }
    });

    poStorage.init('exitwarning', true);
    poStorage.init('chat.timestamps', true);

    var $autoload = $("#autoload");

    if (poStorage("autoload", "boolean")) {
        $autoload.prop("checked", true);
        webclient.connectToRelay();
    }

    $autoload.click(function() {
        if ($autoload.is(':checked')) {
            poStorage.set("autoload", true);
        } else {
            poStorage.remove("autoload");
        }
    });

    $(window).on('beforeunload', function () {
        if (webclient.connectedToServer && poStorage("exitwarning", "boolean")) {
            return "You are currently connected to a server.";
        }
    });

    $('#search_filter').filterFor('#player-list', {
        caseSensitive: false
    }).keyup(function () { /* The players list also needs to know the filter, when it adds new elements whether to show them or not */
        webclient.ui.playerList.filter = $(this).val().toLowerCase();
    });

    $("#connect-button").click(webclient.connectToServer);
    $("#load-button").click(webclient.connectToRelay);
    $(".find-battle").click(webclient.findBattle);

    // Make register button disabled
    $("#register").attr("disabled", true);

    /* Player that is shown in the trainer window */
    $("#player-dialog").dialog({
        autoOpen: false,
        modal: true,
        resizeable: false,
        close: function() {
            webclient.shownPlayer = -1;
        }
    });

    $("#channel-list").on("click", "li", function(event) {
        var id = event.currentTarget.id.split("-")[2];
        webclient.joinChannel(webclient.channels.name(id));
    });
    $("#player-list").on("click", "li", function(event) {
        var id = event.currentTarget.id.split("-")[1],
            dialog = $("#player-dialog"),
            player = webclient.players.id(id),
            buttons,
            playerbattles, battle, opp, element, bid;

        dialog.html('<div class="avatar"></div><div class="trainer-info">Loading...</div>');
        webclient.shownPlayer = id;

        if (player.hasOwnProperty("info")) {
            webclient.updatePlayerInfo(player);
        } else {
            network.command('player', {id: id});
        }

        function closeOnClick() {
            dialog.dialog('close');
        }

        /* Show the list of battles in the player info */
        if (battles.isBattling(id)) {
            playerbattles = battles.battlesByPlayer[id];

            for (bid in playerbattles) {
                battle = playerbattles[bid];
                opp = (battle.ids[0] == id ? battle.ids[1] : battle.ids[0]);
                element = $(
                    "<div class='player-info-battle'><a href='po:watch/" + bid + "' class='watch-battle-link'>Watch</a> battle against " + utils.escapeHtml(webclient.players.name(opp)) + "</div>"
                );

                element.find(".watch-battle-link").click(closeOnClick);
                dialog.append(element);
            }
        }

        buttons = [
            {
                text: "Private Message",
                'class': "click_button",
                click: function() {
                    webclient.pms.pm(id).activateTab();
                    dialog.dialog("close");
                }
            },
            {
                text: "Challenge",
                'class': "click_button",
                click: function() {
                    /* Send challenge cup challenge, to a random tier of the opponent */
                    for (var tier in webclient.players.player(id).ratings) {
                        break;
                    }
                    network.send("challengeplayer", {"id": id, "team": 0, "clauses": [0,0,0,0,1],
                        "tier": tier
                    });
                    dialog.dialog("close");
                }
            }
        ];

        /* Send Private message on a PM is redundant, instead offer the possibility
           to ignore/unignore the person
         */
        if (webclient.channel.shortHand == "pm") {
            buttons[0] = {
                text: webclient.players.isIgnored(id) ? "Unignore" : "Ignore",
                'class': "click_button",
                click: function() {
                    webclient.players.toggleIgnore(id);
                    dialog.dialog("close");
                }
            };
        }

        dialog
            .dialog("option", "title", webclient.players.name(id))
            .dialog("option", "buttons", buttons)
            .dialog({ position: { my: "center top", at: "center top+40px", of: window } })
            .dialog("open");
    });
});

webclient.print = function (message, html, raw) {
    var chans = webclient.channels.channels,
        id;

    for (id in chans) {
        chans[id].print(message, html, raw);
    }
};

webclient.printRaw = function (message, html) {
    var asHtml = html == null ? false : html;
    webclient.print(message, html, true);
};

webclient.printHtml = function (message) {
    webclient.print(message, true, false);
};

webclient.findBattle = function () {
    network.command('findbattle', {sameTier: true, range: 300});
};

webclient.updatePlayerInfo = function (player) {
    var $dialog = $("#player-dialog");

    $dialog.find(".avatar").html('<img src="' + pokeinfo.trainerSprite(player.avatar || 1) + '">');
    webclient.sandboxHtml($dialog.find(".trainer-info"), player.info);
};

webclient.connectToServer = function () {
    if (network.isOpen()) {
        network.command('connect', {ip: webclient.serverIp()});
        $(".page").toggle();
    }
};

webclient.serverIp = function() {
    return $("#advanced-connection").val();
};

webclient.switchToTab = function(hrefid) {
    webclient.channel = objFromId(hrefid);
    $('#channel-tabs').tabs("select", hrefid);
};

webclient.sendMessage = function (message, id) {
    if (!network.isOpen()) {
        webclient.printRaw("ERROR: Connect to the relay station before sending a message.");
        return;
    }

    if (/^send-channel-/.test(id)) {
        webclient.channels.channel(+id.replace('send-channel-', '')).sendMessage(message);
    } else if (/^send-pm-/.test(id)) {
        webclient.pms.pm(+id.replace('send-pm-', '')).sendMessage(message);
    } else if(/^send-battle-/.test(id)) {
        battles.battles[(+id.replace('send-battle-', ''))].sendMessage(message);
    }
};

webclient.joinChannel = function (chan) {
    var $inputChannel = $("#join-channel"),
        channel = chan || $inputChannel.val();

    $inputChannel.val("");
    network.command('joinchannel', {channel: channel});
};

webclient.connectToRelay = function () {
    if (network.isOpen()) {
        network.close();
        $("#servers-list tbody").html('');
    }

    var fullIP = $("#relay").val();

    console.log("Connecting to relay @ " + fullIP);
    poStorage.set("relay", fullIP);

    network.open(
        fullIP,
        // open
        function () {
            console.log("Connected to relay.");
        },
        // error
        function (e) {
            console.log("Network error:", e.data);
        },
        // close
        function () {
            console.log("Disconnected from relay.");
        }
    );
};
