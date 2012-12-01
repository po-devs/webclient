var utils = {
    /* Stolen from here: http://www.bloggingdeveloper.com/post/JavaScript-QueryString-ParseGet-QueryString-with-Client-Side-JavaScript.aspx */
    getQuerystring: function(key, default_) {
      if (default_==null) default_=""; 
      key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
      var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
      var qs = regex.exec(window.location.href);
      if(qs == null)
        return default_;
      else
        return qs[1];
    }
};