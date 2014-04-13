function showPlayerInfo(id, dialog_, challenge) {
    var dialog = dialog_ || $("#player-dialog");
    var player = webclient.players.player(id);
    var buttons;
    var playerbattles, battle, opp, element, bid;

    dialog.html('<div class="avatar"></div><div class="trainer-info">Loading...</div>');
    if (!challenge) {
        webclient.shownPlayer = id;
    }

    if (player.hasOwnProperty("info")) {
        webclient.updatePlayerInfo(player, dialog);
    } else {
        webclient.dialogs[id] = dialog;
        network.command('player', {id: id});
    }

    function closeOnClick() {
        dialog.dialog('close');
    }

    /* Display the clauses and make the challenge button actually challenge the foe */
    function showChallengeInfo() {
        var $challengeInfo = $("<div class='challenge-info'></div>");
        dialog.append($challengeInfo);

        var clauses = [];
        for (var i in BattleTab.clauses) {
            var name = "clause-" + i;
            clauses.push('<input type="checkbox" name="' + name + '" id="' + name + '"/><label for="' + name + '">' + BattleTab.clauses[i] + "</label>");
        }

        var tiers = [];
        var ratings = webclient.players.player(id).ratings;
        var checked = "checked=true";
        i = 0;
        for (var tier in ratings) {
            var name = "tier-" + i;
            tiers.push('<input type="radio" name="tier" value="' + tier + '" id="' + name + '" ' + checked +'/><label for="' + name + '">' + tier + "</label>");
            i++; checked = "";
        }

        var html = "<table><tr><td>" + $("<form class='tiers'></form>").html(tiers.join("<br/>\n"))[0].outerHTML + "</td>"
            + "<td>" + $("<div class='clauses'></div>").html(clauses.join("<br/>\n"))[0].outerHTML + "</td></tr></table>";
        $challengeInfo.append(html);

        buttons[1].click = function() {
            /* Which tier was selected? */
            for (var i in tiers) {
                if ($challengeInfo.find("#tier-" + i).prop("checked")) {
                    tier = $challengeInfo.find("#tier-" + i).attr("value");
                }
            }
            /* Which clause? */
            var clauses = [];
            for (var i in BattleTab.clauses) {
                if ($challengeInfo.find("#clause-" + i).prop("checked")) {
                    clauses.push(1);
                } else {
                    clauses.push(0);
                }
            }
            network.send("challengeplayer", {"id": id, "team": 0, "clauses": clauses, "tier": tier });
            dialog.dialog("close");
        };
        dialog.dialog("option", "buttons", buttons)
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
                closeOnClick();
            }
        },
        {
            text: "Challenge",
            'class': "click_button",
            click: function() {
                showChallengeInfo();
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
                closeOnClick();
            }
        };
    }

    if (challenge) {
        showChallengeInfo();
        //Check the clauses
        for (var i in challenge.clauses) {
            dialog.find("#clause-" + i).prop("checked", challenge.clauses[i]);
        }
        //Check the tier
        /* Which tier was selected? */
        dialog.find("input[value='" + challenge.opptier+"']").prop("checked", true);

        buttons[1] = {
            text: "Accept",
            'class': "click_button",
            click: function() {
                /* Accept the challenge */
                closeOnClick();
            }
        }
    }

    dialog
        .dialog("option", "title", webclient.players.name(id))
        .dialog("option", "buttons", buttons)
        .dialog({ position: { my: "center top", at: "center top+40px", of: window } })
        .dialog("open");

    return dialog;
}

function showChallenge(params) {
    var dialog = $("<div class='player-dialog' title='User Menu'></div>");
    dialog.dialog({
        autoOpen: false,
        modal: false,
        resizeable: false
    });
    dialog.on("dialogclose", function(){dialog.remove()});

    dialog = showPlayerInfo(params.id, dialog, params);
    dialog.dialog("option", "title", "You were challenged by " + webclient.players.name(params.id));
}