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
		unknown_type_id:18,
		icons_folder:'http://pokemon-online.eu/images/poke_icons/'
	};
	
	// Initialize the teambuilder
	
	var self = this;
	var settings = self.default_settings;
	generation = generation != undefined ? generation : self.default_settings.generation;
	
	// make it so the form doesn't get submitted at all and reloads the page
	$("#team_form").on('submit', function(e) {
		e.preventDefault();
	});
	
	// loading the list of generations
	$("#tb-team-generation-value").reloadCombobox(pokedex.generations.generations, generation, function(e, ui) {
		self.setGeneration($(e.target).val());
	});
	
	// clone the pokemon slot 5 times
	var pokemon_slot = $(".pokemon-slot").clone();
	pokemon_slot.removeClass('active-pokemon-slot');
	var pokemon_slots = '';
	
	for(var i=2;i<=6;i++)
	{
		pokemon_slot.find('.pokemon-slot-gender-radio').each(function() {
			$(this).attr('id', ($(this).attr('id').indexOf('female') != -1 ? 'pokemon-slot-gender-female-' : 'pokemon-slot-gender-male-')+i);
		});
		
		pokemon_slot.find('.pokemon-slot-gender-male-icon, .pokemon-slot-gender-female-icon').each(function() {
			$(this).attr('for', ($(this).attr('for').indexOf('female') != -1 ? 'pokemon-slot-gender-female-' : 'pokemon-slot-gender-male-')+i);
		});
		
		pokemon_slots += pokemon_slot.wrap('<p>').parent().html();
	}
	
	$("#pokemon-parameters").append(pokemon_slots);
	
	// tabs for the teambuilder
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
	
	// managing the active tab of the teambuilder
	$("#pokemon-tabs .pokemon-tab").on('click', function() {
		$('.pokemon-tab').removeClass('active-pokemon-tab').eq($(this).index()).addClass('active-pokemon-tab');
		$('.pokemon-slot').removeClass('active-pokemon-slot').eq($(this).index()).addClass('active-pokemon-slot');
	});
	
	// toggling the icon gear to be able to show informations regarding the team such as the generation or the name of the team
	$("#pokemon-parameters .icon-gear").on('click', function() {
		$("#team-infos").toggle();
	});
	
	// attaching the pokemon id when we select a pokemon
	$(".pokemon-slot-name").autocomplete().on('autocompletefocus', function(e, ui) {
		e.preventDefault();
		$(this).val(ui.item.label).data('pokemon_id', ui.item.value);
	});
	
	// pokemon sprite reset
	$(".pokemon-slot-sprite").on('click', function(e) {
		if(self.getGenerationInfo(self.getTeamInfo('team_generation'), 'shiny'))
		{
			var sprite_name = self.getSpecieId($(this).closest('.pokemon-slot').find('.pokemon-slot-name').data('pokemon_id'))+(self.getFormId($(this).closest('.pokemon-slot').find('.pokemon-slot-name').data('pokemon_id')) != 0 ? '-'+self.getFormId($(this).closest('.pokemon-slot').find('.pokemon-slot-name').data('pokemon_id')) : '');
			$(this).find('.pokemon-slot-shiny').prop('checked', !$(this).find('.pokemon-slot-shiny').prop('checked'));
			$(this).find('img').attr('src', self.getGenerationInfo(self.getTeamInfo('team_generation'), 'sprite_folder')+($(this).find('.pokemon-slot-shiny').prop('checked') ? 'shiny/' : '')+sprite_name+'.png');
		}
	});
	
	// gender of the pokemon
	$(".pokemon-slot-gender-radio").on('change', function() {
		$(this).parent().find(' .pokemon-slot-gender-checked').removeClass('pokemon-slot-gender-checked');
		$("label[for='"+$(this).attr('id')+"']").addClass('pokemon-slot-gender-checked');
	});
	
	// loading stats, ivs and evs
	var stats_block = "", ivs_block ="", evs_block = "";
	var stats_list = self.getGenerationInfo(generation, 'stats_list');
	var ivs_limit = self.getGenerationInfo(generation, 'ivs_limit');
	
	$.each(stats_list, function(stat_id, stat_name) {
		stats_block += '<div class="pokemon-slot-stat-content stat-id-'+stat_id+'"><span class="pokemon-slot-stat-name">'+stat_name+'</span><span class="pokemon-slot-stat-block"><span class="pokemon-slot-stat-progress"></span><span class="pokemon-slot-stat-value">0</span></span></div>';
		ivs_block += '<span class="pokemon-ivs stat-id-'+stat_id+'"><span class="pokemon-ivs-stat-name"><strong>'+(ivs_limit == 15 ? 'DVs' : 'IVs')+'</strong> '+stat_name+'</span><input name="pokemon-slot-ivs-'+stat_id+'" type="text" value="'+ivs_limit+'" class="pokemon-ivs-value" /></span>';
		evs_block += '<span class="pokemon-evs stat-id-'+stat_id+'"><span class="pokemon-evs-stat-name"><strong>EVs</strong> '+stat_name+'</span><input name="pokemon-slot-evs-'+stat_id+'" type="text" value="'+settings.evs+'" class="pokemon-evs-value" /></span>';
	});
	$('.pokemon-slot-stats').html(stats_block);
	$(".pokemon-ivs-selectors").html(ivs_block);
	if(self.getGenerationInfo(generation, 'evs'))
	{
		$(".pokemon-evs-selectors").html(evs_block);
	}
	
	// creating knobs for both IVs and EVs
	
	var knob_event = function(param) {
		
		var element = param.target != undefined ? $(param.target) : this.$;
		var generation = self.getTeamInfo('team_generation');
		var value_type = element.hasClass('pokemon-evs-value') ? 'evs' : 'ivs';
		var stat_id = element.closest('.pokemon-'+value_type).attr('class').match(/stat-id-[0-9]/g).join('').split('-')[2];
		
		if(value_type == 'evs' && (param.type == undefined || param.type != 'keyup'))
		{
			element.val(self.getCorrectEVs(element)).trigger('change');
		}
		
		if(!self.getGenerationInfo(generation, 'special_stat') && self.getGenerationInfo(generation, 'special_stats_same') && self.default_settings.special_stat.replace_ids.indexOf(parseInt(stat_id)) != -1)
		{
			element.closest('.pokemon-slot').find(".pokemon-"+value_type+".stat-id-"+$.grep(self.default_settings.special_stat.replace_ids, function(id) { return id != stat_id; }).join('')+" .pokemon-"+value_type+"-value").val(element.val()).trigger('change');
		}
		self.recalculateStats(element.closest('.pokemon-slot').index('.pokemon-slot'));
	};
	
	var ivs_limit = self.getGenerationInfo(generation, 'ivs_limit');
	
	var knob_params = {
		min:0,
		width:75,
		height:75,
		thickness:.06,
		displayInput:true,
		fgColor:'#1f5d96',
		bgColor:'#f0f0f0',
		font:'inherit',
		inputColor:'#757575',
		'release':knob_event,
		'change':knob_event
	};
		
	var knob_ivs_params = knob_params;
	knob_ivs_params.max = ivs_limit;
	knob_ivs_params.step = 1;
	
	$(".pokemon-ivs-value").knob(knob_ivs_params).on('keyup', knob_event);
	
	
	var knob_evs_params = knob_params;
	knob_evs_params.max = 255;
	knob_evs_params.step = 4;
	
	$(".pokemon-evs-value").knob(knob_evs_params).on('keyup', knob_event);
	
	// initializing the slider for level
	$(".pokemon-level-value").slider({
		min:1,
		max:100,
		create: function( event, ui ) {
			$(this).parent().find('.pokemon-level-display-value').text($(this).slider('value'));
		},
		slide: function( event, ui ) {
			$(this).parent().find('.pokemon-level-display-value').text($(this).slider('value'));
			self.recalculateStats($(this).index('.pokemon-level-value'));
		},
		change: function( event, ui ) {
			$(this).parent().find('.pokemon-level-display-value').text($(this).slider('value'));
		},
		stop: function( event, ui ) {
			$(this).parent().find('.pokemon-level-display-value').text($(this).slider('value'));
		}
	});
	
	// initializing the slider for happiness
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
		},
		stop: function( event, ui ) {
			$(this).parent().find('.pokemon-happiness-display-value').text($(this).slider('value'));
		}
	});
	
	// make the advanced button show/hide the advanced options when clicked
	$(".pokemon-slot-advanced").on('click', function() {
		$(this).parent().parent().find(' .pokemon-slot-advanced-content').toggle();
	});
	
	// loading the list of possible hidden power types
	$('.pokemon-slot-hidden-power-type, .pokemon-hidden-power-ivs-selection').empty();
	var types = self.getGenerationInfo(2, 'types_list'); // gen2 types
	delete types[0]; // remove Normal type from the list of possibilities
	$('.pokemon-slot-hidden-power-type').reloadCombobox(types, 16);
	
	// loading the list of natures and making it recalculate stats on select
	$('.pokemon-slot-nature').reloadCombobox(pokedex.natures.nature, 0, function(e, ui) {
		self.recalculateStats($(e.target).index('.pokemon-slot-nature'));
	});
	
	// separate event for when a pokemon name is selected from the dropdown list
	$(".pokemon-slot-name").on('autocompleteselect', function(e, ui) {
		
		e.preventDefault();
		// We need to reset all the field relative to this pokemon before we start filling them again
		var pokemonId = ui.item.value;
		var slot = $(this).closest('.pokemon-slot');
		var pokemonIndex = slot.index('.pokemon-slot');
		var generation = self.getTeamInfo('team_generation');
		self.resetPokemon(pokemonIndex);
		$(this).val(ui.item.label).data('pokemon_id', pokemonId);
		
		
		// loading the sprite
		var sprite_name = self.getSpecieId(ui.item.value)+(self.getFormId(ui.item.value) != 0 ? '-'+self.getFormId(ui.item.value) : '');
		$("#pokemon-tabs .pokemon-tab:eq("+pokemonIndex+")").html('<img src="'+settings.icons_folder+sprite_name+'.png'+'" alt="" />'+ui.item.label+'</span>');		
		slot.find(".pokemon-slot-sprite table img").attr('src', self.getGenerationInfo(generation, 'sprite_folder')+sprite_name+'.png');
		
		// loading type(s)
		var type1 = (pokedex.pokes.type1[generation][pokemonId] != undefined ? pokedex.pokes.type1[generation][pokemonId] : pokedex.pokes.type1[generation][self.getSpecieId(pokemonId)]), type2 = (pokedex.pokes.type2[generation][pokemonId] != undefined ? pokedex.pokes.type2[generation][pokemonId] : pokedex.pokes.type2[generation][self.getSpecieId(pokemonId)]);
		var types = '<span class="pokemon-slot-type type_'+type1+'">'+pokedex.types.types[type1]+'</span>'+(type2 != settings.unknown_type_id ? '<span class="pokemon-slot-type type_'+type2+'">'+pokedex.types.types[type2]+'</span>' : '');
		slot.find(".pokemon-slot-type-block").html(types);
		
		var gender = slot.find('.pokemon-slot-gender-radio');
		
		// loading possible genders
		if([1, 2, 3].indexOf(pokedex.pokes.gender[pokemonId]) != -1)
		{
			var arr_genders = {
				1:'male',
				2:'female',
				3:settings.gender
			};
			
			gender.filter('.pokemon-slot-gender-radio[value="'+arr_genders[pokedex.pokes.gender[pokemonId]]+'"]').prop('checked', true).trigger('change');
			pokedex.pokes.gender[pokemonId] != 3 ? gender.attr('disabled', 'disabled') : gender.removeAttr('disabled');
			gender.parent().show();
		}
		
		// loading the abilities
		
		if(self.getGenerationInfo(generation, 'ability'))
		{
			var abilities_ids = [(pokedex.pokes.ability1[generation][pokemonId] != undefined ? pokedex.pokes.ability1[generation][pokemonId] : pokedex.pokes.ability1[generation][self.getSpecieId(pokemonId)]), (pokedex.pokes.ability2[generation][pokemonId] != undefined ? pokedex.pokes.ability2[generation][pokemonId] : pokedex.pokes.ability2[generation][self.getSpecieId(pokemonId)]), (pokedex.pokes.ability3[generation] != undefined ? (pokedex.pokes.ability3[generation][pokemonId] != undefined ? pokedex.pokes.ability3[generation][pokemonId] : pokedex.pokes.ability3[generation][self.getSpecieId(pokemonId)]) : undefined)];
			var abilities = {};
			
			$.each(abilities_ids, function(index, ability_id) {
				if(ability_id != undefined && ability_id != 0)
				{
					abilities[ability_id] = pokedex.abilities.abilities[ability_id];
				}
			});
			abilities = !$.isEmptyObject(abilities) ? abilities : {0:pokedex.abilities.abilities[0]};
			slot.find(".pokemon-slot-ability").reloadCombobox(abilities, $.getFirstPropertyIndex(abilities));
		}		
		// loading moves
		var moves_container = $('<table class="moves-list"></table>'), move_type_id, move_damage_class_id;
		var moves_block = "";
		var learnset = pokedex.pokes.all_moves[generation][pokemonId] != undefined ? pokedex.pokes.all_moves[generation][pokemonId] : pokedex.pokes.all_moves[generation][self.getSpecieId(pokemonId)];
		learnset = learnset != undefined ? learnset: {};
		
		$.each(learnset, function(index, move_id) {
			move_type_id = pokedex.moves.type[generation][move_id] != undefined ? pokedex.moves.type[generation][move_id] : 0;
			move_damage_class_id = pokedex.moves.damage_class[generation][move_id] != undefined ? pokedex.moves.damage_class[generation][move_id] : 0;
			moves_block += '<tr class="move-infos"><td class="move-type"><span class="pokemon-slot-type-block"><span class="pokemon-slot-type type_'+move_type_id+'">'+pokedex.types.types[move_type_id]+'</span></span></td><td class="move-category"><span class="pokemon-slot-type-block"><span class="pokemon-slot-type damage_class_'+move_damage_class_id+'">'+pokedex.categories.categories[move_damage_class_id]+'</span></span></td><td class="move-name">'+pokedex.moves.moves[move_id]+'</td><td class="move-pp"><strong>'+pokedex.moves.pp[generation][move_id]+'</strong> <em>PP</em></td><td class="move-bp"><strong>'+(pokedex.moves.power[generation][move_id] != undefined ? (pokedex.moves.power[generation][move_id] != 1 ? pokedex.moves.power[generation][move_id] : '??') : '--')+'</strong> <em>Power</em></td><td class="move-accuracy"><strong>'+(pokedex.moves.accuracy[generation][move_id] != 101 ? pokedex.moves.accuracy[generation][move_id]+'%' : '--')+'</strong> <em>Accuracy</em></td></tr>';
		});
		
		moves_block = $(moves_block);
		if(!self.getGenerationInfo(generation, 'damage_classes_move_specific'))
		{
			moves_block.find('.move-category').hide();
		}
		moves_container.html(moves_block);
		
		slot.find(".moves-list-container").html(moves_container).find('.moves-list tr').off('click').on('click', function() {
			var move_name = $(this).find('.move-name').text();
			var moves = slot.find('.pokemon-move-selection');
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
		self.recalculateStats(pokemonIndex);
	});
	
	// SAVING THE TEAM
	$("#save_team").on('click', function(e) {
		e.preventDefault();
		this.saveTeam();
	});
	
	// setting the generation of the team
	this.setGeneration(generation);
}
	
teambuilder.prototype.setGeneration = function(generation) {
	
	var self = this;
	var settings = self.default_settings;
	
	// loading the list of pokemon
	$(".pokemon-slot-name").autocomplete('option', 'source', $.map(pokedex.pokes.released[generation], function(name, id) { if(name) { return {'label':pokedex.pokes.pokemons[id], 'value':id}; } else { return false; } }));
	
	// settings stats, ivs and evs
	var ivs_limit = self.getGenerationInfo(generation, 'ivs_limit');
	var special_stat_second_id = $.grep(settings.special_stat.replace_ids, function(id) { return id != settings.special_stat.id; }).join('');
	
	if(self.getGenerationInfo(generation, 'special_stat'))
	{
		$(".pokemon-slot-stat-content.stat-id-"+settings.special_stat.id+" .pokemon-slot-stat-name").html(settings.special_stat.name);
		$(".pokemon-ivs.stat-id-"+settings.special_stat.id+" .pokemon-ivs-stat-name").html('<strong>'+(ivs_limit == 15 ? 'DVs' : 'IVs')+'</strong> '+settings.special_stat.name+'</span>');
		$(".pokemon-evs.stat-id-"+settings.special_stat.id+" .pokemon-evs-stat-name").html('<strong>EVs</strong> '+settings.special_stat.name+'</span>');
		$(".pokemon-slot-stat-content.stat-id-"+special_stat_second_id+", .pokemon-ivs.stat-id-"+special_stat_second_id+", .pokemon-evs.stat-id-"+special_stat_second_id).hide();
	}
	else
	{
		$(".pokemon-slot-stat-content.stat-id-"+special_stat_second_id+", .pokemon-ivs.stat-id-"+special_stat_second_id+", .pokemon-evs.stat-id-"+special_stat_second_id).show();
	}
	$(".pokemon-ivs-value").val(ivs_limit);
	$(".pokemon-ivs-stat-name strong").html(ivs_limit == 15 ? 'DVs' : 'EVs');
	$(".pokemon-ivs, .pokemon-evs").css('width', (100/($(".pokemon-ivs").filter(function(){ return $(this).css('display') != 'none';}).length/$(".pokemon-slot").length))+'%');
	
	// loading the list of items
	if(self.getGenerationInfo(generation, 'item'))
	{
		var items = self.getGenerationInfo(generation, 'items_list');
		$('.pokemon-slot-item').reloadCombobox(items, $.getFirstPropertyIndex(items));
	}
	
	// editing the settings for knobs
	$(".pokemon-ivs-value").trigger('configure', { "max":ivs_limit });
	$(".pokemon-ivs-value").val(ivs_limit).trigger('change');
	$(".pokemon-evs-value").val(0).trigger('change');
	
	// hiding elements that aren't present in this generation and displaying the ones that are so
	var selectors = [], hidden_selectors = [];
	$.each({ gender:'.pokemon-slot-gender-selection', happiness:'.pokemon-happiness', hidden_power:'.pokemon-slot-hidden-power-container', ability:'.pokemon-slot-ability-container', nature:'.pokemon-slot-nature-container', item:'.pokemon-slot-item-container', evs:'.pokemon-evs-selectors' }, function(index, selector) {
		selectors.push(selector);
		if(self.getGenerationInfo(generation, index) == false)
		{
			hidden_selectors.push(selector);
		}
		
	});
	$(selectors.join(', ')).show().filter(hidden_selectors.join(', ')).hide();
	
	// we reset all the informations in the teambuilder
	this.resetTeamBuilder();
};
	
teambuilder.prototype.resetTeamBuilder = function() {
	
	var self = this;
	$("#tb-team-name, #tb-team-tier").val('');
	
	// making the first tab the one that is active
	$('.pokemon-tab').removeClass('active-pokemon-tab').eq(0).addClass('active-pokemon-tab');
	$('.pokemon-slot').removeClass('active-pokemon-slot').eq(0).addClass('active-pokemon-slot');
	
	// reseting all 6 pokemon
	self.resetPokemon([0, 1, 2, 3, 4, 5]);
};

teambuilder.prototype.resetPokemon = function(pokemonIndex) {
	
	var self = this;
	var generation = self.getTeamInfo('team_generation');
	var settings = self.default_settings;
	var slot_selectors = [], tab_selectors = [];
	pokemonIndex = $.isArray(pokemonIndex) ? pokemonIndex : [pokemonIndex];
	$.each(pokemonIndex, function(index, value) { slot_selectors.push(".pokemon-slot:eq("+value+")");tab_selectors.push(".pokemon-tab:eq("+value+")"); });
	var slot = $(slot_selectors.join(', '));
	var tab = $(tab_selectors.join(', '));
	
	// pokemon icons reset (in tabs)
	var missingno_icon = '<img src="'+settings.missingno.icon+'" alt="" />Missingno';
	tab.html(missingno_icon);
	
	// pokemon sprite reset
	slot.find(".pokemon-slot-sprite table img").attr('src', settings.missingno.sprite);
	slot.find('.pokemon-slot-shiny').prop('checked', false);
	
	// pokemon name
	slot.find(".pokemon-slot-name").val('Missingno').data('pokemon_id', 0);
	
	// types
	slot.find('.pokemon-slot-type-block').html('<span class="pokemon-slot-type type_'+settings.unknown_type_id+'">'+pokedex.types.types[settings.unknown_type_id]+'</span>');
		
	// gender
	slot.find(".pokemon-slot-gender-selection .pokemon-slot-gender-radio[value='"+settings.gender+"']").prop('checked', true).trigger('change').parent().hide();
	
	// pokemon nickname
	slot.find(".pokemon-slot-nickname").val('');
		
	// hide advanced options
	slot.find(".pokemon-slot-advanced-content").hide();
	
	// setting level to default
	slot.find(".pokemon-level-value").slider('value', settings.level);
	
	// setting happiness to default
	slot.find(".pokemon-happiness-value").slider('value', settings.happiness);
	
	// reset IVs
	slot.find(".pokemon-ivs-value").val(self.getGenerationInfo(generation, 'ivs_limit')).trigger('change');
	
	// reset EVs
	slot.find(".pokemon-evs-value").val(0).trigger('change');
	
	// hidden power reset
	slot.find('.pokemon-slot-hidden-power-type').val(16).combobox('refresh');
	
	// emptying the ability selection
	slot.find('.pokemon-slot-ability').reloadCombobox({0:pokedex.abilities.abilities[0]}, 0);
	
	// reset nature
	slot.find('.pokemon-slot-nature').val(0).combobox('refresh');
	
	// reset item
	slot.find('.pokemon-slot-item').val($(".pokemon-slot-item option:first").val()).combobox('refresh');
	
	// resetting the moves list
	slot.find('.moves-list-container').empty();
	
	// emptying move selection inputs
	slot.find('.pokemon-move-selection').val('');
	
	// We recalculate the stats of the pokemon with the new default infos
	$.each(pokemonIndex, function(index, value) { self.recalculateStats(value); });
};

teambuilder.prototype.recalculateStats = function(pokemonIndex) {
	
	var self = this;
	var slot = $(".pokemon-slot").eq(pokemonIndex);
	var stat, max_stat, stat_progress_class_id, stat_ivs, stat_evs, base_stat, nature, stat_percentage;
	var generation = self.getTeamInfo('team_generation');
	var level = parseInt(slot.find(".pokemon-level-value").slider('value'));
	var baseStats = pokedex.pokes.stats[slot.find(".pokemon-slot-name").data('pokemon_id')] != undefined ? pokedex.pokes.stats[slot.find(".pokemon-slot-name").data('pokemon_id')] : pokedex.pokes.stats[self.getSpecieId(slot.find(".pokemon-slot-name").data('pokemon_id'))];
	var stats_list = self.getGenerationInfo(self.getTeamInfo('team_generation'), 'stats_list');
	
	$.each(stats_list, function(stat_id, stat_name) {
		
		stat_ivs = parseInt(slot.find(".pokemon-ivs.stat-id-"+stat_id+" .pokemon-ivs-value").val());
		stat_evs = parseInt(slot.find(".pokemon-evs.stat-id-"+stat_id+" .pokemon-evs-value").val());
		nature = self.getNatureEffect(slot.find(".pokemon-slot-nature").val(), stat_id);
		base_stat = parseInt(baseStats[stat_id]);
		
		stat = self.calculateStat({
			'stat_id':stat_id,
			'generation':generation,
			'base_stat':base_stat,
			'level':level,
			'nature':nature,
			'stat_ivs':stat_ivs,
			'stat_evs':stat_evs
		});
		
		slot.find(".pokemon-slot-stat-content.stat-id-"+stat_id+" .pokemon-slot-stat-value").text(stat);
		
		min_stat = self.calculateStat({
			'stat_id':stat_id,
			'generation':generation,
			'base_stat':base_stat,
			'level':level,
			'nature':0.9,
			'stat_ivs':0,
			'stat_evs':0
		});
		
		max_stat = self.calculateStat({
			'stat_id':stat_id,
			'generation':generation,
			'base_stat':base_stat,
			'level':level,
			'nature':1.1,
			'stat_ivs':self.getGenerationInfo(generation, 'ivs_limit'),
			'stat_evs':255
		});
		
		stat_percentage = Math.floor(((stat-min_stat)/(max_stat-min_stat))*100);
		stat_progress_class_id = Math.ceil(stat_percentage/25);
		slot.find(".pokemon-slot-stat-content.stat-id-"+stat_id+" .pokemon-slot-stat-progress").css('width', stat_percentage+'%').removeClass('pokemon-slot-stat-progress-1x pokemon-slot-stat-progress-2x pokemon-slot-stat-progress-3x pokemon-slot-stat-progress-4x').addClass('pokemon-slot-stat-progress-'+stat_progress_class_id+'x');
		
	});
	
};

teambuilder.prototype.calculateStat = function(infos) {
	
	if(infos.stat_id == this.default_settings.hp_id)
	{
		if(infos.generation > 2)
		{
			return Math.floor(Math.floor((infos.stat_ivs + (2 * infos.base_stat) + Math.floor(infos.stat_evs/4) + 100) * infos.level)/100) + 10;
		}
		else
		{
			return Math.floor(((infos.stat_ivs + infos.base_stat + Math.sqrt(65535)/8 + 50) * infos.level)/50 + 10);
		}
	}
	else
	{
		if(infos.generation > 2)
		{
			return Math.floor(Math.floor(((infos.stat_ivs + (2 * infos.base_stat) + Math.floor(infos.stat_evs/4)) * infos.level)/100 + 5)*infos.nature);
		}
		else
		{
			return Math.floor(Math.floor((infos.stat_ivs + infos.base_stat + Math.sqrt(65535)/8) * infos.level)/50 + 5);
		}
	}
	
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
		case 'special_stats_same': case 'damage_classes_move_specific': case 'gender': case 'shiny': case 'special_stat': case 'happiness': case 'ivs_limit': case 'hidden_power': case 'ability': case 'nature': case 'item': case 'evs': case 'types_ids': case 'sprite_folder':
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
			var stats = {}, self = this;
			
			$.each(this.default_settings.stats_ids, function(stat_id) {
				stats[stat_id] = pokedex.status.stats[stat_id];
			});
			
			return stats;
		break;
		
		case 'types_list':
			return this.TeamInfoIdsToPairs(info_name, this.getGenerationInfo(generation, 'types_ids'));
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

teambuilder.prototype.saveTeam = function() {
	alert(JSON.stringify($("#team_form").serializeArray()));
};

teambuilder.prototype.getSpecieId = function(pokemonId) {
	return pokemonId & ((1 << 16) - 1);
};

teambuilder.prototype.getFormId = function(pokemonId) {
	return Math.floor(pokemonId / 65536);
};

teambuilder.prototype.getNatureEffect = function(nature_id, stat_id) {
	var arr = {0:0, 1:1, 2:2, 3:4, 4:5, 5:3};
	return (10+(-(nature_id%5 == arr[stat_id]-1) + (Math.floor(nature_id/5) == arr[stat_id]-1)))/10;
};

teambuilder.prototype.getCorrectEVs = function(evs_element) {
	
	var total_evs = 0;
	evs_element.closest('.pokemon-evs-selectors').find('.pokemon-evs-value').each(function() {
		total_evs += parseInt($(this).val());
	});
	
	if(total_evs > 510)
	{
		var remaining_evs = 510 - (total_evs - evs_element.val());
		return remaining_evs - (remaining_evs%4);
	}
	else
	{
		return evs_element.val();
	}
};