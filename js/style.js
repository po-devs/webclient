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
    $("#battle-html").load("battle.html");
	$("#teambuilder").load("teambuilder.html", function() {
        setTimeout(function () {
            /* Teambuilder */
            var tb = new teambuilder();
        }, 4); // 4 is the minimum delay
	})
});