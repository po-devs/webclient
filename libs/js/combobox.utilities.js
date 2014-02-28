(function($) {
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
