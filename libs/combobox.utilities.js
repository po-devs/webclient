(function($) {
    // Unused.
    /*$.getFirstPropertyIndex = function(object) {
        var i;
        for (i in object) {
            if (object.hasOwnProperty(i)) {
                return i;
            }
        }
    };*/

    // Unused
    /*
    $.updateObjectKeys = function(object, integer) {
        var obj = {}, i;
        integer = parseInt(integer, 10);

        for (i in object) {
            obj[integer + parseInt(i, 10)] = object[i];
        }

        return obj;
    };*/

    $.fn.fillSelect = function(object){
        var options = "",
            key;

        for (key in object) {
            options += '<option value="' + key + '">' + object[key] + '</option>';
        }

        return this.append(options);
    };

    $.fn.destroyCombobox = function() {
        if (this.hasClass('ui-combobox-input')) {
            this.combobox('destroy');
        }

        return this;
    };

    $.fn.destroyAutocomplete = function() {
        if (this.hasClass('ui-autocomplete-input')) {
            this.autocomplete('destroy');
        }

        return this;
    };

    $.fn.reloadCombobox = function(data, default_value, select_event) {
        return this
                .find('option')
                .remove()
            .end()
            .fillSelect(data)
            .val(default_value)
            .combobox(select_event ? {select: select_event} : {});
    };
}(jQuery));
