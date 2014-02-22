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
    channelId: function () {
        return webclient.channel ? webclient.channel.id : -1;
    },

    // Current player shown in the info dialog
    shownPlayer: -1
};

$.jqcache = {};
// $.c("#password")
$.c = function (selector) {
    return $.jqcache[selector] || ($.jqcache[selector] = $(selector));
};
