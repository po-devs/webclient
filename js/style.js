$(document).ready(function() {
	
	$("#tab-titles").on('click', 'li i', function() {
		if($("#tab-titles li").length > 1)
		{
            var dparent = $(this).parent().parent();
			var href = dparent.attr("href");
            objFromId(href).close();
		}
	});
	
	$(".dropdown_button").on('click', function() {
		$(this).find('i').toggle();
		$(this).parent().find('.dropdown_content').toggle();
	});
	
	$("#trainer_username, #create_team, #po_title").on('click', function() {
		$(".middle_block").hide();
		switch($(this).attr('id'))
		{
			case 'trainer_username':
				$("#user_params").show();
			break;
			
			case 'create_team':
				$("#teambuilder").show();
			break;
			
			case 'po_title':
				$("#content").show();
			break;
		}
	});
	
	/* Teambuilder */
	
	$("#pokemon-parameters .icon-gear").on('click', function() {
		$("#team-infos").toggle();
	});
	
	$(".pokemon-slot-gender-radio").on('change', function() {
		$(this).parent().find(' .pokemon-slot-gender-checked').removeClass('pokemon-slot-gender-checked');
		$("label[for='"+$(this).attr('id')+"']").addClass('pokemon-slot-gender-checked');
	});
	
});