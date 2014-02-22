(function () {
    var namecolorlist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];

    function PlayerHolder() {
        this.players = {};
        this.names = {};

        this.friends = [];
    }

    PlayerHolder.prototype.login = function(id, info) {
        this.myid = id;

        var obj = {};
        obj[id] = info;
        this.addPlayer(obj);

        $.c("#trainer_username").text(this.myname()).trigger('received');
    };

    PlayerHolder.prototype.hasPlayer = function(pid) {
        return pid in this.players;
    };

    PlayerHolder.prototype.addPlayer = function (players) {
        var activeChannel = webclient.channelId(),
            playerObj,
            player, name,
            id, x;

        for (id in players) {
            player = players[id];
            name = player.name.toLowerCase();

            player.id = +id;

            playerObj = this.players[id];
            if (!playerObj) {
                this.players[id] = player;
            } else {
                delete this.names[playerObj.name.toLowerCase()]; // Delete old names.

                /* Update only the new params */
                for (x in player) {
                    playerObj[x] = player[x];
                }
            }

            this.names[name] = playerObj;

            if (activeChannel !== -1 && channels.current().hasPlayer(id)) {
                webclient.ui.playerList.updatePlayer(id);
            }

            pms.playerLogin(id);

            if (this.myid === id) {
                $.c("#trainer_username").text(this.myname()).trigger('received');
            }
        }
    };

    PlayerHolder.prototype.addFriend = function(id) {
        if (this.friends.indexOf(id) === -1) {
            this.friends.push(id);
        }

        if (id in this.players) {
            this.players[id].friend = true;
        }
    };

    PlayerHolder.prototype.addIgnore = function(id) {
        this.ignores[id] = true;
        if (id in this.players) {
            this.players[id].ignored = true;
        }
    };

    PlayerHolder.prototype.removeIgnore = function(id) {
        delete this.ignores[id];
        if (id in this.players) {
            this.players[id].ignored = false;
        }
    };

    PlayerHolder.prototype.isIgnored = function(id) {
        return id in this.players && this.players[id].ignored;
    };

    PlayerHolder.prototype.removePlayer = function (id) {
        var player = this.players[id];

        if (!player) {
            return;
        }

        if (this.friends.indexOf(id) !== -1) {
            this.friends.splice(this.friends.indexOf(id), 1);
            pms.playerLogout(id);
        }

        delete this.names[player.name.toLowerCase()];
        delete this.players[id];

        battles.removePlayer(id);
    };

    PlayerHolder.prototype.player = function (pid) {
        var pidlc;

        if (pid in this.players) {
            return this.players[pid];
        } else if ((pidlc = (pid + "").toLowerCase()) in this.names) {
            return this.names[pidlc];
        }

        return null;
    };

    PlayerHolder.prototype.name = function(pid) {
        return ((pid in this.players) ? this.players[pid].name : "???");
    };

    PlayerHolder.prototype.auth = function(pid) {
        return ((pid in this.players) ? this.players[pid].auth : 0);
    };

    PlayerHolder.prototype.myname = function() {
        return this.name(this.myid);
    };

    PlayerHolder.prototype.id = function (name) {
        var player = this.names[name.toLowerCase()],
            lname = name.toLowerCase();

        return (lname in this.names) ? this.names[lname].id : -1;
    };

    PlayerHolder.prototype.testPlayerOnline = function(player) {
        var i;

        if (this.friends.indexOf(player) !== -1) {
            return;
        }

        for (i in channels.channels) {
            if (player in channels.channel(i).players) {
                return;
            }
        }

        this.removePlayer(player);
    };

    PlayerHolder.prototype.color = function (id) {
        var player = this.player(id),
            color;

        if (!player) {
            return "#000000";
        }

        color = player.color;

        return color ? color : namecolorlist[id % namecolorlist.length];
    };

    /* The list of players */
    function PlayerList() {
        this.ids = [];
        this.filter = '';
    }

    PlayerList.prototype.setPlayers = function(playerIds) {
        var list = $.c("#player-list").html("");

        /* Could be optimized, but later */
        playerIds.sort(function(a, b) {
            return webclient.players.name(a).toLowerCase().localeCompare(webclient.players.name(b).toLowerCase());
        });

        playerIds.forEach(function(id) {
            list.append(this.createPlayerItem(id));
        }, this);

        this.ids = playerIds;
        this.updatePlayerCount();
    };

    PlayerList.prototype.updatePlayerCount = function () {
        var idl = this.ids.length;

        $.c("#players_count").text(idl + (idl !== 1 ? " Users" : " User"));
    };

    PlayerList.prototype.createPlayerItem = function(id) {
        var name = webclient.players.name(id),
            ret = $("<li class='player-list-item player-auth-" + webclient.players.auth(id) + "' id='player-"+id+"'>").html(name);

        if (battles.isBattling(id)) {
            ret.addClass('player-battling');
        }
        /* If there's a filter and it's no match, hide the player name */
        if (this.filter && name.toLowerCase().indexOf(this.filter) === -1) {
            ret.hide();
        }

        return ret;
    };

    PlayerList.prototype.addPlayer = function(id) {
        var name = webclient.players.name(id);
        var lname = name.toLowerCase();

        /* Find the place where to put the name - dichotomy */
        var pos = this.ids.dichotomy(function(id) {
            return lname.localeCompare(webclient.players.name(id).toLowerCase());
        });

        /* Add the graphical element */
        var item = this.createPlayerItem(id);
        if (pos === this.ids.length) {
            $("#player-list").append(item);
        } else {
            /* Inserts the item before the player at pos */
            $(".player-list-item#player-"+this.ids[pos]).before(item);
        }

        this.ids.splice(pos, 0, id);
        this.updatePlayerCount();
    };

    PlayerList.prototype.removePlayer = function(id) {
        var pos = this.ids.indexOf(id);
        if (pos !== -1) {
            this.ids.splice(pos, 1);
        }
        /* Remove the graphical element */
        $(".player-list-item#player-"+id).remove();
        this.updatePlayerCount();
    };

    PlayerList.prototype.updatePlayer = function(id) {
        if (this.ids.indexOf(id) !== -1) {
            this.removePlayer(id);
            this.addPlayer(id);
        }
    };

    webclient.classes.PlayerHolder = PlayerHolder;
    webclient.classes.PlayerList = PlayerList;
}());
