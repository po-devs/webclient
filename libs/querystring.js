function getQuerystring(key, default_,query_) {
    if (default_==null) default_=""; 
    if (query_===undefined) query_=window.location.href;
    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
    var qs = regex.exec(query_);
    if(qs == null)
    return default_;
        else
    return qs[1];
}
