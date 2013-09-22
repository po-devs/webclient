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
	
	$(".pokemon-slot-advanced").on('click', function() {
		$(this).parent().parent().find(' .pokemon-slot-advanced-content').toggle();
	});
	
	$(".pokemon-slot-hidden-power-type, .pokemon-slot-ability, .pokemon-slot-nature, .pokemon-slot-item").combobox();
	
	$("#save_team").on('click', function(e) {
		e.preventDefault();
		alert(JSON.stringify($("#team_form").serializeArray()));
	});
	
	$(".pokemon-evs-value").knob({
		min:0,
		max:255,
		step:4,
		width:90,
		height:90,
		thickness:.06,
		displayInput:true,
		fgColor:'#1f5d96',
		bgColor:'#f5f5f5',
		font:'inherit',
		inputColor:'#757575'
	});
	
	$(".pokemon-ivs-value").knob({
		min:0,
		max:31,
		step:1,
		width:75,
		height:75,
		thickness:.06,
		displayInput:true,
		fgColor:'#1f5d96',
		bgColor:'#f5f5f5',
		font:'inherit',
		inputColor:'#757575'
	});
	
	$(".pokemon-level-value").slider({
		min:0,
		max:100,
		create: function( event, ui ) {
			$(this).parent().find('.pokemon-level-display-value').text($(this).slider('value'));
		},
		slide: function( event, ui ) {
			$(this).parent().find('.pokemon-level-display-value').text($(this).slider('value'));
		},
		change: function( event, ui ) {
			$(this).parent().find('.pokemon-level-display-value').text($(this).slider('value'));
		}
	});
	
	
	$(".pokemon-happiness-value").slider({
		min:0,
		max:255,
		create: function( event, ui ) {
			$(this).parent().find('.pokemon-happiness-display-value').text($(this).slider('value'));
		},
		slide: function( event, ui ) {
			$(this).parent().find('.pokemon-happiness-display-value').text($(this).slider('value'));
		},
		change: function( event, ui ) {
			$(this).parent().find('.pokemon-happiness-display-value').text($(this).slider('value'));
		}
	});
	
	$("#tb-team-generation-value").fillSelect(pokedex.generations).val($(this).find('option:last-child').val()).combobox();
	$(".moves-list tr").on('click', function() {
		var move_name = $(this).find('.move-name').text();
		var moves = $(this).closest('.pokemon-slot').find('.pokemon-move-selection');
		var moves_values = moves.formValues();
		moves_values = moves_values['pokemon-move-selection[]'];
		moves.each(function(index) {
			if($(this).val() == '' && moves_values.indexOf(move_name) == -1)
			{
				$(this).val(move_name);
				return false;
			}
		});
	});
	
	$("#pokemon-tabs").sortable().on('sortstart', function(event, ui) {
		$("#pokemon-tabs .pokemon-tab").each(function(index) {
			$(this).attr('id', 'tb_tab_temporary_id_'+index);
			$(".pokemon-slot").eq(index).attr('id', 'tb_tab_content_temporary_id_'+index)
		});
	}).on('sortupdate', function(event, ui) {
		var selector = "#tb_tab_content_"+ui.item.attr('id').substr(7);
		
		if(ui.item.index() > $(selector).index())
		{
			$(".pokemon-slot").eq(ui.item.index()).after($(selector));
		}
		else
		{
			$(".pokemon-slot").eq(ui.item.index()).before($(selector));
		}
	}).on('sortstop', function(event, ui) {
		$("#pokemon-tabs .pokemon-tab").removeAttr('id'),
		$(".pokemon-slot").removeAttr('id');
	});
	
	$("#pokemon-tabs .pokemon-tab").on('click', function() {
		$('.pokemon-tab.active-pokemon-tab').removeClass('active-pokemon-tab');
		$(this).addClass('active-pokemon-tab');
		$('.pokemon-slot').removeClass('active-pokemon-slot').eq($(this).index()).addClass('active-pokemon-slot');
	});
	
	
});