$(document).ready(function() {
	// makes :contains selector case insensitive
	$.expr[":"].contains = $.expr.createPseudo(function(arg) {
		return function( elem ) {
			return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
		};
	});
	$("#tabs").sortable().on('sortstart', function(event, ui) {
		$("#tabs span").each(function(index) {
			$(this).attr('id', 'tab_temporary_id_'+index);
			$(".chat_messages").eq(index).attr('id', 'chat_temporary_id_'+index)
		});
	}).on('sortupdate', function(event, ui) {
		var chat_selector = "#chat_"+ui.item.attr('id').substr(4);
		if(ui.item.index() > $(chat_selector).index())
		{
			$(".chat_messages").eq(ui.item.index()).after($(chat_selector));
		}
		else
		{
			$(".chat_messages").eq(ui.item.index()).before($(chat_selector));
		}
	}).on('sortstop', function(event, ui) {
		$("#tabs span").removeAttr('id'),
		$(".chat_messages").removeAttr('id');
	});
	
	$("#tabs span").on('dblclick', function() {
		$('.active_tab').removeClass('active_tab');
		$(this).addClass('active_tab');
		$(".chat_messages").css('display', 'none').eq($(this).index()).css('display', 'block');
	});
	
	$("#tabs span i").on('click', function() {
		if($("#tabs span").length > 1)
		{
			var position = $(this).parent().index();
			
			if($(this).parent().hasClass('active_tab'))
			{
				var offset = position+1 == $("#tabs span").length ? -1 : 1;
				$("#tabs span").eq(position+offset).addClass('active_tab');
				$(".chat_messages").eq(position+offset).css('display', 'block');
			}
			$("#tabs span").eq(position).remove();
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