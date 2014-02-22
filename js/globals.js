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
    classes: {},
    teambuilder: null,
    channel: null,
    channelId: function () {
        return webclient.channel ? webclient.channel.id : -1;
    }
};

$.jqcache = {};
// $.c("#password")
$.c = function (selector) {
    return $.jqcache[selector] || ($.jqcache[selector] = $(selector));
};
