(function (WebSocket) {
    var states = {
        Connecting: 0,
        Open: 1,
        Closing: 2,
        Closed: 3,
        '0': 'Connecting',
        '1': 'Open',
        '2': 'Closing',
        '3': 'Closed'
    };

    // TODO: Organize this
    var transformers = {
        register: function () {
            return 'register|';
        },
        registry: function () {
            return 'registry';
        },
        // ?
        teamchange: function (payload) {
            return 'teamChange|' + JSON.stringify(payload);
        },
        // battle: number
        watch: function (payload) {
            return 'watch|' + payload.battle;
        },
        // battle: number
        stopwatching: function (payload) {
            return 'stopwatching|' + payload.battle;
        },
        // sameTier: boolean, range: number
        findbattle: function (payload) {
            return 'findbattle|' + JSON.stringify(payload);
        },
        // ?
        battlechoice: function (payload) {
            return 'battlechoice|' + payload.id + '|' + JSON.stringify(payload.choice);
        },
        // battle: number
        forfeit: function (payload) {
            return 'forfeit|' + payload.battle;
        },
        // id: number
        player: function (payload) {
            return 'player|' + payload.id;
        },
        // ip: string
        connect: function (payload) {
            return 'connect|' + payload.ip;
        },
        // channel: number
        joinchannel: function (payload) {
            return 'join|' + payload.channel;
        },
        // channel: number
        leavechannel: function (payload) {
            return 'leave|' + payload.channel;
        },
        // message: string, channel: number
        chat: function (payload) {
            return 'chat|' + JSON.stringify(payload);
        },
        // to: number, message: string
        pm: function (payload) {
            return 'pm|' + JSON.stringify(payload);
        },
        // battle: number, message: string
        battlechat: function (payload) {
            return 'battlechat|' + payload.battle + '|' + payload.message;
        },
        // battle: number, message: string
        spectatingchat: function (payload) {
            return 'spectatingchat|' + payload.battle + '|' + payload.message;
        },
        // version: number, name: string, default: string, autojoin: string, ladder: boolean, idle: boolean, color: string
        login: function (payload) {
            return 'login|' + JSON.stringify(payload);
        },
        // hash: string
        auth: function (payload) {
            return 'auth|' + payload.hash;
        },
        // id: number
        getrankings: function (payload) {
            return 'getrankings|' + payload.id;
        }
    };

    var parsers = {
        defaultserver: function (payload) {
            /* If the server is on the same IP as the relay, we display the server IP but
                send localhost */
            var server = payload.replace("localhost", relayIP),
                qserver = utils.queryField("server");

            $("#advanced-connection").val((qserver && qserver !== "default") ? qserver : server);

            if (utils.queryField("autoconnect") === "true") {
                connect();
            } else {
                this.command('registry');
            }
        },
        servers: function (payload) {
            var servers = JSON.parse(payload),
                html = "",
                server, len, i;

            for (i = 0, len = servers.length; i < len; i += 1) {
                server = servers[i];
                html += "<tr><td class='server-name'>" + server.name + "</td><td>" + server.num + ("max" in server ? " / " + server.max : "") + "</td>" + "<td class='server-ip'>" + server.ip + ":" + server.port + "</td></tr>";
                serverDescriptions[server.name] = server.description;
            }

            $("#servers-list tbody").prepend(html);
            $("#servers-list").tablesorter({
                sortList: [[1, 1]]
            });
        },
        connected: function () {
            var net = this;
            displayMessage("Connected to server!");

            var username = $("#username").val();
            if (username && username.length > 0) {
                poStorage.set("username", username);
            } else {
                poStorage.remove("username");
            }

            var data = {version: 1};
            if (utils.queryField("user") || username) {
                data.name = utils.queryField("user") || username;
                data.default = utils.queryField("channel");
                data.autojoin = utils.queryField("autojoin");
                if (data.autojoin) {
                    data.autojoin = data.autojoin.split(",");
                }

                data.ladder = poStorage.get('player.ladder', 'boolean');
                if (data.ladder == null) {
                    data.ladder = true;
                }

                data.idle = poStorage.get('player.idle', 'boolean');
                if (data.idle == null) {
                    data.idle = false;
                }

                this.command('login', data);
            } else {
                vex.dialog.open({
                    message: 'Enter your username:',
                    input: '<input name="username" type="text" placeholder="Username"/>',
                    buttons: [
                        $.extend({}, vex.dialog.buttons.YES, {text: 'Login'}),
                        $.extend({}, vex.dialog.buttons.NO, {text: 'Login as Guest'})
                    ],
                    callback: function (res) {
                        if (res && res.username) {
                            data.name = res.username;
                        }

                        net.command('login', data);
                    }
                });
            }
        },
        disconnected: function () {
            displayMessage("Disconnected from server!");
            announcement.hide("slow");
        },
        msg: function (payload) {
            displayMessage(payload);
        },
        error: function (payload) {
            displayMessage(payload);
        },
        chat: function (payload) {
            var params = JSON.parse(payload),
                chan = channels.channel(params.channel);

            if ((params.channel == -1 && params.message.charAt(0) != "~") || !chan) {
                displayMessage(params.message, params.html, true);
            } else {
                chan.print(params.message, params.html);
            }
        },
        challenge: function (payload) {
            var password = $("#password").val(),
                net = this,
                hash;

            if (password) {
                hash = MD5(MD5(password) + payload);
                net.send('auth', {hash: hash});
            } else {
                vex.dialog.open({
                    message: 'Enter your password:',
                    input: '<input name="password" type="password" placeholder="Password" required />',
                    callback: function (res) {
                        if (res && res.password) {
                            // after clicking OK
                            // res.password is the value from the textbox
                            hash = MD5(MD5(res.password) + payload);
                            net.send('auth', {hash: hash});
                        } else {
                            // after clicking Cancel
                            net.close();
                        }
                    }
                });
            }
        },
        announcement: function (payload) {
            showHtmlInFrame(announcement, payload);
            announcement.css("visibility", "visible");
        },
        channels: function (payload) {
            channels.setNames(JSON.parse(payload));
        },
        newchannel: function (payload) {
            var params = JSON.parse(payload);
            channels.newChannel(params.id, params.name);
        },
        removechannel: function (payload) {
            channels.removeChannel(payload);
        },
        channelnamechange: function (payload) {
            var params = JSON.parse(payload);
            channels.changeChannelName(params.id, params.name);
        },
        players: function (payload) {
            var params = JSON.parse(payload);
            players.addPlayer(params);

            if (currentOpenPlayer !== -1 && currentOpenPlayer in params && "info" in params[currentOpenPlayer]) {
                updatePlayerInfo(params[currentOpenPlayer]);
            }
        },
        playerlogout: function (payload) {
            players.removePlayer(payload);
        },
        join: function (payload) {
            var parts = payload.split("|"),
                chan = parts[0],
                player = parts[1];

            channels.channel(chan).newPlayer(player);
        },
        leave: function (payload) {
            var parts = payload.split("|"),
                chan = parts[0],
                player = parts[1];

            channels.channel(chan).removePlayer(player);
            players.testPlayerOnline(player);
        },
        channelplayers: function (payload) {
            var params = JSON.parse(payload);
            channels.channel(params.channel).setPlayers(params.players);
        },
        login: function (payload) {
            var params = JSON.parse(payload);
            players.login(params.id, params.info);

            this.command('getrankings', {id: params.id});
        },
        unregistered: function (payload) {
            $("#register").attr("disabled", false);
        },
        pm: function (payload) {
            var params = JSON.parse(payload),
                src = params.src;
            pms.pm(src).print(src, params.message);
        },
        watchbattle: function (payload) {
            var id = payload.split("|")[0];
            var params = JSON.parse(payload.slice(id.length + 1));
            battles.watchBattle(+id, params);
        },
        battlecommand: function (payload) {
            var battleid = payload.split("|")[0];
            if (battleid in battles.battles) {
                battles.battle(battleid).dealWithCommand(JSON.parse(payload.slice(battleid.length + 1)));
            }
        },
        battlestarted: function (payload) {
            var battleid = payload.split("|")[0],
                battle = JSON.parse(payload.slice(battleid.length + 1)),
                obj = {};

            obj[battleid] = battle;
            battles.addBattle(obj);
        },
        channelbattle: function (payload) {
            var chanid = payload.split("|")[0],
                params = JSON.parse(payload.slice(chanid.length + 1)),
                obj = {};

            obj[params.battleid] = params.battle;
            battles.addBattle(obj);
        },
        channelbattlelist: function (payload) {
            var chanid = payload.split("|")[0],
                battle = JSON.parse(payload.slice(chanid.length + 1));

            battles.addBattle(battle);

            /* Update whole player list */
            if (chanid == currentChannel) {
                playerList.setPlayers(room.playerIds());
            }
        },
        battlefinished: function (payload) {
            var battleid = payload.split("|")[0],
                result = JSON.parse(payload.slice(battleid.length + 1));

            battles.battleEnded(battleid, result);
        },
        rankings: function (payload) {
            var parts = payload.split("|"),
                id = parts[0],
                rankings = JSON.parse(parts[1]), tier, rank,
                html = "";

            for (tier in rankings) {
                rank = rankings[tier];
                if (rank.ranking === -1) {
                    html += "<li><strong>Unranked</strong>";
                } else {
                    html += "<li><strong>#" + rank.ranking + "/" + rank.total + "</strong> <em>(" + rank.rating + ")</em>";
                }

                html += " - <strong>" + tier + "</strong></li>";
            }

            $("#rankings").html(html);
        },
        tiers: function (payload) {
            window.tiersList = JSON.parse(payload);
        }
    };

    function Network() {
        this.socket = null;
        this._opened = false;

        this.buffer = [];
    }

    var proto = Network.prototype;
    proto.open = function (ip, onopen, onerror, onclose) {
        if (this._opened) {
            return;
        }

        this.socket = new WebSocket("ws://" + ip);
        this._opened = true;
        this.socket.onopen = this.onopen(onopen);
        this.socket.onmessage = this.onmessage();
        if (typeof onerror === "function") {
            this.socket.onerror = onerror;
        }
        if (typeof onerror === "function") {
            this.socket.onclose = onclose;
        }
        return this;
    };

    proto.command = proto.send = function (command, payload) {
        this.sendRaw(transformers[command].call(this, payload));
        return this;
    };

    proto.sendRaw = function (msg) {
        if (!this.isOpen()) {
            this.buffer.push(msg);
            return this;
        }

        try {
            this.socket.send(msg);
        } catch (ex) {} // Ignore potential SYNTAX_ERRs
        return this;
    };

    proto.close = function () {
        if (!this.opened()) {
            return;
        }

        this.socket.close(1000);
        this.socket = null;
        this._opened = false;
        return this;
    };

    // State
    proto.opened = function () {
        var socket = this.socket;
        return socket && (socket.readyState === states.Connecting || socket.readyState === states.Open);
    };

    proto.isOpen = function () {
        var socket = this.socket;
        return socket && (socket.readyState === states.Open);
    };

    // Events
    proto.onopen = function (cb) {
        var net = this;

        return function () {
            var buffer = net.buffer,
                len = buffer.length,
                i;

            for (i = 0; i < len; i += 1) {
                net.sendRaw(buffer[i]);
            }

            if (typeof cb === "function") {
                cb.call(net, net);
            }
        };
    };

    proto.onmessage = function () {
        var net = this;
        return function (evt) {
            var data = evt.data,
                pipe = data.indexOf('|');

            if (pipe === -1) {
                console.log("Received raw message, should be changed in the relay station:", data);
                displayMessage(data);
            } else {
                var cmd = data.substr(0, pipe),
                    payload = data.slice(pipe + 1);
                if (parsers.hasOwnProperty(cmd)) {
                    parsers[cmd].call(net, payload);
                }
            }
        };
    };

    Network.states = proto.states = states;
    Network.transformers = transformers;
    Network.parsers = parsers;

    window.Network = Network;
    window.network = new Network();
}(typeof MozWebSocket === 'function' ? MozWebSocket : WebSocket));
