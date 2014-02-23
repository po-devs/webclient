$(document).ready(NProgress.start);
$(window).load(NProgress.done);
$.ajaxSetup({
    cache: true
});

vex.defaultOptions.className = 'vex-theme-os';
webclient = {
    registry: {
        descriptions: {}
    },

    ui: {
        playersList: null
    },

    classes: {},
    teambuilder: null,
    players: null,
    channels: null,

    // Current channel
    channel: null,
    currentChannel: function () {
        return webclient.channel ? webclient.channel.id : -1;
    },

    // Current player shown in the info dialog
    shownPlayer: -1,

    // The player's id
    ownId: -1,
    ownName: function () {
        return webclient.players ? webclient.players.name(webclient.ownId) : "";
    }
};
