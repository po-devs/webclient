// teambuilder class
	
function Teambuilder(generation) {
	
	this.default_settings = {
		generation:6,
		gender:'male', // if the pokemon is not genderless
		level:100,
		happiness:255,
		evs:0,
		stats_ids:[0, 1, 2, 3, 4, 5],
		hp_id:0, // to differenciate between hp stat and the rest in calculations
		special_stat:{ id:3, name:'Special', replace_ids:[3, 4]},
		missingno:{icon:'http://pokemon-online.eu/images/poke_icons/0.png', sprite:'http://pokemon-online.eu/images/pokemon/black-white/0.png'},
		unknown_type_id:18,
		icons_folder:'http://pokemon-online.eu/images/poke_icons/'
	};
    
    this.initialized = false;
    this.generation = generation;
}

Teambuilder.prototype.init = function () {
    if (this.initialized) {
        return;
    }
    
    this.initialized = true;
    var generation = this.generation;
    
	// Initialize the teambuilder
	
	var self = this, settings = self.default_settings;
	generation = generation != undefined ? generation : self.default_settings.generation;
	
	// make it so the form doesn't get submitted at all and reloads the page
	$("#team_form").on('submit', function(e) {
		e.preventDefault();
	});
	
	// loading the list of generations
	$("#tb-team-generation-value").reloadCombobox(pokedex.generations.generations, generation, function(e) {
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
	
	// verifying the team name syntax
	$("#tb-team-name").on('keypress', function(e) {
		if([92, 47, 58, 42, 63, 34, 60, 62, 124].indexOf(e.which) != -1)
		{
			e.preventDefault();
		}
	});
	
	// attaching the list of tiers to the tier name input
	$("#tb-team-tier-value").autocomplete({ source: self.getTiersList() });
	
	// attaching the pokemon id when we select a pokemon
	$(".pokemon-slot-name").autocomplete().on('autocompletefocus', function(e, ui) {
		e.preventDefault();
		$(this).val(ui.item.label).data('pokemon_id', ui.item.value);
	}).on('click', function(e) {
		$(this).select();
		if($(this).val() == '')
		{
			$(this).autocomplete('search', '');
		}
	}).on('keypress', function(e) {
		if(e.which == 13)
		{
			$(this).autocomplete('search', $(this).val()).autocomplete('close');
		}
	}).eq(0).focus();
	
	// pokemon sprite reset
	$(".pokemon-slot-sprite").on('click', function(e) {
		if(self.getGenerationInfo(self.getTeamInfo('generation'), 'shiny'))
		{
			var sprite_name = self.getSpecieId($(this).closest('.pokemon-slot').find('.pokemon-slot-name').data('pokemon_id'))+(self.getFormId($(this).closest('.pokemon-slot').find('.pokemon-slot-name').data('pokemon_id')) != 0 ? '-'+self.getFormId($(this).closest('.pokemon-slot').find('.pokemon-slot-name').data('pokemon_id')) : '');
			$(this).find('.pokemon-slot-shiny').prop('checked', !$(this).find('.pokemon-slot-shiny').prop('checked'));
			$(this).find('img').attr('src', self.getGenerationInfo(self.getTeamInfo('generation'), 'sprite_folder')+($(this).find('.pokemon-slot-shiny').prop('checked') ? 'shiny/' : '')+sprite_name+'.png');
		}
	});
	
	// gender of the pokemon
	$(".pokemon-slot-gender-radio").on('change', function() {
		$(this).parent().find('.pokemon-slot-gender-checked').removeClass('pokemon-slot-gender-checked');
		$("label[for='"+$(this).attr('id')+"']").addClass('pokemon-slot-gender-checked');
	});
	
	// loading stats, ivs and evs
	var stats_block = "", ivs_block ="", evs_block = "", stats_list = self.getGenerationInfo(generation, 'stats_list'), ivs_limit = self.getGenerationInfo(generation, 'ivs_limit');
	
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
		var pokemonIndex = element.closest('.pokemon-slot').index('.pokemon-slot');
		var generation = self.getTeamInfo('generation');
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
		self.recalculateStats(pokemonIndex);
		
		if(value_type == 'ivs')
		{
			self.recalculateHiddenPowerInfos(pokemonIndex);
		}
	};
		
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
			self.recalculateStats($(this).index('.pokemon-level-value'));
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
	$('.pokemon-slot-hidden-power-type').reloadCombobox(types, 16, function(e, ui) {
		var generation = self.getTeamInfo('generation');
		var slot = $(e.target).closest('.pokemon-slot');
		if(self.getGenerationInfo(generation, 'hidden_power'))
		{
			var hidden_power_ivs = self.getHiddenPowerIVs(ui.item.value, generation);
			if(hidden_power_ivs.length == 1)
			{
				//alert(JSON.stringify(hidden_power_ivs[0]));
				$.each(hidden_power_ivs[0], function(stat_id, ivs_value) {
						slot.find(".pokemon-ivs.stat-id-"+stat_id+" .pokemon-ivs-value").val(ivs_value).trigger('change');
				});
				slot.find(".pokemon-hidden-power-ivs-selection").hide().empty();
				
			}
			else if(hidden_power_ivs.length > 1)
			{
				var select_options = "";
				$.each(hidden_power_ivs, function(index, ivs_list) {
					select_options += '<option value="'+ivs_list.join(' ')+'">'+ivs_list.join(' ')+'</option>';
				});
				var ivs_selection = $('<select size="'+hidden_power_ivs.length+'">'+select_options+'</select>').on('change', function(e) {
					$.each($(this).val().split(' '), function(stat_id, ivs_value) {
						slot.find(".pokemon-ivs.stat-id-"+stat_id+" .pokemon-ivs-value").val(ivs_value).trigger('change');
					});
				}).append('<br /><input type="button" name="selected_hp_ivs" value="Done" />');
				slot.find(".pokemon-hidden-power-ivs-selection").html(ivs_selection).append($('<br />')).append($('<input class="click_button pokemon-slot-hidden-power-ivs-selection-close" type="button" name="selected_hp_ivs" value="Done" />').on('click', function(e) { slot.find(".pokemon-hidden-power-ivs-selection").hide(); })).show();
			}
		}
	});
	
	// loading the list of natures and making it recalculate stats on select
	$('.pokemon-slot-nature').reloadCombobox(pokedex.natures.nature, 0, function(e, ui) {
		self.recalculateStats($(e.target).index('.pokemon-slot-nature'));
	});
	
	// separate event for when a pokemon name is selected from the dropdown list
	$(".pokemon-slot-name").on('autocompleteselect', function(e, ui) {
		
		e.preventDefault();
		// We need to reset all the field relative to this pokemon before we start filling them again
		var pokemonId = ui.item.value, slot = $(this).closest('.pokemon-slot'), pokemonIndex = slot.index('.pokemon-slot'), generation = self.getTeamInfo('generation');
		self.resetPokemon(pokemonIndex);
		$(this).val(ui.item.label).data('pokemon_id', pokemonId);
		
		
		// if this pokemon has a mandatory held item we attach it
		if(pokedex.pokes.items[pokemonId] != undefined)
		{
			slot.find('.pokemon-slot-item').val('i'+pokedex.pokes.items[pokemonId]).combobox('refresh');
		}
		
		// loading the sprite
		var sprite_name = self.getSpecieId(ui.item.value)+(self.getFormId(ui.item.value) != 0 ? '-'+self.getFormId(ui.item.value) : '');
		$("#pokemon-tabs .pokemon-tab:eq("+pokemonIndex+")").html('<img src="'+settings.icons_folder+sprite_name+'.png'+'" alt="" />'+ui.item.label+'</span>');		
		slot.find(".pokemon-slot-sprite table img").attr('src', self.getGenerationInfo(generation, 'sprite_folder')+sprite_name+'.png');
		
		// loading type(s)
        var pokemon_types = pokeinfo.types(pokemonId, generation);
		var type1 = pokemon_types[0], type2 = pokemon_types[1];
		var types = '<span class="pokemon-slot-type type_'+type1+'">'+typeinfo.name(type1)+'</span>'+(type2 != settings.unknown_type_id ? '<span class="pokemon-slot-type type_'+type2+'">'+typeinfo.name(type2)+'</span>' : '');
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
			
			gender.filter('.pokemon-slot-gender-radio[value="'+arr_genders[pokedex.pokes.gender[pokemonId]]+'"]').val(arr_genders[pokedex.pokes.gender[pokemonId]]).trigger('change');
			pokedex.pokes.gender[pokemonId] != 3 ? gender.attr('disabled', 'disabled') : gender.removeAttr('disabled');
			gender.parent().show();
		}
		
		// loading the abilities
		
		if(self.getGenerationInfo(generation, 'ability'))
		{
            var abilities_ids = pokeinfo.abilities(pokemonId, generation, true);
			var abilities = {};
			
			$.each(abilities_ids, function(index, ability_id) {
				if(ability_id != undefined && ability_id != 0)
				{
					abilities[ability_id] = abilityinfo.name(ability_id);
				}
			});
			abilities = !$.isEmptyObject(abilities) ? abilities : {0:pokedex.abilities.abilities[0]};
			slot.find(".pokemon-slot-ability").reloadCombobox(abilities, $.getFirstPropertyIndex(abilities));
		}		
		// loading moves
		var moves_container = $('<table class="moves-list"></table>'), move_type_id, move_damage_class_id, moves_block = "";
        var all_moves = pokeinfo.allMoves(pokemonId, generation);
		var learnset = all_moves || pokeinfo.allMoves(self.getSpecieId(pokemonId), generation);
		learnset = learnset || [];
		learnset.sort(function(a, b) {
            var moveA = moveinfo.name(a), moveB = moveinfo.name(b);
            if(moveA > moveB)	{
                return 1;
            } else if(moveA < moveB) {
                return -1;
            } 
            return 0; 
        });

		$.each(learnset, function(index, move_id) {
			move_type_id = moveinfo.type(move_id, generation) || 0;
			move_damage_class_id = moveinfo.damageClass(move_id, generation) || 0;
            move_power = moveinfo.power(move_id, generation);
            move_acc = moveinfo.accuracy(move_id, generation);
			moves_block += '<tr class="move-infos"><td class="move-type"><span class="pokemon-slot-type-block"><span class="pokemon-slot-type type_'+move_type_id+'">'+typeinfo.name(move_type_id)+'</span></span></td><td class="move-category"><span class="pokemon-slot-type-block"><span class="pokemon-slot-type damage_class_'+move_damage_class_id+'">'+categoryinfo.name(move_damage_class_id)+'</span></span></td><td class="move-name">'+moveinfo.name(move_id)+'</td><td class="move-pp"><strong>'+moveinfo.pp(move_id, generation)+'</strong> <em>PP</em></td><td class="move-bp"><strong>'+(move_power ? (move_power != 1 ? move_power : '??') : '--')+'</strong> <em>Power</em></td><td class="move-accuracy"><strong>'+(move_acc != 101 ? move_acc+'%' : '--')+'</strong> <em>Accuracy</em></td></tr>';
		});
		
		moves_block = $(moves_block);
		if(!self.getGenerationInfo(generation, 'damage_classes_move_specific'))
		{
			moves_block.find('.move-category').hide();
		}
		moves_container.html(moves_block);
		
		slot.find(".moves-list-container").html(moves_container).find('.moves-list tr').off('click').on('click', function() {
			var move_name = $(this).find('.move-name').text(), moves = slot.find('.pokemon-move-selection'), moves_values = moves.formValues();
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
	
	// recalculating the height of the moves list to fit the resolution
	var moves_list_container_height = $("body").height() - 570;
	var moves_list_container_max_height = moves_list_container_height > $(".moves-list-container").css('min-height') ? moves_list_container_height : $(".moves-list-container").css('min-height');
	$(".moves-list-container").css({ 'height':moves_list_container_height+'px', 'max-height':moves_list_container_max_height+'px' });
	// saving the team
	$("#save-team").on('click', function(e) {
		//self.loadPokemonInfos(0, {pokemonId:151, level:50});
		//self.loadTeam({infos:{tier:'aaa', name:'el yoyo'}, pokemon:{0:{pokemonId:200}, 2:{pokemonId:2, shiny:true, gender:'female', nickname:'hurr durr!', level:50, happiness:132, ivs:{ 3:7 }, evs:{3:232, 4:400, 0:33}, abilityId:65, natureId:3, itemId:134, movesIds:{0:4, 1:0, 3:173}} } });
	});
	
	//alert(JSON.stringify(this.getHiddenPowerIVs(1, 5)));
	
	// setting the generation of the team
	this.setGeneration(generation);
};

	
Teambuilder.prototype.setGeneration = function(generation) {
	
	var self = this, settings = self.default_settings;
	
	// loading the list of pokemon
	$(".pokemon-slot-name").autocomplete('option', 'source', $.map(pokedex.pokes.released[generation], function(name, id) { if(name) { return {'label': pokeinfo.name(id), 'value':id}; } else { return false; } })).autocomplete('option', 'minLength', 0).autocomplete('option', 'autoFocus', true);
	
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
	$(".pokemon-ivs-stat-name strong").html(ivs_limit == 15 ? 'DVs' : 'IVs');
	$(".pokemon-ivs, .pokemon-evs").css('width', (100/($(".pokemon-ivs").filter(function(){ return $(this).css('display') != 'none';}).length/$(".pokemon-slot").length))+'%');
	
	// shiny helper message
	$(".pokemon-slot-sprite-helper").attr('title', self.getGenerationInfo(generation, 'shiny') ? 'Click here to switch between shiny states' : '');
	
	// loading the list of items
	if(self.getGenerationInfo(generation, 'item'))
	{
		var items = self.getGenerationInfo(generation, 'items_list');
		$('.pokemon-slot-item').reloadCombobox(items, $.getFirstPropertyIndex(items), function(e, ui) {
			var slot = $(e.target).closest('.pokemon-slot');
			var pokemonId = slot.find('.pokemon-slot-name').data('pokemon_id');
            if(pokedex.pokes.items[pokemonId] != undefined && pokedex.pokes.items[pokemonId] != 'i'+$(e.target).val())
            {
				$('.pokemon-slot-name').eq($(e.target).index('.pokemon-slot-item')).trigger('autocompleteselect', [{item:{label:pokedex.pokes.pokemons[0], value:0}}]);
			}
		});
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
	
Teambuilder.prototype.resetTeamBuilder = function() {
	
	var self = this;
	$("#tb-team-name, #tb-team-tier-value").val('');
	
	// making the first tab the one that is active
	$('.pokemon-tab').removeClass('active-pokemon-tab').eq(0).addClass('active-pokemon-tab');
	$('.pokemon-slot').removeClass('active-pokemon-slot').eq(0).addClass('active-pokemon-slot');
	
	// reseting all 6 pokemon
	self.resetPokemon([0, 1, 2, 3, 4, 5]);
};

Teambuilder.prototype.resetPokemon = function(pokemonIndex) {
	
	var self = this, generation = self.getTeamInfo('generation'), settings = self.default_settings, slot_selectors = [], tab_selectors = [];
	pokemonIndex = $.isArray(pokemonIndex) ? pokemonIndex : [pokemonIndex];
	$.each(pokemonIndex, function(index, value) { slot_selectors.push(".pokemon-slot:eq("+value+")");tab_selectors.push(".pokemon-tab:eq("+value+")"); });
	var slot = $(slot_selectors.join(', ')), tab = $(tab_selectors.join(', '));
	
	// pokemon icons reset (in tabs)
	var missingno_icon = '<img src="'+settings.missingno.icon+'" alt="" />Missingno';
	tab.html(missingno_icon);
	
	// pokemon sprite reset
	slot.find(".pokemon-slot-sprite table img").attr('src', settings.missingno.sprite);
	slot.find('.pokemon-slot-shiny').prop('checked', false);
	
	// pokemon name
	slot.find(".pokemon-slot-name").val('Missingno').data('pokemon_id', 0);
	
	// types
    var types = pokeinfo.types(0, generation);
	slot.find('.pokemon-slot-type-block').html('<span class="pokemon-slot-type type_'+types[0]+'">'+typeinfo.name(types[0])+'</span>');
		
	// gender
	slot.find(".pokemon-slot-gender-selection .pokemon-slot-gender-radio[value='"+settings.gender+"']").val(settings.gender).trigger('change').parent().hide();
	
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
	self.recalculateHiddenPowerInfos(pokemonIndex);
	
	// emptying the ability selection
	slot.find('.pokemon-slot-ability').reloadCombobox({0:pokedex.abilities.abilities[0]}, 0);
	
	// reset nature
	slot.find('.pokemon-slot-nature').val(0).combobox('refresh');
	
	// reset item
	slot.find('.pokemon-slot-item').val($(".pokemon-slot-item option:first").val()).combobox('refresh');
	
	// resetting the moves list
	slot.find('.moves-list-container').html('<table class="moves-list"></table>');
	
	// emptying move selection inputs
	slot.find('.pokemon-move-selection').val('');
	
	// We recalculate the stats of the pokemon with the new default infos
	$.each(pokemonIndex, function(index, value) { self.recalculateStats(value); });
};

Teambuilder.prototype.recalculateStats = function(pokemonIndex) {
	
	var self = this, slot = $(".pokemon-slot").eq(pokemonIndex), generation = self.getTeamInfo('generation');
	var stat, max_stat, stat_progress_class_id, stat_ivs, stat_evs, base_stat, nature, stat_percentage;
	var level = parseInt(slot.find(".pokemon-level-value").slider('value'));
	var baseStats = pokeinfo.stats(slot.find(".pokemon-slot-name").data('pokemon_id'), generation);
	var stats_list = self.getGenerationInfo(self.getTeamInfo('generation'), 'stats_list');
	
	$.each(stats_list, function(stat_id, stat_name) {
		
		stat_ivs = parseInt(slot.find(".pokemon-ivs.stat-id-"+stat_id+" .pokemon-ivs-value").val());
		stat_evs = parseInt(slot.find(".pokemon-evs.stat-id-"+stat_id+" .pokemon-evs-value").val());
		stat_ivs = isNaN(stat_ivs) ? 0 : stat_ivs, stat_evs = isNaN(stat_evs) ? 0 : stat_evs;
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

Teambuilder.prototype.calculateStat = function(infos) {
	
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

Teambuilder.prototype.recalculateHiddenPowerInfos = function(pokemonIndex) {
	
	var self = this, slot = $(".pokemon-slot").eq(pokemonIndex), generation = self.getTeamInfo('generation'), stats_list = self.getGenerationInfo(generation, 'stats_list'), ivs = [];
	
	$.each(stats_list, function(stat_id) {
		ivs[stat_id] = slot.find(".pokemon-ivs.stat-id-"+stat_id+" .pokemon-ivs-value").val();
	});
	slot.find('.pokemon-slot-hidden-power-type').val(self.getHiddenPowerType(generation, ivs[0], ivs[1], ivs[2], ivs[3], ivs[4], ivs[5])).combobox('refresh');
	slot.find('.pokemon-slot-hidden-power-bp-value').text(self.getHiddenPowerBP(generation, ivs[0], ivs[1], ivs[2], ivs[3], ivs[4], ivs[5]));
};

Teambuilder.prototype.getTeamInfo = function(info_name) {

	switch(info_name)
	{
		case 'name':
			return $("#tb-team-name").val();
		break;
		
		case 'tier':
			return $("#tb-team-tier-value").val();
		break;
		
		case 'generation':
			return $("#tb-team-generation-value").val();
		break;
	}
	
};

Teambuilder.prototype.getGenerationInfo = function(generation, info_name) {
	switch(info_name)
	{
		case 'special_stats_same': case 'damage_classes_move_specific': case 'gender': case 'shiny': case 'special_stat': case 'happiness': case 'ivs_limit': case 'hidden_power': case 'hidden_power_bp': case 'ability': case 'nature': case 'item': case 'evs': case 'types_ids': case 'sprite_folder':
			return pokedex.generations.options[generation][info_name];
		break;
		
		case 'items_list':
			
			var items = {}, berries = {};
			$.each(pokedex.items.released_items[generation], function(key, value) {
				items['i'+key] = pokeinfo.name(key);
			});
			$.each(pokedex.items.released_berries[generation], function(key, value) {
				berries['b'+key] = iteminfo.berryName(key);
			});
			
			return $.extend(items, berries);
			
		break;
		
		case 'stats_list':
			var stats = {}, self = this;
			
			$.each(this.default_settings.stats_ids, function(stat_id) {
				stats[stat_id] = statinfo.name(stat_id);
			});
			
			return stats;
		break;
		
		case 'types_list':
			return this.TeamInfoIdsToPairs(info_name, this.getGenerationInfo(generation, 'types_ids'));
		break;
	}
};

Teambuilder.prototype.TeamInfoIdsToPairs = function(info_name, values) {
	switch(info_name)
	{
		case 'types_list':
			var pairs = {};
			$.each(values, function(index, type_id) {
				pairs[type_id] = typeinfo.name(type_id);
			});
			return pairs;
		break;
	}
};

Teambuilder.prototype.getTeamInfos = function() {
	
	var infos = {};
	
	infos.name = this.getTeamInfo('name');
	infos.tier = this.getTeamInfo('tier');
	infos.generation = this.getTeamInfo('generation');
	
	return infos;
};

Teambuilder.prototype.getPokemonInfos = function(pokemonIndex) {
	
	pokemonIndex = $.isArray(pokemonIndex) ? pokemonIndex : [pokemonIndex];
	var slot, self = this, generation = self.getTeamInfo('generation'), pokemon = {};
	
	$.each(pokemonIndex, function(key, index) {
		slot = $(".pokemon-slot").eq(index);
		pokemon[index] = {};
		
		pokemon[index].pokemonId = slot.find('.pokemon-slot-name').data('pokemon_id');
		pokemon[index].shiny = self.getGenerationInfo(generation, 'shiny') ? slot.find('.pokemon-slot-shiny').prop('checked') : undefined;
		pokemon[index].gender = (self.getGenerationInfo(generation, 'gender') && slot.find(".pokemon-slot-gender-selection").css('display') != 'none') ? slot.find("#"+slot.find('.pokemon-slot-gender-checked').attr('for')).val() : 'neutral';
		pokemon[index].nickname = slot.find('.pokemon-slot-nickname').val();
		pokemon[index].level = slot.find('.pokemon-level-value').slider('value');
		pokemon[index].happiness = self.getGenerationInfo(generation, 'happiness') ? slot.find('.pokemon-happiness-value').slider('value') : undefined;
		pokemon[index].ivs = {};
		slot.find('.pokemon-ivs-value').each(function() {
			pokemon[index].ivs[$(this).closest('.pokemon-ivs').attr('class').match(/stat-id-[0-9]/g).join('').split('-')[2]] = $(this).val();
		});
		pokemon[index].abilityId = self.getGenerationInfo(generation, 'ability') ? slot.find('.pokemon-slot-ability').val() : undefined;
		pokemon[index].natureId = self.getGenerationInfo(generation, 'nature') ? slot.find('.pokemon-slot-nature').val() : undefined;
		pokemon[index].itemId = self.getGenerationInfo(generation, 'item') ? slot.find('.pokemon-slot-item').val() : undefined;
		if(self.getGenerationInfo(generation, 'evs'))
		{
			pokemon[index].evs = {};
			slot.find('.pokemon-evs-value').each(function() {
				pokemon[index].evs[$(this).closest('.pokemon-evs').attr('class').match(/stat-id-[0-9]/g).join('').split('-')[2]] = $(this).val();
			});
		}
		pokemon[index].movesIds = {};
		slot.find('.pokemon-move-selection').each(function(moveIndex) {
			var moveName = $(this).val(), moveId = 0;
			
			$.each(pokedex.moves.moves, function(move_id, move_name) {
				if(moveName == move_name)
				{
					moveId = move_id;
				}
			});
			pokemon[index].movesIds[moveIndex] = moveId;
		});
	});
	
	return pokemonIndex.length > 1 ? pokemon : pokemon[pokemonIndex[0]];
};

Teambuilder.prototype.getLoadedTeam = function(isString) {
	
	var team = {};
	team.infos = this.getTeamInfos();
	team.pokemon = this.getPokemonInfos([0, 1, 2, 3, 4, 5]);
	
	return (isString != undefined && isString == true) ? JSON.stringify(team) : team;
};

Teambuilder.prototype.loadTeamInfos = function(infos) {
	
	if(infos.name != undefined)
	{
		$("#tb-team-name").val(infos.name);
	}
	
	if(infos.tier != undefined)
	{
		$("#tb-team-tier-value").val(infos.tier);
	}
	
	if(infos.generation != undefined)
	{
		$("#tb-team-generation-value").val(infos.generation).combobox('select').combobox('refresh');
	}
	
};

Teambuilder.prototype.loadPokemonInfos = function(pokemonIndex, infos) {
	
	pokemonIndex = $.isArray(pokemonIndex) ? pokemonIndex : [pokemonIndex];
	var slot, self = this, generation = self.getTeamInfo('generation'), data, pokemon = {};
	
	$.each(pokemonIndex, function(key, index) {
		slot = $(".pokemon-slot").eq(index);
		data = pokemonIndex.length > 1 ? (infos[index] != undefined ? infos[index] : { pokemonId:0 }) : infos;
		
		if(data.pokemonId != undefined)
		{
			slot.find('.pokemon-slot-name').trigger('autocompleteselect', [{ item: { label: pokeinfo.name(data.pokemonId), value:data.pokemonId } }]);
		}
		
		if(self.getGenerationInfo(generation, 'shiny') && data.shiny != undefined && slot.find('.pokemon-slot-shiny').prop('checked') != data.shiny)
		{
			slot.find('.pokemon-slot-sprite').trigger('click');
		}
		
		if(self.getGenerationInfo(generation, 'gender') && data.gender != undefined)
		{
			if(data.gender == 'neutral')
			{
				slot.find('.pokemon-slot-gender-selection').hide();
			}
			else
			{
				slot.find('.pokemon-slot-gender-radio[value="'+data.gender+'"]').trigger('change');
			}
		}
		
		if(data.nickname != undefined)
		{
			slot.find('.pokemon-slot-nickname').val(data.nickname);
		}
		
		if(data.level != undefined)
		{
			slot.find('.pokemon-level-value').slider('value', data.level);
		}
		
		if(data.happiness != undefined)
		{
			slot.find('.pokemon-happiness-value').slider('value', data.happiness);
		}
		
		if(data.ivs != undefined)
		{
			$.each(data.ivs, function(stat_id, value) {
				slot.find('input[name="pokemon-slot-ivs-'+stat_id+'"]').val(value).trigger('change').trigger('keyup');
			});
		}
		
		if(self.getGenerationInfo(generation, 'ability') && data.abilityId != undefined)
		{
			slot.find('.pokemon-slot-ability').val(data.abilityId).combobox('refresh');
		}
		
		if(self.getGenerationInfo(generation, 'nature') && data.natureId != undefined)
		{
			slot.find('.pokemon-slot-nature').val(data.natureId).combobox('select').combobox('refresh');
		}
		
		if(self.getGenerationInfo(generation, 'evs') && data.evs != undefined)
		{
			$.each(data.evs, function(stat_id, value) {
				slot.find('input[name="pokemon-slot-evs-'+stat_id+'"]').val(value).trigger('change').trigger('keyup');
			});
		}
		
		if(data.movesIds != undefined)
		{
			$.each(data.movesIds, function(moveIndex, move_id) {
				if(move_id != 0 && moveinfo.hasMove(move_id))
				{
					slot.find('.pokemon-move-selection').eq(moveIndex).val(moveinfo.move(move_id));
				}
			});
		}
		
		if(self.getGenerationInfo(generation, 'item') && data.itemId != undefined)
		{
			slot.find('.pokemon-slot-item').val(data.itemId).combobox('select').combobox('refresh');
		}
		
	});
};

Teambuilder.prototype.loadTeam = function(team) {
	
	team = !$.isPlainObject(team) ? JSON.parse(team) : team;
	this.loadTeamInfos(team.infos);
	this.loadPokemonInfos([0, 1, 2, 3, 4, 5], team.pokemon);
	
};

Teambuilder.prototype.getSpecieId = function(pokemonId) {
	return pokemonId & ((1 << 16) - 1);
};

Teambuilder.prototype.getFormId = function(pokemonId) {
	return Math.floor(pokemonId / 65536);
};

Teambuilder.prototype.getNatureEffect = function(nature_id, stat_id) {
	var arr = {0:0, 1:1, 2:2, 3:4, 4:5, 5:3};
	return (10+(-(nature_id%5 == arr[stat_id]-1) + (Math.floor(nature_id/5) == arr[stat_id]-1)))/10;
};

Teambuilder.prototype.getCorrectEVs = function(evs_element) {
	
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

Teambuilder.prototype.getTiersList = function(list) {
	
	var self = this, tiers = [];
	list = list != undefined ? list : (window.tiersList != undefined ? tiersList : {});
	
	$.each(list, function(key, tier) {
		$.each(tier.tiers, function(key, name) {
			if($.isPlainObject(name))
			{
				tiers.concat(self.getTiersList([name]));
			}
			else
			{
				tiers.push(name);
			}
		});
	});
	
	return tiers;
};

Teambuilder.prototype.getHiddenPowerIVs = function(type , generation) {
    var ret = [], gt;

    for (var i=63;i>=0;i--) 
	{
        gt = this.getHiddenPowerType(generation, i & 1, (i & 2)!=0, (i & 4)!=0, (i & 8)!=0, (i & 16)!=0, (i & 32)!=0);
        if (gt == type) 
		{
			ret.push([(((i&1)!=0)+30), (((i&2)!=0)+30), (((i&4)!=0)+30), (((i&8)!=0)+30), (((i&16)!=0)+30), (((i&32)!=0)+30)]);
        }
    }

    return ret;
};

Teambuilder.prototype.getHiddenPowerType = function(generation, hp_ivs, atk_ivs, def_ivs, satk_ivs, sdef_ivs, spe_ivs) {
	
	var type;
	
	if(generation >= 3)
	{
		type = ((((hp_ivs%2)+(2*(atk_ivs%2))+(4*(def_ivs%2))+(8*(spe_ivs%2))+(16*(satk_ivs%2))+(32*(sdef_ivs%2)))*15)/63)+1;
	}
	else
	{
		type = 4*(atk_ivs%4)+(def_ivs%4);
	}
	
	return parseInt(type);
	
};

Teambuilder.prototype.getHiddenPowerBP = function(generation, hp_ivs, atk_ivs, def_ivs, satk_ivs, sdef_ivs, spe_ivs) {
	
	var bp;
	if(!this.getGenerationInfo(generation, 'hidden_power_bp'))
	{
		if(generation >= 3)
		{
			bp = Math.floor(((hp_ivs%2 + (2*(atk_ivs%2)) + (4*(def_ivs%2)) + (8*(spe_ivs%2)) + (16*(satk_ivs%2)) + (32*(sdef_ivs%2)))*40)/63) + 30;
		}
		else
		{
			bp = Math.floor(((5 * ((satk_ivs%8 ? 1 : 0) + (2*(spe_ivs%8 ? 1 : 0)) + (4*(def_ivs%8 ? 1 : 0)) + (8*(atk_ivs%8 ? 1 : 0))) + (satk_ivs < 3 ? satk_ivs : 3))/2) + 31);
		}
	}
	else
	{
		bp = this.getGenerationInfo(generation, 'hidden_power_bp');
	}
	
	return bp;
}