$(document).ready(function() {
    var mode = 'content',
        $teambuilder = $("#teambuilder"),
        $user_params = $("#user_params"),
        $content = $("#content"),
        $middle_block = $(".middle_block");

	$("#tab-titles").on('click', 'li i', function() {
		if($("#tab-titles li").length > 1)
		{
			var dparent = $(this).parent().parent();
			var href = dparent.attr("href");
			objFromId(href).close();
		}
	});
	
	$(".dropdown_button").click(function() {
        var $this = $(this);
		$this.find('i').toggle();
		$this.parent().find('.dropdown_content').toggle();
        // if ($this.data('teambuilder')) { teambuilder.init(); }
	});
    
    // Type should be one of: content, user_params, teambuilder
    function toggleContent(type) {
        if (mode === 'user_params' || mode === 'teambuilder' || type === 'content') {
            $content.show();
            type = 'content';
        } else if (type === 'user_params') {
            $user_params.show();
        } else if (mode === 'content' || type === 'teambuilder') {
            $teambuilder.show();
            type = 'teambuilder';
        }
        
        mode = type;
    }
    
	$("#trainer_username, #create_team, #po_title").on('click', function() {
		$middle_block.hide();
        teambuilder.init();

		switch(this.id)
		{
			case 'trainer_username':
                toggleContent('user_params');
			break;
			case 'create_team':
                toggleContent('teambuilder');
			break;
			case 'po_title':
                toggleContent();
			break;
		}
	});
    $("#battle-html").load("battle.html");
	$("#teambuilder").load("teambuilder.html", function() {
        setTimeout(function () {
            /* Teambuilder */
            teambuilder = new Teambuilder();
        }, 4); // 4 is the minimum delay
	})
});