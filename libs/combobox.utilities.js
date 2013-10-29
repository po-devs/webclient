(function($) {	
	
	jQuery.getFirstPropertyIndex = function(object) {
		
		var first;
		
		$.each(object, function(index) {
			first = index;
			return false;
		});
		
		return first;
	};
	
	
	jQuery.fn.fillSelect = function(object){
		
		var select = $(this);
		var options = "";
		
		$.each(object, function(key, value) {
			options += '<option value="'+key+'">'+value+'</option>';
		});
		select.append(options);
		
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
	
	jQuery.fn.reloadCombobox = function(data, default_value, select_event) {
		$(this).destroyCombobox().find('option').remove().end().fillSelect(data).val(default_value).combobox(select_event != undefined ? { select: function(e, ui) { select_event(e, ui) } } : {});
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