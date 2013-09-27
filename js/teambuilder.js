$(document).ready(function() {
	// teambuilder class
	
	function teambuilder(generation) {
		
		this.default_settings = {
			team_name:'',
			tier_name:'',
			generation:5,
			gender:'male', // if the pokemon is not genderless
			level:100,
			happiness:255,
			ivs:'max', // min or max
			evs:0,
			stats_ids:[0, 1, 2, 3, 4, 5],
			special_stat:{ id:3, replace_ids:[3, 4]},
			missingno_sprite:'http://pokemon-online.eu/images/pokemon/black-white/0.png',
			unknown_type_id:17
		};
		this.setGeneration(generation != undefined ? generation : this.default_settings.generation);
	}
	
	teambuilder.prototype.setGeneration = function(generation) {
		if(this.getTeamInfo('team_generation') != generation)
		{
			// we reset all the informations on the teambuilder
			this.resetTeamBuilder();
			// changing the selected generation on the dropdown list
			$("#tb-team-generation-value").combobox('destroy').val(generation).combobox();
		}
	};
	
	teambuilder.prototype.resetTeamBuilder = function() {
		$("#tb-team-name, #tb-team-tier").val('');
		// making the first tab the one that is active
		$('.pokemon-tab').removeClass('active-pokemon-tab').eq(0).addClass('active-pokemon-tab');
		$('.pokemon-slot').removeClass('active-pokemon-slot').eq(0).addClass('active-pokemon-slot');
		// now clearing pokemon specific infos
		// pokemon icons reset (in tabs)
		
		// pokemon sprite reset
		$(".pokemon-slot-sprite img").attr('src', this.default_settings.missingno_sprite);
		// reset pokemon shiny checkbox
		
		// pokemon name
		$(".pokemon-slot-name").autocomplete.('destroy').val().autocomplete({ source:$.makeArray(pokedex.pokes.released[this.getTeamInfo('team_generation')]) });
		// types
		$('.pokemon-slot-type-block').empty();
		$('<span></span>').addClass('pokemon-slot-type, type_'+this.default_settings.unknown_type_id).text(pokedex.types.types[this.default_settings.unknown_type_id]).appendTo('pokemon-slot-type-block');
		// gender
		$(".pokemon-slot-gender-radio").attr('checked', '');
		// pokemon nickname
		$(".pokemon-slot-nickname").val();
		// hide advanced options
		$(".pokemon-slot-advanced-content").hide();
		// setting level to default
		$(".pokemon-level-value").slider('value', this.default_settings.level);
		// setting happiness to default
		$(".pokemon-level-value").slider('value', this.default_settings.happiness);
		// recreating IVs inputs
		$(".pokemon-ivs-selectors").empty();
		this.default_settings.stats_ids;
	};
	
	teambuilder.prototype.getTeamInfo = funciton(info_name) {
		switch(info_name)
		{
			case 'team_name':
				return $("#tb-team-name").val();
			break;
			
			case 'team_generation':
				return $("#tb-team-tier-value").val();
			break;
			
			case 'team_generation':
				return $("#tb-team-generation-value").val();
			break;
		}
	};
});