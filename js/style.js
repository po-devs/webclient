$(document).ready(function() {
	// makes :contains selector case insensitive
	$.expr[":"].contains = $.expr.createPseudo(function(arg) {
		return function( elem ) {
			return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
		};
	});
	
	$("#tab-titles span i").on('click', function() {
		if($("#tab-titles span").length > 1)
		{
			var position = $(this).parent().index();
			
			if($(this).parent().hasClass('active_tab'))
			{
				var offset = position+1 == $("#tab-titles span").length ? -1 : 1;
				$("#tab-titles span").eq(position+offset).addClass('active_tab');
				$(".chat_messages").eq(position+offset).css('display', 'block');
			}
			$("#tab-titles span").eq(position).remove();
			$(".chat_messages").eq(position).remove();
		}
	});
	
	$(".dropdown_button").on('click', function() {
		$(this).find('i').toggle();
		$(this).parent().find('.dropdown_content').toggle();
	});
	
	$("input[name='search_user']").on('keyup', function() {
		$("ul#players li").hide();
		$("ul#players li:contains("+$(this).val()+")").show();
	});
});