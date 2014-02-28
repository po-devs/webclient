(function () {
    /* The list of players */
    function PlayerList() {
        this.ids = [];
        this.filter = '';

        this.element = $("#player-list");
        this.count = $("#players_count");
    }

    var playerlist = PlayerList.prototype;

    playerlist.setPlayers = function (playerIds) {
        var html = "",
            len, i;

        /* Could be optimized, but later */
        playerIds.sort(function(a, b) {
            return webclient.players.name(a).toLowerCase().localeCompare(webclient.players.name(b).toLowerCase());
        });

        for (i = 0, len = playerIds.length; i < len; i += 1) {
            html += this.createPlayerItem(playerIds[i]);
        }

        this.element.html(html);
        this.ids = playerIds;
        this.updatePlayerCount();
    };

    playerlist.updatePlayerCount = function () {
        var idl = this.ids.length;
        this.count.text(idl + (idl !== 1 ? " Users" : " User"));
    };

    playerlist.createPlayerItem = function (id) {
        var name = webclient.players.name(id),
            ret;

        /* If there's a filter and it's no match, hide the player name */
        if (this.filter && name.toLowerCase().indexOf(this.filter) === -1) {
            return "";
        }

        ret = "<li class='player-list-item player-auth-" + webclient.players.auth(id);

        if (battles.isBattling(id)) {
            ret += ' player-battling';
        }

        ret += "' id='player-"+id+"'>" + utils.escapeHtml(name) + "</li>";
        return ret;
    };

    playerlist.addPlayer = function (id) {
        var name = webclient.players.name(id),
            lname = name.toLowerCase();

        /* Find the place where to put the name - dichotomy */
        var pos = this.ids.dichotomy(function (id) {
            return lname.localeCompare(webclient.players.name(id).toLowerCase());
        });

        /* Add the graphical element */
        var item = this.createPlayerItem(id);
        if (pos === this.ids.length) {
            this.element.append(item);
        } else {
            /* Inserts the item before the player at pos */
            $(".player-list-item#player-" + this.ids[pos]).before(item);
        }

        this.ids.splice(pos, 0, id);
        this.updatePlayerCount();
    };

    playerlist.removePlayer = function (id) {
        var pos = this.ids.indexOf(id);
        if (pos !== -1) {
            this.ids.splice(pos, 1);
        }

        /* Remove the graphical element */
        $(".player-list-item#player-" + id).remove();
        this.updatePlayerCount();
    };

    playerlist.updatePlayer = function (id) {
        if (this.ids.indexOf(id) !== -1) {
            this.removePlayer(id);
            this.addPlayer(id);
        }
    };

    webclient.classes.PlayerList = PlayerList;
}());
