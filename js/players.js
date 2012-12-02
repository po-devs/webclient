function Players () {
    this.players = {};
    this.names = {};
}

Players.prototype.addPlayer = function (info) {
    var player, name, x;

    for (x in info) {
        player = info[x];
        name = player.name.toLowerCase();

        player.id = x;

        if (!(x in players)) {
            this.players[x] = player;
        } else {
            delete this.names[this.players[x].name.toLowerCase()]; // Delete old names.
            this.players[x] = player;
        }

        this.names[name] = player;
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
    var player = this.player(name);

    return player === null ? -1 : player.id;
};

Players.prototype.color = function (id) {
    var player = this.player(id);

    if (!player) {
        return "#000000";
    }

    var color = player.color;
    if (color == '#000000') {
        var namecolorlist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];
        return namecolorlist[id % namecolorlist.length];
    }
    return color;
};