(function($) {	
	jQuery.fn.fillSelect = function(object){
		
		var select = $(this);
		
		$.each(object, function(key, value) {
			select.append($('<option></option>').attr('value', key).text(value));
		});
		
		return $(this);
	};
	
	jQuery.fn.destroyCombobox = function() {
		if($(this).hasClass('ui-combobox-input'))
		{
			$(this).combobox('destroy');
		}
		
		return $(this);
	};
	
	jQuery.fn.destroyAutocomplete = function() {
		if($(this).hasClass('ui-autocomplete-input'))
		{
			$(this).autocomplete('destroy');
		}
		
		return $(this);
	};
	
	jQuery.fn.reloadCombobox = function(data, default_value) {
		$(this).destroyCombobox().find('option').remove().end().fillSelect(data).val(default_value).combobox();
		return $(this);
	};
	
	jQuery.updateObjectKeys = function(object, integer) {
		var obj = {};
		$.each(object, function(index, value) {
			obj[parseInt(integer)+parseInt(index)] = value;
		});
		
		return obj;
	};
}(jQuery));