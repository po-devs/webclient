(function (webclient) {
    /* The list of players */
    function ChannelList() {
        this.ids = [];
        this.element = $("#channel-list");
    }

    var channellist = ChannelList.prototype;

    channellist.setChannels = function (playerIds) {
        var html = "",
            len, i;

        /* Could be optimized, but later */
        playerIds.sort(function(a, b) {
            return webclient.channels.name(a).toLowerCase().localeCompare(webclient.channels.name(b).toLowerCase());
        });

        for (i = 0, len = playerIds.length; i < len; i += 1) {
            html += this.createChannelItem(playerIds[i]);
        }

        this.element.html(html);
        this.ids = playerIds;
    };

    channellist.createChannelItem = function (id) {
        var name = webclient.channels.name(id),
            ret;

        ret = "<li class='channel-list-item";

        ret += "' id='channel-list-"+id+"'>" + utils.escapeHtml(name) + "</li>";
        return ret;
    };

    channellist.addChannel = function (id) {
        var name = webclient.channels.name(id),
            lname = name.toLowerCase(),
            item;

        /* Find the place where to put the name - dichotomy */
        var pos = this.ids.dichotomy(function (pid) {
            return lname.localeCompare((webclient.channels.name(pid) || "").toLowerCase());
        });

        /* Add the graphical element */
        item = this.createChannelItem(id);
        if (pos === this.ids.length) {
            this.element.append(item);
        } else {
            /* Inserts the item before the player at pos */
            $(".channel-list-item#channel-list-" + this.ids[pos]).before(item);
        }

        // Add the id after the position
        this.ids.splice(pos, 0, id);
    };

    channellist.removeChannel = function (id) {
        var pos = this.ids.indexOf(id);
        if (pos !== -1) {
            this.ids.splice(pos, 1);
        }

        /* Remove the graphical element */
        $(".channel-list-item#channel-list-" + id).remove();
    };

    channellist.updateChannel = function (id) {
        if (this.ids.indexOf(id) !== -1) {
            this.removeChannel(id);
            this.addChannel(id);
        }
    };

    webclient.classes.ChannelList = ChannelList;
}(webclient));
