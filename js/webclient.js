$(document).ready(NProgress.start);
$(window).load(NProgress.done);
$.ajaxSetup({
    cache: true
});

if (vex) {
    vex.defaultOptions.className = 'vex-theme-os';
}

webclient = {
    registry: {
        descriptions: {}
    },

    ui: {
        playerList: null
    },

    classes: {},

    // Initialized later
    teambuilder: null,
    players: null,
    channels: null,
    pms: null,

    // Current channel
    channel: null,
    currentChannel: function () {
        return (webclient.channel && webclient.channel.shortHand == "channel") ? webclient.channel.id : -1;
    },

    // Current player shown in the info dialog
    shownPlayer: -1,

    // The player's id
    ownId: -1,
    ownName: function () {
        return webclient.players ? webclient.players.name(webclient.ownId) : "";
    }
};

/* Also:
    * webclient.findBattle(void)
    * webclient.connectToServer(void)
    * webclient.connectToRelay(void)
    * webclient.updatePlayerInfo(int player)
    * webclient.switchToTab(string selector)
    * webclient.print(string message, bool html=true, bool raw=false)
    * webclient.printRaw(string message, bool html=false)
    * webclient.printHtml(string message)
    * webclient.joinChannel(string channelname)
    * webclient.sandboxHtml(jQuery|string selector, string html)
    * webclient.initUserParams(void)
    * webclient.sendProfile(void)
    * webclient.convertImages(jQuery|string selector)
    * webclient.sendMessage(string message, string fromid)
*/

$.observable(webclient);
