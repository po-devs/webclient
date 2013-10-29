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
	
	// make it so the form doesn't get submitted at all and reloads the page
	$("#team_form").on('submit', function(e) {
		e.preventDefault();
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
	
	// pokemon sprite reset
	$(".pokemon-slot-sprite table img").on('click', function(e) {
		if(self.getGenerationInfo(self.getTeamInfo('team_generation'), 'shiny'))
		{
			var sprite_name = self.getSpecieId($(this).closest('.pokemon-slot').find('.pokemon-slot-name').data('pokemon_id'))+(self.getFormId($(this).closest('.pokemon-slot').find('.pokemon-slot-name').data('pokemon_id')) != 0 ? '-'+self.getFormId($(this).closest('.pokemon-slot').find('.pokemon-slot-name').data('pokemon_id')) : '');
			$(this).parent().find('.pokemon-slot-shiny').prop('checked', !$(this).parent().find('.pokemon-slot-shiny').prop('checked'));
			$(this).attr('src', self.getGenerationInfo(self.getTeamInfo('team_generation'), 'sprite_folder')+($(this).parent().find('.pokemon-slot-shiny').prop('checked') ? 'shiny/' : '')+sprite_name+'.png');
		}
	});
	
	// gender of the pokemon
	$(".pokemon-slot-gender-radio").on('change', function() {
		$(this).parent().find(' .pokemon-slot-gender-checked').removeClass('pokemon-slot-gender-checked');
		$("label[for='"+$(this).attr('id')+"']").addClass('pokemon-slot-gender-checked');
	});
	
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
		}
	});
	
	// make the advanced button show/hide the advanced options when clicked
	$(".pokemon-slot-advanced").on('click', function() {
		$(this).parent().parent().find(' .pokemon-slot-advanced-content').toggle();
	});
	
	// loading the list of natures and making it recalculate stats on select
	$('.pokemon-slot-nature').reloadCombobox(pokedex.natures.nature, 0, function(e, ui) {
		self.recalculateStats($(e.target).index('.pokemon-slot-nature'));
	});
	
	// SAVING THE TEAM
	$("#save_team").on('click', function(e) {
		e.preventDefault();
		this.saveTeam();
	});
	
	// setting the generation of the team
	this.setGeneration(generation != undefined ? generation : this.default_settings.generation);
}
	
teambuilder.prototype.setGeneration = function(generation) {
	if(this.getTeamInfo('team_generation') != generation)
	{
		var self = this;
		var settings = self.default_settings;
		
		// changing the selected generation on the dropdown list
		$("#tb-team-generation-value").reloadCombobox(pokedex.generations.generations, generation).off('change').on('change', function() {
			self.resetTeambuilder();
		});
		
		// loading the list of pokemon
		$(".pokemon-slot-name").autocomplete({ source:$.map(pokedex.pokes.released[generation], function(name, id) { return {label:name, value:id}; })}).on('autocompletefocus', function(e, ui) {
			e.preventDefault();
			$(this).val(ui.item.label).data('pokemon_id', ui.item.value);
		});
		
		// loading stats
		var stats_block = ""
		$.each(self.getGenerationInfo(generation, 'stats_list'), function(stat_id, stat_name) {
			stats_block += '<div class="pokemon-slot-stat-content stat-id-'+stat_id+'"><span class="pokemon-slot-stat-name">'+stat_name+'</span><span class="pokemon-slot-stat-block"><span class="pokemon-slot-stat-progress"></span><span class="pokemon-slot-stat-value">0</span></span></div>';
		});
		$('.pokemon-slot-stats').html($(stats_block));
		
		// loading the list of possible hidden power types
		$('.pokemon-slot-hidden-power-type, .pokemon-hidden-power-ivs-selection').empty();
		var types = self.getGenerationInfo(generation, 'types_list');
		delete types[0]; // remove Normal type from the list of possibilities
		$('.pokemon-slot-hidden-power-type').reloadCombobox(types, 16);
		
		// loading the list of items
		var items = self.getGenerationInfo(generation, 'items_list');
		//alert($.getFirstPropertyIndex(items));
		$('.pokemon-slot-item').reloadCombobox(items, $.getFirstPropertyIndex(items));
		
		// recreating IVs inputs
		$(".pokemon-ivs-selectors").empty();
		var ivs_limit = self.getGenerationInfo(generation, 'ivs_limit');
		var ivs_block = "";
		
		$.each(self.getGenerationInfo(generation, 'stats_list'), function(stat_id, stat_name) {
			ivs_block += '<span class="pokemon-ivs stat-id-'+stat_id+'"><span class="pokemon-ivs-stat-name"><strong>'+(ivs_limit == 15 ? 'DVs' : 'IVs')+'</strong> '+stat_name+'</span><input name="pokemon-slot-ivs-'+stat_id+'" type="text" value="'+ivs_limit+'" class="pokemon-ivs-value" /></span>';
		});
		$(".pokemon-ivs-selectors").append($(ivs_block));
		
		// recreating EVs inputs
		$(".pokemon-evs-selectors").empty();
		if(self.getGenerationInfo(generation, 'evs'))
		{
			var evs_block = "";
			$.each(self.getGenerationInfo(generation, 'stats_list'), function(stat_id, stat_name) {
				evs_block += '<span class="pokemon-evs stat-id-'+stat_id+'"><span class="pokemon-evs-stat-name"><strong>EVs</strong> '+stat_name+'</span><input name="pokemon-slot-evs-'+stat_id+'" type="text" value="'+settings.evs+'" class="pokemon-evs-value" /></span>';
			});
			$(".pokemon-evs-selectors").append($(evs_block));
		}
		
		// creating the knobs for both IVs and EVs
		
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
			'release':function(v) {
				if(this.$.hasClass('pokemon-evs-value'))
				{
					this.$.val(self.getCorrectEVs(this.$)).trigger('change');
				}
				self.recalculateStats(this.$.closest('.pokemon-slot').index('.pokemon-slot'));
			}
		};
		
		var knob_ivs_params = knob_params;
		knob_ivs_params.max = ivs_limit;
		knob_ivs_params.step = 1;
		
		$(".pokemon-ivs-value").each(function() {
			$(this).knob(knob_ivs_params).on('keyup', function(e) {
				self.recalculateStats($(this).closest('.pokemon-slot').index('.pokemon-slot'));
			});
		});
		
		var knob_evs_params = knob_params;
		knob_evs_params.max = 255;
		knob_evs_params.step = 4;
		
		$(".pokemon-evs-value").each(function() {
			$(this).knob(knob_evs_params).on('keyup', function(e) {
				$(e.target).val(self.getCorrectEVs($(e.target)));
				self.recalculateStats($(this).closest('.pokemon-slot').index('.pokemon-slot'));
			});
		});
		
		// separate event for when a pokemon name is selected from the dropdown list
		$(".pokemon-slot-name").on('autocompleteselect', function(e, ui) {
			
			e.preventDefault();
			// We need to reset all the field relative to this pokemon before we start filling them again
			var pokemonId = ui.item.value;
			var slot = $(this).closest('.pokemon-slot');
			var pokemonIndex = slot.index('.pokemon-slot');
			self.resetPokemon(pokemonIndex);
			$(this).val(ui.item.label).data('pokemon_id', pokemonId);
			
			
			// loading the sprite
			var sprite_name = self.getSpecieId(ui.item.value)+(self.getFormId(ui.item.value) != 0 ? '-'+self.getFormId(ui.item.value) : '');
			$("#pokemon-tabs .pokemon-tab:eq("+pokemonIndex+")").empty().append($('<img src="'+settings.icons_folder+sprite_name+'.png'+'" alt="" />'+ui.item.label+'</span>'));		
			slot.find(".pokemon-slot-sprite table img").attr('src', self.getGenerationInfo(generation, 'sprite_folder')+sprite_name+'.png');
						
			// loading type(s)
			var type1 = (pokedex.pokes.type1[generation][pokemonId] != undefined ? pokedex.pokes.type1[generation][pokemonId] : pokedex.pokes.type1[generation][self.getSpecieId(pokemonId)]), type2 = (pokedex.pokes.type2[generation][pokemonId] != undefined ? pokedex.pokes.type2[generation][pokemonId] : pokedex.pokes.type2[generation][self.getSpecieId(pokemonId)]);
			
			slot.find(".pokemon-slot-type-block").empty().append($('<span class="pokemon-slot-type type_'+type1+'">'+pokedex.types.types[type1]+'</span>')).append((type2 != settings.unknown_type_id ? $('<span class="pokemon-slot-type type_'+type2+'">'+pokedex.types.types[type2]+'</span>') : $('')));
			
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
				gender.parent().css('visibility', 'visible');
			}
			
			// loading the abilities
			var abilities_ids = [(pokedex.pokes.ability1[generation][pokemonId] != undefined ? pokedex.pokes.ability1[generation][pokemonId] : pokedex.pokes.ability1[generation][self.getSpecieId(pokemonId)]), (pokedex.pokes.ability2[generation][pokemonId] != undefined ? pokedex.pokes.ability2[generation][pokemonId] : pokedex.pokes.ability2[generation][self.getSpecieId(pokemonId)]), (pokedex.pokes.ability3[generation][pokemonId] != undefined ? pokedex.pokes.ability3[generation][pokemonId] : pokedex.pokes.ability3[generation][self.getSpecieId(pokemonId)])];
			var abilities = {};
			
			if(self.getGenerationInfo(generation, 'ability'))
			{
				$.each(abilities_ids, function(ability_id) {
					if(ability_id != undefined && ability_id != 0)
					{
						abilities[ability_id] = pokedex.abilities.abilities[ability_id];
					}
				});
			}
			
			slot.find(".pokemon-slot-ability").reloadCombobox(abilities, $.getFirstPropertyIndex(abilities));
			
			// loading moves
			var moves_container = $('<table class="moves-list"></table>'), move_type_id, move_damage_class_id;
			var moves_block = "";
			var learnset = pokedex.pokes.all_moves[generation][pokemonId] != undefined ? pokedex.pokes.all_moves[generation][pokemonId] : pokedex.pokes.all_moves[generation][self.getSpecieId(pokemonId)];
			
			$.each(learnset, function(index, move_id) {
				move_type_id = pokedex.moves.type[generation][move_id] != undefined ? pokedex.moves.type[generation][move_id] : 0;
				move_damage_class_id = pokedex.moves.damage_class[generation][move_id] != undefined ? pokedex.moves.damage_class[generation][move_id] : 0;
				moves_block += '<tr class="move-infos"><td class="move-type"><span class="pokemon-slot-type-block"><span class="pokemon-slot-type type_'+move_type_id+'">'+pokedex.types.types[move_type_id]+'</span></span></td><td class="move-category"><span class="pokemon-slot-type-block"><span class="pokemon-slot-type damage_class_'+move_damage_class_id+'">'+pokedex.categories.categories[move_damage_class_id]+'</span></span></td><td class="move-name">'+pokedex.moves.moves[move_id]+'</td><td class="move-pp"><strong>'+pokedex.moves.pp[generation][move_id]+'</strong> <em>PP</em></td><td class="move-bp"><strong>'+(pokedex.moves.power[generation][move_id] != undefined ? pokedex.moves.power[generation][move_id] : '--')+'</strong> <em>Power</em></td><td class="move-accuracy"><strong>'+pokedex.moves.accuracy[generation][move_id]+'%</strong> <em>Accuracy</em></td></tr>';
			});
			moves_container.append($(moves_block));
			
			slot.find(".moves-list-container").append(moves_container).find('.moves-list tr').on('click', function() {
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
		
		// hiding elements that aren't present in this generation and displaying the ones that are so
		var selectors = $(), hidden_selectors = $();
		$.each({ gender:'.pokemon-slot-gender-selection', happiness:'.pokemon-happiness', hidden_power:'.pokemon-slot-hidden-power-type', ability:'.pokemon-slot-ability', nature:'.pokemon-slot-nature', item:'.pokemon-slot-item', evs:'.pokemon-evs-selectors' }, function(index, selector) {
			selectors.add(selector);
			if(self.getGenerationInfo(generation, index) == false)
			{
				hidden_selectors.add(selector);
			}
			
		});
		selectors.show().filter(hidden_selectors).hide();
		
		// we reset all the informations in the teambuilder
		this.resetTeamBuilder();
	}
};
	
teambuilder.prototype.resetTeamBuilder = function() {
	
	var self = this;
	$("#tb-team-name, #tb-team-tier").val('');
	
	// making the first tab the one that is active
	$('.pokemon-tab').removeClass('active-pokemon-tab').eq(0).addClass('active-pokemon-tab');
	$('.pokemon-slot').removeClass('active-pokemon-slot').eq(0).addClass('active-pokemon-slot');
	
	$('.pokemon-slot').each(function(pokemonIndex) {
		self.resetPokemon(pokemonIndex);
	});
};

teambuilder.prototype.resetPokemon = function(pokemonIndex) {
	
	var self = this;
	var generation = self.getTeamInfo('team_generation');
	var settings = self.default_settings;
	var slot = $(".pokemon-slot").eq(pokemonIndex);
	
	// pokemon icons reset (in tabs)
	$(".pokemon-tab").eq(pokemonIndex).text('Missingno').prepend($('<img>').attr('src', settings.missingno.icon));
	
	// pokemon sprite reset
	slot.find(".pokemon-slot-sprite table img").attr('src', settings.missingno.sprite);
	slot.find('.pokemon-slot-shiny').prop('checked', false);
	
	// pokemon name
	slot.find(".pokemon-slot-name").val('Missingno').data('pokemon_id', 0);
	
	// types
	slot.find('.pokemon-slot-type-block').empty().append('<span class="pokemon-slot-type type_'+settings.unknown_type_id+'">'+pokedex.types.types[settings.unknown_type_id]+'</span>');
		
	// gender
	slot.find(".pokemon-slot-gender-selection .pokemon-slot-gender-radio[value='"+settings.gender+"']").prop('checked', true).trigger('change').parent().css('visibility', 'hidden');
	
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
	slot.find('.pokemon-slot-ability').reloadCombobox({0:'Ability'}, 0);
	
	// reset nature
	slot.find('.pokemon-slot-nature').val(0).combobox('refresh');
	
	// reset item
	slot.find('.pokemon-slot-item').val($(".pokemon-slot-item option:first").val()).combobox('refresh');
	
	// resetting the moves list
	slot.find('.moves-list-container').empty();
	
	// emptying move selection inputs
	slot.find('.pokemon-move-selection').val('');
	
	// We recalculate the stats of the pokemon with the new default infos
	self.recalculateStats(pokemonIndex);
};

teambuilder.prototype.recalculateStats = function(pokemonIndex) {
	
	var that = this, stat, max_stat, stat_progress_class_id;
	var baseStats = pokedex.pokes.stats[$(".pokemon-slot-name").eq(pokemonIndex).data('pokemon_id')] != undefined ? pokedex.pokes.stats[$(".pokemon-slot-name").eq(pokemonIndex).data('pokemon_id')] : pokedex.pokes.stats[that.getSpecieId($(".pokemon-slot-name").eq(pokemonIndex).data('pokemon_id'))];
	var stat_ivs, stat_evs, base_stat, nature, stat_percentage, level = parseInt($(".pokemon-level-value").eq(pokemonIndex).slider('value'));
	var generation = that.getTeamInfo('team_generation');
	
	$.each(this.getGenerationInfo(this.getTeamInfo('team_generation'), 'stats_list'), function(stat_id, stat_name) {
		
		stat_ivs = parseInt($(".pokemon-ivs.stat-id-"+stat_id+" .pokemon-ivs-value").eq(pokemonIndex).val());
		stat_evs = parseInt($(".pokemon-evs.stat-id-"+stat_id+" .pokemon-evs-value").eq(pokemonIndex).val());
		nature = that.getNatureEffect($(".pokemon-slot-nature").eq(pokemonIndex).val(), stat_id);
		base_stat = parseInt(baseStats[stat_id]);
		
		stat = that.calculateStat({
			'stat_id':stat_id,
			'generation':generation,
			'base_stat':base_stat,
			'level':level,
			'nature':nature,
			'stat_ivs':stat_ivs,
			'stat_evs':stat_evs
		});
		
		$(".pokemon-slot-stat-content.stat-id-"+stat_id+" .pokemon-slot-stat-value").eq(pokemonIndex).text(stat);
		//plouf = plouf+''+stat_name+" : "+stat+" | IVS:"+$(".pokemon-ivs.stat-id-"+stat_id+" .pokemon-ivs-value").eq(pokemonIndex).val()+" | EVS:"+$(".pokemon-evs.stat-id-"+stat_id+" .pokemon-evs-value").eq(pokemonIndex).val()+" | Level:"+$(".pokemon-level-value").eq(pokemonIndex).slider('value')+" | Nature: "+that.getNatureEffect($(".pokemon-slot-nature").eq(pokemonIndex).val(), stat_id)+"\n";
		
		min_stat = that.calculateStat({
			'stat_id':stat_id,
			'generation':generation,
			'base_stat':base_stat,
			'level':level,
			'nature':0.9,
			'stat_ivs':0,
			'stat_evs':0
		});
		
		max_stat = that.calculateStat({
			'stat_id':stat_id,
			'generation':generation,
			'base_stat':base_stat,
			'level':level,
			'nature':1.1,
			'stat_ivs':that.getGenerationInfo(generation, 'ivs_limit'),
			'stat_evs':255
		});
		
		stat_percentage = Math.floor(((stat-min_stat)/(max_stat-min_stat))*100);
		stat_progress_class_id = Math.ceil(stat_percentage/25);
		//alert(stat_name+' - '+stat_percentage);
		$(".pokemon-slot-stat-content.stat-id-"+stat_id+" .pokemon-slot-stat-progress").eq(pokemonIndex).css('width', stat_percentage+'%').removeClass('pokemon-slot-stat-progress-1x pokemon-slot-stat-progress-2x pokemon-slot-stat-progress-3x pokemon-slot-stat-progress-4x').addClass('pokemon-slot-stat-progress-'+stat_progress_class_id+'x');
		
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
			return ((infos.stat_ivs + infos.base_stat + 63 + 50) * infos.level)/50 + 10;
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
			return Math.floor((infos.stat_ivs + infos.base_stat + 63) * infos.level)/50 + 5;
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
		case 'gender': case 'shiny': case 'special_stat': case 'happiness': case 'ivs_limit': case 'hidden_power': case 'ability': case 'nature': case 'item': case 'evs': case 'types_ids': case 'sprite_folder':
			//alert(generation+' - '+info_name);
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