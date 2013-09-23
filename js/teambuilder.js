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
		// now clearing pokemon specific infos
		// no need to use "this" since clearing all pokemon
		$(".pokemon-slot").each(function(index) {
			// avatar
			$(".pokemon-slot-sprite img", this).attr('src', this.default_settings.missingno_sprite);
			// pokemon name
			$(".pokemon-slot-name", this).val();
			// types
			$('.pokemon-slot-type-block', this).empty();
			$('<span></span>').addClass('pokemon-slot-type, type_'+this.default_settings.unknown_type_id).text(pokedex.types.types[this.default_settings.unknown_type_id]).appendTo('pokemon-slot-type-block');
			// gender
			$(".pokemon-slot-gender-radio", this).attr('checkec', '');
			// pokemon nickname
			$(".pokemon-slot-nickname").val();
		});
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