(function () {
    function ChannelHolder() {
        $.observable(this);

        this.channels = {"0": new webclient.classes.ChannelTab(0, "Console")};
        this.channelCount = 1;
        this.names = {'0': 'Console'}; // id -> name
        this.byName = {'Console': '0'}; // name -> id

        this.observe(this.channels[0]);
        webclient.channel = this.channels[0];
    }

    var channelholder = ChannelHolder.prototype;

    channelholder.channel = function (id) {
        var chan;
        if (id === -1) {
            return null;
        }

        if (!(id in this.channels)) {
            this.channels[id] = chan = new webclient.classes.ChannelTab(id, this.names[id]);
            this.newChannel(id, this.names[id]);
            this.channelCount += 1;
            this.observe(chan);

            if (this.channelCount === 1) {
                webclient.channel = chan;
            }
        }

        return this.channels[id];
    };

    channelholder.hasChannel = function (id) {
        return id in this.channels;
    };

    channelholder.setNames = function (names) {
        var chan, i;

        this.names = names;
        for (i in this.names) {
            this.byName[this.names[i]] = i;
        }

        /* Updating already existing channels if needed */
        for (i in this.channels) {
            if ((i in names) && (chan = this.channel(i)).name !== names[i]) {
                chan.changeName(names[i]);
            }
        }
    };

    channelholder.changeChannelName = function (id, name) {
        if (!(id in this.names)) {
            this.newChannel(id, name);
            return;
        }

        delete this.byName[this.names[id]];
        this.names[id] = name;
        this.byName[name] = id;

        if (id in this.channels) {
            this.channels[id].changeName(name);
        }
    };

    channelholder.newChannel = function (id, name) {
        if (id in this.names) {
            return;
        }

        this.names[id] = name;
        this.byName[name] = id;
    };

    channelholder.removeChannel = function (id) {
        var chan;
        if (id in this.channels) {
            chan = this.channels(id);
            if (chan.closable & 2) {
                chan.remove();
            } else {
                chan.print("<i>The channel was destroyed.</i>", true);
                chan.disconnect();
                delete this.channels[id];
            }
        }

        delete this.names[id];
    };

    channelholder.current = function () {
        return this.channel(this.currentId());
    };

    channelholder.currentId = function() {
        return webclient.currentChannel();
    };

    channelholder.idFromIndex = function (index) {
        var queryIndex = index + 1,
            hrefid = $("#channel-tabs > ul li:nth-child( " + queryIndex + ") a").attr("href");

        if (!/^#channel-/.test(hrefid)) {
            return -1;
        }

        return hrefid.substr(hrefid.indexOf("-") + 1);
    };

    channelholder.channelsByName = function (lowercase) {
        var o = [],
            name;

        for (name in this.byName) {
            o.push(lowercase ? name.toLowerCase() : name);
        }

        return o;
    };

    channelholder.leaveChannel = function (chanid) {
        if (!this.hasChannel(chanid) || this.channel(chanid).closable & 1) {
            $('#channel-tabs').tabs("remove", "#channel-" + chanid);
        } else {
            this.channel(chanid).closable |= 2;
            network.command('leavechannel', {channel: chanid});
        }
    };

    channelholder.observe = function (chan) {
        var self = this;

        chan.on("playeradd", function (id) {
            if (this.isCurrent()) {
                self.trigger("playerlistadd", id);
            }
        }).on("playerremove", function (id) {
            if (this.isCurrent()) {
                self.trigger("playerlistremove", id);
            }
        }).on("setplayers", function () {
            if (this.id === self.currentId()) {
                self.trigger("generateplayerlist", this.playerIds());
            }
        }).on("disconnect", function () {
            self.trigger("testplayers", this.players);
        }).on("close", function () {
            self.leaveChannel(this.id);
        }).on("remove", function () {
            var id = this.id;

            $('#channel-tabs').tabs("remove", "#channel-" + id);
            this.disconnect();

            delete self.channels[id];
        });
    };

    webclient.classes.ChannelHolder = ChannelHolder;
}());
