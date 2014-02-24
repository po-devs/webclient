(function () {
    var pmholder = PMHolder.prototype;

    function PMHolder() {
        var self = this;
        $.observable(self);

        self.pms = {};

        self.on("playerlogin", function (id) {
            if (id in self.pms) {
                self.pm(id).reconnect();
            }
        }).on("playerlogout", function (id) {
            if (id in self.pms) {
                self.pm(id).disconnect();
            }
        });
    }

    pmholder.pm = function (pid) {
        var pm;
        if (pid in this.pms) {
            return this.pms[pid];
        }

        if (webclient.players.isIgnored(pid)) {
            return;
        }

        pm = this.pms[pid] = new webclient.classes.PMTab(pid);
        this.observe(pm);
        return pm;
    };

    pmholder.observe = function (pm) {
        var self = this;

        pm.on("close", function () {
            delete self.pms[pm.id];
        });
    };

    webclient.classes.PMHolder = PMHolder;
}());
