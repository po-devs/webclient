function ChannelTab(/* id */)
{
    //this.id = id;
    //this.shortHand = "channel-tab";
}

ChannelTab.prototype.isCurrent = function()
{
    return room == this;
}

ChannelTab.prototype.activateTab = function()
{
    if (!this.isCurrent()) {
        $("#channel-tabs > ul li a[href='#"+this.shortHand+"-"+this.id+"']").addClass("tab-active");
    }
}