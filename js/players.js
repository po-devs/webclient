function Players () {
    this.players = {};
    this.names = {};
}

Players.prototype.addPlayer = function (players) {
    for (var id in players) {
        var player = players[id];
        var name = player.name.toLowerCase();

        player.id = +(id);

        if (!(id in this.players)) {
            this.players[id] = player;
        } else {
            delete this.names[this.players[id].name.toLowerCase()]; // Delete old names.

            /* Update only the new params */
            for (var x in player) {
                this.players[id][x] = player[x];
            }
        }

        this.names[name] = this.players[id];
    }
};

Players.prototype.removePlayer = function (id) {
    var player = this.players[id];

    if (!player) {
        return;
    }

    delete this.names[player.name.toLowerCase()];
    delete this.players[id];
};

Players.prototype.player = function (pid) {
    if (pid in this.players) {
        return this.players[pid];
    } else if ((pid + "").toLowerCase() in this.names) {
        return this.names[(pid + "").toLowerCase()];
    }

    return null;
};

Players.prototype.id = function (name) {
    var player = this.names[name.toLowerCase()];

    return (name.toLowerCase() in this.names) ? this.names[name.toLowerCase()].id : -1;
};

Players.prototype.testPlayerOnline = function(player) {
    for (var i in channels.channels) {
        if (player in channels.channel(i).players) {
            return;
        }
    }

    removePlayer(player);
}

Players.prototype.color = function (id) {
    var player = this.player(id);

    if (!player) {
        return "#000000";
    }

    var color = player.color;
    /* Players with the color black are screwed */
    if (!color) {
        var namecolorlist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];
        return namecolorlist[id % namecolorlist.length];
    }
    return color;
};
