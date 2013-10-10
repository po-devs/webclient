// teambuilder class
	
function teambuilder(generation) {
	
	this.default_settings = {
		generation:5,
		gender:'male', // if the pokemon is not genderless
		level:100,
		happiness:255,
		evs:0,
		stats_ids:[0, 1, 2, 3, 4, 5],
		hp_id:0, // to exclude it from the EVs
		special_stat:{ id:3, name:'Special', replace_ids:[3, 4]},
		missingno:{icon:'http://pokemon-online.eu/images/poke_icons/0.png', sprite:'http://pokemon-online.eu/images/pokemon/black-white/0.png'},
		unknown_type_id:18
	};
	this.setGeneration(generation != undefined ? generation : this.default_settings.generation);
}
	
teambuilder.prototype.setGeneration = function(generation) {
	if(this.getTeamInfo('team_generation') != generation)
	{
		var that = this;
		// changing the selected generation on the dropdown list
		$("#tb-team-generation-value").reloadCombobox(pokedex.generations.generations, generation).off('change').on('change', function() {
			that.resetTeambuilder();
		});
		
		// we reset all the informations on the teambuilder
		this.resetTeamBuilder();
	}
};
	
teambuilder.prototype.resetTeamBuilder = function() {
	
	var that = this;
	$("#tb-team-name, #tb-team-tier").val('');
	
	// making the first tab the one that is active
	$('.pokemon-tab').removeClass('active-pokemon-tab').eq(0).addClass('active-pokemon-tab');
	$('.pokemon-slot').removeClass('active-pokemon-slot').eq(0).addClass('active-pokemon-slot');
	
	// now clearing pokemon specific infos
	
	// pokemon icons reset (in tabs)
	$('.pokemon-tab').text('Missingno').prepend($('<img>').attr('src', this.default_settings.missingno.icon));
	
	// pokemon sprite reset
	$(".pokemon-slot-sprite img").attr('src', this.default_settings.missingno.sprite);
	
	// reset pokemon shiny event and checkbox
	if(this.getGenerationInfo(this.getTeamInfo('team_generation'), 'shiny') == false)
	{
		$(".pokemon-slot-sprite img").off();
	}
	$('.pokemon-slot-shiny').prop('checked', false);
	
	// pokemon name
	$(".pokemon-slot-name").destroyAutocomplete().val('Missingno').data('pokemon_id', 0).autocomplete({ source:$.map(pokedex.pokes.released[this.getTeamInfo('team_generation')], function(name, id) { return {label:name, value:id}; })}).on('autocompleteselect autocompletefocus', function(e, ui) {
		
		e.preventDefault();
		$(this).val(ui.item.label).data('pokemon_id', ui.item.value);
		var pokemonIndex = $(this).index('.pokemon-slot-name');
		// that.resetTeambuilderPokemon(pokemondIndex);
		//that.recalculateStats(pokemonIndex); is gonna be inside resetTeambuilderPokemon(pokemonIndex)
		
		// loading the sprite
		$(".pokemon-slot-sprite img").attr('src', that.getGenerationInfo(that.getTeamInfo('team_generation'), 'sprite_folder')+ui.item.value+'.png');
		
	});
	
	// types
	$('.pokemon-slot-type-block').empty();
	$('<span></span>').addClass('pokemon-slot-type type_'+this.default_settings.unknown_type_id).text(pokedex.types.types[this.default_settings.unknown_type_id]).appendTo('.pokemon-slot-type-block');
	
	// gender
	$(".pokemon-slot-gender-selection .pokemon-slot-gender-radio[value='"+this.default_settings.gender+"']").prop('checked', true).trigger('change').parent().css('visibility', 'hidden');
	
	// pokemon nickname
	$(".pokemon-slot-nickname").val();
	
	// pokemon stats
	$(".pokemon-slot-stats").empty();
	$.each(this.getGenerationInfo(this.getTeamInfo('team_generation'), 'stats_list'), function(stat_id, stat_name) {
		
		$(".pokemon-slot-stats").append($('<div class="pokemon-slot-stat-content stat-id-'+stat_id+'"><span class="pokemon-slot-stat-name">'+stat_name+'</span><span class="pokemon-slot-stat-block"><span style="width:0%;" class="pokemon-slot-stat-progress"></span><span class="pokemon-slot-stat-value">0</span></span></div>'));
		
	});
	
	// hide advanced options
	$(".pokemon-slot-advanced-content").hide();
	
	// setting level to default
	$(".pokemon-level-value").slider('value', this.default_settings.level);
	
	// setting happiness to default
	$(".pokemon-happiness-value").slider('value', this.default_settings.happiness);
	
	// recreating IVs inputs
	$(".pokemon-ivs-selectors").empty();
	$.each(this.getGenerationInfo(this.getTeamInfo('team_generation'), 'stats_list'), function(stat_id, stat_name) {
		
		$(".pokemon-ivs-selectors").append($('<span class="pokemon-ivs stat-id-'+stat_id+'"><span class="pokemon-ivs-stat-name"><strong>'+(that.getGenerationInfo(that.getTeamInfo('team_generation'), 'ivs_limit') == 15 ? 'DVs' : 'IVs')+'</strong> '+stat_name+'</span><input name="pokemon-slot-ivs-'+stat_id+'" type="text" value="'+that.getGenerationInfo(that.getTeamInfo('team_generation'), 'ivs_limit')+'" class="pokemon-ivs-value" /></span>'));
		
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
		bgColor:'#f0f0f0',
		font:'inherit',
		inputColor:'#757575'
	});
	
	// hidden power reset
	$('.pokemon-slot-hidden-power-type, .pokemon-hidden-power-ivs-selection').empty();
	$('.pokemon-slot-hidden-power-type').reloadCombobox(this.getGenerationInfo(this.getTeamInfo('team_generation'), 'types_list'), 0);
	
	// emptying the ability selection
	$('.pokemon-slot-ability').reloadCombobox({0:'Ability'}, 0);
	
	// reset nature
	$('.pokemon-slot-nature').reloadCombobox(pokedex.natures.nature, 0);
	
	// refreshing items list
	$('.pokemon-slot-item').destroyCombobox().fillSelect(this.getGenerationInfo(this.getTeamInfo('team_generation'), 'items_list')).combobox();
	
	// recreating EVs inputs
	$(".pokemon-evs-selectors").empty();
	if(this.getGenerationInfo(this.getTeamInfo('team_generation'), 'evs'))
	{
		$.each(this.getGenerationInfo(this.getTeamInfo('team_generation'), 'stats_list'), function(stat_id, stat_name) {
			
			if(stat_id != that.default_settings.hp_id)
			{
				$(".pokemon-evs-selectors").append($('<span class="pokemon-evs stat-id-'+stat_id+'"><span class="pokemon-evs-stat-name"><strong>EVs</strong> '+stat_name+'</span><input name="pokemon-slot-evs-'+stat_id+'" type="text" value="'+that.default_settings.evs+'" class="pokemon-evs-value" /></span>'));
			}
			
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
			bgColor:'#f0f0f0',
			font:'inherit',
			inputColor:'#757575'
		});
	}
	
	// resetting the moves list
	$('.moves-list-container').empty();
	
	// emptying move selection inputs
	$('.pokemon-move-selection').val('');
	
	// hiding elements that aren't present in this generation and displaying the ones that are so
	var selectors = $(), hidden_selectors = $();
	$.each({ gender:'.pokemon-slot-gender-selection', happiness:'.pokemon-happiness', hidden_power:'.pokemon-slot-hidden-power-type', ability:'.pokemon-slot-ability', nature:'.pokemon-slot-nature', item:'.pokemon-slot-item', evs:'.pokemon-evs-selectors' }, function(index, selector) {
		
		selectors.add(selector);
		if(that.getGenerationInfo(that.getTeamInfo('team_generation'), index) == false)
		{
			hidden_selectors.add(selector);
		}
		
	});
	selectors.show().filter(hidden_selectors).hide();
};

teambuilder.prototype.recalculateStats = function(pokemonIndex) {
	
	var that = this, stat;
	var baseStats = pokedex.pokes.stats[$(".pokemon-slot-name").eq(pokemonIndex).data('pokemon_id')] != undefined ? pokedex.pokes.stats[$(".pokemon-slot-name").eq(pokemonIndex).data('pokemon_id')] : pokedex.pokes.stats[that.getSpecieId($(".pokemon-slot-name").eq(pokemonIndex).data('pokemon_id'))];
	
	$.each(this.getGenerationInfo(this.getTeamInfo('team_generation'), 'stats_list'), function(stat_id, stat_name) {
		
		if(stat_id == that.default_settings.hp_id)
		{
			if(this.getTeamInfo('team_generation') > 2)
			{
				stat = (($(".pokemon-ivs-value").eq(pokemonIndex).val() + (2 * baseStats[stat_id]) + $(".pokemon-evs-value").eq(pokemonIndex).val()/4 + 100) * $(".pokemon-level-value").eq(pokemonIndex).slider('value'))/100 + 10;
			}
			else
			{
				stat = (($(".pokemon-ivs-value").eq(pokemonIndex).val() + baseStats[stat_id] + 63 + 50) * $(".pokemon-level-value").eq(pokemonIndex).slider('value'))/50 + 10;
			}
		}
		else
		{
			if(this.getTeamInfo('team_generation') > 2)
			{
				stat = ((($(".pokemon-ivs-value").eq(pokemonIndex).val() + (2 * baseStats[stat_id]) + $(".pokemon-evs-value").eq(pokemonIndex).val()/4) * $(".pokemon-level-value").eq(pokemonIndex).slider('value'))/100 + 5)*nature;
			}
			else
			{
				stat = (($(".pokemon-ivs-value").eq(pokemonIndex).val() + baseStats[stat_id] + 63) * $(".pokemon-level-value").eq(pokemonIndex).slider('value'))/50 + 5;
			}
		}
		$(".pokemon-slot-stat-content .stat-id-"+stat_id+" .pokemon-slot-stat-value").eq(pokemonIndex).text(stat);
		
	});
	
};

teambuilder.prototype.getTeamInfo = function(info_name) {

	switch(info_name)
	{
		case 'team_name':
			return $("#tb-team-name").val();
		break;
		
		case 'team_tier':
			return $("#tb-team-tier-value").val();
		break;
		
		case 'team_generation':
			return $("#tb-team-generation-value").val();
		break;
	}
	
};

teambuilder.prototype.getGenerationInfo = function(generation, info_name) {
	switch(info_name)
	{
		case 'gender': case 'shiny': case 'special_stat': case 'happiness': case 'ivs_limit': case 'hidden_power': case 'ability': case 'nature': case 'item': case 'evs': case 'types_ids': case 'sprite_folder':
			return pokedex.generations.options[generation][info_name];
		break;
		
		case 'items_list':
			
			var items = {}, berries = {};
			$.each(pokedex.items.released_items[generation], function(key, value) {
				items[key] = pokedex.items.items[key];
			});
			$.each(pokedex.items.released_berries[generation], function(key, value) {
				berries[key] = pokedex.items.berries[key];
			});
			
			return $.extend({}, items, $.updateObjectKeys(berries, 10000));
			
		break;
		
		case 'stats_list':
			var stats = {}, that = this;
			$.each(this.default_settings.stats_ids, function(stat_id, stat_name) {
			
				if(that.getGenerationInfo(that.getTeamInfo('team_generation'), 'special_stat') == false || that.default_settings.special_stat.replace_ids.indexOf(stat_id) == -1)
				{
					stats[stat_id] = pokedex.status.stats[stat_id];
				}
				else if(that.getGenerationInfo(that.getTeamInfo('team_generation'), 'special_stat') == true && that.default_settings.special_stat.id == stat_id)
				{
					stats[stat_id] = that.default_settings.special_stat.name;
				}
				
			});
			return stats;
		break;
		
		case 'types_list':
			return this.TeamInfoIdsToPairs(info_name, this.getGenerationInfo(this.getTeamInfo('team_generation'), 'types_ids'));
		break;
	}
};

teambuilder.prototype.TeamInfoIdsToPairs = function(info_name, values) {
	switch(info_name)
	{
		case 'types_list':
			var pairs = {};
			$.each(values, function(index, type_id) {
				pairs[type_id] = pokedex.types.types[type_id];
			});
			return pairs;
		break;
	}
};

teambuilder.prototype.getTeamInfos = function() {
	
};

teambuilder.prototype.getTeamPokemonInfos = function(position) {
	
};

teambuilder.prototype.getLoadedTeam = function() {
	
};

teambuilder.prototype.loadTeam = function(json_team) {
	
};

teambuilder.prototype.getSpecieId = function(pokemonId) {
	return pokemonId & ((1 << 16) - 1);
};