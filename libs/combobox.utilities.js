(function($) {	
	jQuery.fn.fillSelect = function(object){
		
		var select = $(this);
		
		$.each(object, function(key, value) {
			select.append($('<option></option>').attr('value', key).text(value));
		});
		
		return $(this);
	};
}(jQuery));