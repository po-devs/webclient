(function (webclient) {
    function BaseTab(/* id */) {
        $.observable(this);
    }

    BaseTab.prototype.isCurrent = function () {
        return this === webclient.channel;
    };

    BaseTab.prototype.activateTab = function () {
        if (!this.isCurrent()) {
            $("#channel-tabs > ul li a[href='#" + this.shortHand + "-" + this.id + "']").addClass("tab-active");
        }
    };

    webclient.classes.BaseTab = BaseTab;
}(webclient));
