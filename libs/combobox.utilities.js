(function($) {
    $.getFirstPropertyIndex = function(object) {
        var i;
        for (i in object) {
            if (object.hasOwnProperty(i)) {
                return i;
            }
        }
    };


    $.fn.fillSelect = function(object){
        var select = $(this);
        var options = "";
        var key;

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                options += '<option value="'+key+'">'+object[key]+'</option>';
            }
        }

        select.append(options);
        return select;
    };

    $.fn.destroyCombobox = function() {
        var $this = $(this);
        if($this.hasClass('ui-combobox-input'))
        {
            $this.combobox('destroy');
        }

        return $this;
    };

    $.fn.destroyAutocomplete = function() {
        var $this = $(this);
        if($this.hasClass('ui-autocomplete-input'))
        {
            $this.autocomplete('destroy');
        }

        return $this;
    };

    $.fn.reloadCombobox = function(data, default_value, select_event) {
        var $this = $(this);
        $this.destroyCombobox().find('option').remove().end().fillSelect(data).val(default_value).combobox(select_event != undefined ? { select: function(e, ui) { select_event(e, ui) } } : {});
        return $this;
    };

    $.updateObjectKeys = function(object, integer) {
        var obj = {}, i;
        integer = parseInt(integer, 10);

        for (i in object) {
            obj[integer + parseInt(i, 10)] = object[i];
        }

        return obj;
    };
}(jQuery));
