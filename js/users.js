function Users () {
    this.users = {};
    this.names = {};
}

Users.prototype.addUser = function (info) {
    var userInfo = Object.keys(info)[0]; // hack
    var id = +(userInfo);
    var player = info[userInfo];
    var name = player.name.toLowerCase();

    player.id = id;

    this.users[id] = player;
    this.names[name] = player;
};

Users.prototype.user = function (uid) {
    if (uid in this.users) {
        return this.users[uid];
    } else if ((uid + "").toLowerCase() in this.names) {
        return this.names[(uid + "").toLowerCase()];
    }

    return null;
};

Users.prototype.id = function (name) {
    var user = this.user(name);

    return user === null ? -1 : user.id;
};

Users.prototype.color = function (id) {
    var user = this.user(id);

    if (!user) {
        return "#000000";
    }

    var color = user.color;
    if (color == '#000000') {
        var namecolorlist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];
        return namecolorlist[id % namecolorlist.length];
    }
    return color;
};