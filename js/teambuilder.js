(function (webclient, poStorage) {
    // teambuilder class
    var defaultSettings = {
        generation: 6,
        gender: 'male', // if the pokemon is not genderless
        level: 100,
        happiness: 255,
        evs: 0,
        stats_ids: [0, 1, 2, 3, 4, 5],
        hp_id: 0, // to differenciate between hp stat and the rest in calculations
        special_stat: {
            id: 3,
            name: 'Special',
            replace_ids: [3, 4]
        },
        missingno: {
            icon: 'http://pokemon-online.eu/images/poke_icons/0.png',
            sprite: 'http://pokemon-online.eu/images/pokemon/x-y/0.png'
        },
        unknown_type_id: 18
    };

    var featureMap = {
        gender: '.pokemon-slot-gender-selection',
        happiness: '.pokemon-happiness',
        hidden_power: '.pokemon-slot-hidden-power-container',
        ability: '.pokemon-slot-ability-container',
        nature: '.pokemon-slot-nature-container',
        item: '.pokemon-slot-item-container',
        evs: '.pokemon-evs-selectors'
    };

    function Teambuilder(generation) {
        this.initialized = false;
        this.generation = generation;
        this.team = -1;
        this._cache = {};
    }

    // TODO: Instead of storing everything in the DOM,
    // store a copy of the team in memory and update it on DOM changes
    Teambuilder.prototype.init = function () {
        if (this.initialized) {
            return;
        }

        this.initialized = true;
        var self = this,
            generation = this.generation || defaultSettings.generation,
            len, i;

        // make it so the form doesn't get submitted at all and reloads the page
        $("#team_form").submit(function (e) {
            e.preventDefault();
        });

        // loading the list of generations
        $("#tb-team-generation-value").reloadCombobox(geninfo.list(), generation, function (e) {
            self.setGeneration($(e.target).val());
        });

        // clone the pokemon slot 5 times
        var pokemon_slot = $(".pokemon-slot").clone();
        pokemon_slot.removeClass('active-pokemon-slot');
        var pokemon_slots = '',
            pokemonSlot = 2;

        function addSlotGenderId() {
            //this.id += (this.id.indexOf('female') != -1 ? 'pokemon-slot-gender-female-' : 'pokemon-slot-gender-male-') + i;
            this.id += pokemonSlot;
        }

        function addSlotGenderFor() {
            // $(this).attr('for', ($(this).attr('for').indexOf('female') != -1 ? 'pokemon-slot-gender-female-' : 'pokemon-slot-gender-male-')+i);
            this.setAttribute('for', this.getAttribute('for') + pokemonSlot);
        }

        for (; pokemonSlot <= 6; pokemonSlot += 1) {
            pokemon_slot.find('.pokemon-slot-gender-radio').each(addSlotGenderId);
            pokemon_slot.find('.pokemon-slot-gender-male-icon, .pokemon-slot-gender-female-icon').each(addSlotGenderFor);

            pokemon_slots += pokemon_slot.wrap('<p>').parent().html();
        }

        $("#pokemon-parameters").append(pokemon_slots);

        // tabs for the teambuilder
        $("#pokemon-tabs").sortable().on('sortstart', function (event, ui) {
            $("#pokemon-tabs .pokemon-tab").each(function (index) {
                this.id = 'tb_tab_temporary_id_' + index;
                // TODO: Is the attr necessary here?
                $(".pokemon-slot")[index].id = 'tb_tab_content_temporary_id_' + index;
            });
        }).on('sortupdate', function (event, ui) {
            var element = $("#tb_tab_content_ " + ui.item[0].id.substr(7)),
                index = ui.item.index();

            if (index > element.index()) {
                $(".pokemon-slot").eq(index).after(element);
            } else {
                $(".pokemon-slot").eq(index).before(element);
            }
        }).on('sortstop', function (event, ui) {
            // TODO: Is the removeAttr necessary here? get(0).id = ''
            $("#pokemon-tabs .pokemon-tab").removeAttr('id');
            $(".pokemon-slot").removeAttr('id');
        });

        // managing the active tab of the teambuilder
        $("#pokemon-tabs .pokemon-tab").click(function () {
            var index = $(this).index();
            $('.pokemon-tab').removeClass('active-pokemon-tab').eq(index).addClass('active-pokemon-tab');
            $('.pokemon-slot').removeClass('active-pokemon-slot').eq(index).addClass('active-pokemon-slot');
        });

        // toggling the icon gear to be able to show informations regarding the team such as the generation or the name of the team
        $("#pokemon-parameters .fa-gear").click(function () {
            $("#team-infos").toggle();
        });

        // verifying the team name syntax
        $("#tb-team-name").keypress(function (e) {
            if ([92, 47, 58, 42, 63, 34, 60, 62, 124].indexOf(e.which) !== -1) {
                e.preventDefault();
            }
        });

        // attaching the list of tiers to the tier name input
        $("#tb-team-tier-value").autocomplete({
            source: self.getTiersList()
        });

        $(".pokemon-slot-name").autocomplete().click(function (e) {
            var $this = $(this);

            $this.select();
            if ($this.val() === '') {
                $this.autocomplete('search', '');
            }
        }).keypress(utils.onEnterPressed(function () {
            var $this = $(this);

            $this.autocomplete('search', $this.val()).autocomplete('close');
        })).eq(0).focus();

        // pokemon sprite reset
        $(".pokemon-slot-sprite").click(function (e) {
            var pokeNum, formeNum, pokeid, $this;
            if (geninfo.hasOption(self.getTeamInfo('generation'), 'shiny')) {
                $this = $(this);
                pokeid = $this.closest('.pokemon-slot').find('.pokemon-slot-name').data('pokemon_id');
                formeNum = pokeinfo.forme(pokeid);
                pokeNum = pokeinfo.species(pokeid);

                $this.find('.pokemon-slot-shiny').prop('checked', !($this.find('.pokemon-slot-shiny').prop('checked')));
                $this.find('img').attr('src', pokeinfo.sprite({num: pokeNum, forme: formeNum, gen: +self.getTeamInfo('generation'), shiny: $this.find('.pokemon-slot-shiny').prop('checked')}));
            }
        });

        // gender of the pokemon
        $(".pokemon-slot-gender-radio").change(function () {
            var $this = $(this);

            $this.parent().find('.pokemon-slot-gender-checked').removeClass('pokemon-slot-gender-checked');
            $("label[for='" + $this[0].id + "']").addClass('pokemon-slot-gender-checked');
        });

        // loading stats, ivs and evs
        var stats_block = "",
            ivs_block = "",
            evs_block = "",
            stats_list = self.getGenerationInfo(generation, 'stats_list'),
            ivs_limit = geninfo.option(generation).ivs_limit,
            stat_id,
            stat_name;

        for (stat_id in stats_list) {
            stat_name = stats_list[stat_id];
            stats_block += '<div class="pokemon-slot-stat-content stat-id-' + stat_id + '"><span class="pokemon-slot-stat-name">' + stat_name + '</span><span class="pokemon-slot-stat-block"><span class="pokemon-slot-stat-progress"></span><span class="pokemon-slot-stat-value">0</span></span></div>';
            ivs_block += '<span class="pokemon-ivs stat-id-' + stat_id + '"><span class="pokemon-ivs-stat-name"><strong>' + (ivs_limit == 15 ? 'DVs' : 'IVs') + '</strong> ' + stat_name + '</span><input name="pokemon-slot-ivs-' + stat_id + '" type="text" value="' + ivs_limit + '" class="pokemon-ivs-value" /></span>';
            evs_block += '<span class="pokemon-evs stat-id-' + stat_id + '"><span class="pokemon-evs-stat-name"><strong>EVs</strong> ' + stat_name + '</span><input name="pokemon-slot-evs-' + stat_id + '" type="text" value="' + defaultSettings.evs + '" class="pokemon-evs-value" /></span>';
        }

        $('.pokemon-slot-stats').html(stats_block);
        $(".pokemon-ivs-selectors").html(ivs_block);
        if (geninfo.hasOption(generation, 'evs')) {
            $(".pokemon-evs-selectors").html(evs_block);
        }

        // creating knobs for both IVs and EVs
        var knob_event = function (value) {
            if (value < 0) {
                return;
            }

            var element = value.target ? $(value.target) : this.$;
            var pokemonIndex = element.closest('.pokemon-slot').index('.pokemon-slot');
            var generation = self.getTeamInfo('generation');
            var value_type = element.hasClass('pokemon-evs-value') ? 'evs' : 'ivs';
            var stat_id = element.closest('.pokemon-' + value_type).attr('class').match(/stat-id-[0-9]/g).join('').split('-')[2];

            if (value_type === 'evs' && (value.type == null || value.type !== 'keyup' || (value.type === 'keyup' && [37, 39].indexOf(value.which) !== -1))) {
                element.val(self.getCorrectEVs(element)).trigger('change');
            }

            if (!geninfo.hasOption(generation, 'special_stat') && geninfo.hasOption(generation, 'special_stats_same') && defaultSettings.special_stat.replace_ids.indexOf(parseInt(stat_id, 10)) !== -1) {
                element.closest('.pokemon-slot').find(".pokemon-" + value_type + ".stat-id-" + $.grep(defaultSettings.special_stat.replace_ids, function (id) {
                    return id !== stat_id;
                }).join('') + " .pokemon-" + value_type + "-value").val(element.val()).trigger('change');
            }

            self.recalculateStats(pokemonIndex);
            if (value_type === 'ivs') {
                self.recalculateHiddenPowerInfos(pokemonIndex);
            }
        };

        var knob_params = {
            min: 0,
            width: 75,
            height: 75,
            thickness: 0.06,
            displayInput: true,
            fgColor: '#1f5d96',
            bgColor: '#f0f0f0',
            font: 'inherit',
            inputColor: '#757575',
            release: knob_event,
            change: knob_event
        };

        var knob_ivs_params = $.extend({}, knob_params);
        knob_ivs_params.max = ivs_limit;
        knob_ivs_params.step = 1;

        $(".pokemon-ivs-value").knob(knob_ivs_params).keyup(knob_event);

        var knob_evs_params = $.extend({}, knob_params);
        knob_evs_params.max = 255;
        knob_evs_params.step = 4;

        $(".pokemon-evs-value").knob(knob_evs_params).on('keyup focusout', knob_event);

        // initializing the slider for level
        $(".pokemon-level-value").slider({
            min: 1,
            max: 100,
            create: function (event, ui) {
                var $this = $(this);
                $this.parent().find('.pokemon-level-display-value').text($this.slider('value'));
            },
            slide: function (event, ui) {
                var $this = $(this);
                $this.parent().find('.pokemon-level-display-value').text($this.slider('value'));
                self.recalculateStats($this.index('.pokemon-level-value'));
            },
            change: function (event, ui) {
                var $this = $(this);
                $this.parent().find('.pokemon-level-display-value').text($this.slider('value'));
                self.recalculateStats($this.index('.pokemon-level-value'));
            },
            stop: function (event, ui) {
                var $this = $(this);
                $this.parent().find('.pokemon-level-display-value').text($this.slider('value'));
            }
        });

        // initializing the slider for happiness
        $(".pokemon-happiness-value").slider({
            min: 0,
            max: 255,
            create: function (event, ui) {
                var $this = $(this);
                $this.parent().find('.pokemon-happiness-display-value').text($this.slider('value'));
            },
            slide: function (event, ui) {
                var $this = $(this);
                $this.parent().find('.pokemon-happiness-display-value').text($this.slider('value'));
            },
            change: function (event, ui) {
                var $this = $(this);
                $this.parent().find('.pokemon-happiness-display-value').text($this.slider('value'));
            },
            stop: function (event, ui) {
                var $this = $(this);
                $this.parent().find('.pokemon-happiness-display-value').text($this.slider('value'));
            }
        });

        // make the advanced button show/hide the advanced options when clicked
        $(".pokemon-slot-advanced").click(function () {
            $(this).parent().parent().find('.pokemon-slot-advanced-content').toggle();
        });

        // loading the list of possible hidden power types
        $('.pokemon-slot-hidden-power-type, .pokemon-hidden-power-ivs-selection').empty();

        var types = self.getGenerationInfo(2, 'types_list'); // gen2 types
        delete types[0]; // remove Normal type from the list of possibilities

        $('.pokemon-slot-hidden-power-type').reloadCombobox(types, 16, function (e, ui) {
            var generation = self.getTeamInfo('generation');
            var slot = $(e.target).closest('.pokemon-slot');
            var list, len, i;
            if (geninfo.hasOption(generation, 'hidden_power')) {
                var hidden_power_ivs = moveinfo.getHiddenPowerIVs(ui.item.value, generation);
                if (hidden_power_ivs.length === 1) {
                    $.each(hidden_power_ivs[0], function (stat_id, ivs_value) {
                        slot.find(".pokemon-ivs.stat-id-" + stat_id + " .pokemon-ivs-value").val(ivs_value).trigger('change');
                    });
                    slot.find(".pokemon-hidden-power-ivs-selection").hide().empty();
                } else if (hidden_power_ivs.length > 1) {
                    var select_options = "";
                    for (i = 0, len = hidden_power_ivs.length; i < len; i += 1) {
                        list = hidden_power_ivs[i].join(' ');
                        select_options += '<option value="' + list + '">' + list + '</option>';
                    }

                    var ivs_selection = $('<select size="' + hidden_power_ivs.length + '">' + select_options + '</select>').change(function (e) {
                        var val = $(this).val().split(' ');
                        for (i = 0, len = val.length; i < len; i += 1) {
                            slot.find(".pokemon-ivs.stat-id-" + i + " .pokemon-ivs-value").val(val[i]).trigger('change');
                        }
                    }).append('<br /><input type="button" name="selected_hp_ivs" value="Done" />');

                    slot.find(".pokemon-hidden-power-ivs-selection")
                        .html(ivs_selection)
                        .append('<br/>')
                        .append(
                            $('<input class="click_button pokemon-slot-hidden-power-ivs-selection-close" type="button" name="selected_hp_ivs" value="Done" />')
                            .click(function (e) {
                                slot.find(".pokemon-hidden-power-ivs-selection").hide();
                            })
                        )
                        .show();
                }
            }
        });

        // loading the list of natures and making it recalculate stats on select
        $('.pokemon-slot-nature').reloadCombobox(natureinfo.list(), 0, function (e, ui) {
            self.recalculateStats($(e.target).index('.pokemon-slot-nature'));
        });

        // separate event for when a pokemon name is selected from the dropdown list
        $(".pokemon-slot-name").on('autocompleteselect', function (e, ui) {
            e.preventDefault();

            // We need to reset all the field relative to this pokemon before we start filling them again
            var pokemonId = ui.item.value,
                $this = $(this),
                slot = $this.closest('.pokemon-slot'),
                pokemonIndex = slot.index('.pokemon-slot'),
                generation = self.getTeamInfo('generation');

            self.resetPokemon(pokemonIndex);
            $this.val(ui.item.label).data('pokemon_id', pokemonId);

            // if this pokemon has a mandatory held item we attach it
            var heldItem = pokeinfo.heldItem(pokemonId);
            if (heldItem) {
                slot.find('.pokemon-slot-item').val(heldItem).combobox('refresh');
            }

            // loading the sprite
            var pokeId = pokeinfo.species(+ui.item.value);
            var spriteForm = pokeinfo.forme(+ui.item.value);

            $("#pokemon-tabs .pokemon-tab:eq(" + pokemonIndex + ")").html('<img src="' + pokeinfo.icon({num: pokeId, forme: spriteForm}) + '" alt="" />' + ui.item.label + '</span>');
            slot.find(".pokemon-slot-sprite table img").attr('src', pokeinfo.sprite({num: pokeId, forme: spriteForm, gen: +self.getTeamInfo('generation'), shiny: slot.find('.pokemon-slot-shiny').prop('checked')}));

            // loading type(s)
            var pokemon_types = pokeinfo.types(pokemonId, generation);
            var type1 = pokemon_types[0],
                type2 = pokemon_types[1] || defaultSettings.unknown_type_id;
            var types = '<span class="pokemon-slot-type type_' + type1 + '">' + typeinfo.name(type1) + '</span>' + (type2 !== defaultSettings.unknown_type_id ? '<span class="pokemon-slot-type type_' + type2 + '">' + typeinfo.name(type2) + '</span>' : '');
            slot.find(".pokemon-slot-type-block").html(types);

            var gender = slot.find('.pokemon-slot-gender-radio');

            // loading possible genders
            var pokeGender = pokeinfo.gender(pokemonId), genderName;
            if ([1, 2, 3].indexOf(pokeGender) !== -1) {
                genderName = genderinfo.name(pokeGender);
                gender.filter('.pokemon-slot-gender-radio[value="' + genderName + '"]').val(genderName).trigger('change');

                if (pokeGender !== 3) {
                    gender.attr('disabled', 'disabled');
                } else {
                    gender.removeAttr('disabled');
                }

                gender.parent().show();
            }

            // loading the abilities
            if (geninfo.hasOption(generation, 'ability')) {
                var abilities_ids = pokeinfo.abilities(pokemonId, generation),
                    abilities = {},
                    ability_id;

                for (i = 0, len = abilities_ids.length; i < len; i += 1) {
                    ability_id = abilities_ids[i];
                    if (ability_id) {
                        abilities[ability_id] = abilityinfo.name(ability_id);
                    }
                }

                abilities = !$.isEmptyObject(abilities) ? abilities : {0: '(No Ability)'};
                slot.find(".pokemon-slot-ability").reloadCombobox(abilities, '(No Ability)');
            }

            // loading moves
            var moves_container = $('<table class="moves-list"></table>'),
                move_type_id, move_damage_class_id, moves_block = "";
            var all_moves = pokeinfo.allMoves(pokemonId, generation);
            var learnset = all_moves || pokeinfo.allMoves(pokeinfo.species(pokemonId), generation);

            learnset = learnset || [];
            // MissingNo
            if (learnset[0] === undefined) {
                learnset = [];
            }

            learnset.sort(function (a, b) {
                var moveA = moveinfo.name(a),
                    moveB = moveinfo.name(b);

                if (moveA > moveB) {
                    return 1;
                } else if (moveA < moveB) {
                    return -1;
                }
                return 0;
            });

            var move_id;
            for (i = 0, len = learnset.length; i < len; i += 1) {
                move_id = learnset[i];
                move_type_id = moveinfo.type(move_id, generation) || 0;
                move_damage_class_id = moveinfo.damageClass(move_id, generation) || 0;
                move_power = moveinfo.power(move_id, generation);
                move_acc = moveinfo.accuracy(move_id, generation);

                // TODO: Clean up this html
                moves_block += '<tr class="move-infos"><td class="move-type"><span class="pokemon-slot-type-block"><span class="pokemon-slot-type type_' + move_type_id + '">' + typeinfo.name(move_type_id) + '</span></span></td><td class="move-category"><span class="pokemon-slot-type-block"><span class="pokemon-slot-type damage_class_' + move_damage_class_id + '">' + categoryinfo.name(move_damage_class_id) + '</span></span></td><td class="move-name">' + moveinfo.name(move_id) + '</td><td class="move-pp"><strong>' + moveinfo.pp(move_id, generation) + '</strong> <em>PP</em></td><td class="move-bp"><strong>' + (move_power ? (move_power != 1 ? move_power : '??') : '--') + '</strong> <em>Power</em></td><td class="move-accuracy"><strong>' + (move_acc !== 101 ? move_acc + '%' : '--') + '</strong> <em>Accuracy</em></td></tr>';
            }

            moves_block = $(moves_block);
            if (geninfo.hasOption(generation, 'damage_classes_move_specific')) {
                moves_block.find('.move-category').hide();
            }

            moves_container.html(moves_block);
            slot.find(".moves-list-container").html(moves_container).find('.moves-list tr').off('click').click(function () {
                var move_name = $(this).find('.move-name').text(),
                    moves = slot.find('.pokemon-move-selection'),
                    moves_values = moves.formValues();

                moves_values = moves_values['pokemon-move-selection[]'];
                moves.each(function (index) {
                    var $this = $(this);
                    if ($this.val() === '' && moves_values.indexOf(move_name) === -1) {
                        $this.val(move_name);
                        return false;
                    }
                });
            });

            self.recalculateStats(pokemonIndex);
        });

        // recalculating the height of the moves list to fit the resolution
        var moves_list_container_height = $("body").height() - 570;
        var movesListContainer = $(".moves-list-container");
        var movesListMinHeight = movesListContainer.css('min-height');
        var moves_list_container_max_height = moves_list_container_height > movesListMinHeight ? moves_list_container_height : movesListMinHeight;

        $(".moves-list-container").css({
            'height': moves_list_container_height + 'px',
            'max-height': moves_list_container_max_height + 'px'
        });
        // saving the team
        $("#save-team").click(function (e) {
            self.saveTeam();
            // Return to chat
            $("#po_title").click();
            //self.loadTeam({infos:{tier:'aaa', name:'el yoyo'}, pokemon:{0:{pokemonId:200}, 2:{pokemonId:2, shiny:true, gender:'female', nickname:'hurr durr!', level:50, happiness:132, ivs:{ 3:7 }, evs:{3:232, 4:400, 0:33}, abilityId:65, natureId:3, itemId:134, movesIds:{0:4, 1:0, 3:173}} } });
        });

        // setting the generation of the team
        this.setGeneration(generation);
    };

    Teambuilder.prototype.saveTeam = function () {
        var $currentTeam = $(".current_team"),
            loadedTeam = this.getLoadedTeam(),
            teams, elem;

        if (!$currentTeam.length) {
            this.team = 0;
            this.createTeam(0, loadedTeam, true);
        } else {
            if (this.team === -1) {
                this.team = $currentTeam.data('teamid');
            }

            teams = poStorage('tb.teams', 'object');
            teams[this.team] = loadedTeam;
            poStorage.set('tb.teams', teams);

            this.updateTeamPreview(teams[this.team], $currentTeam);
        }
    };

    Teambuilder.prototype.setGeneration = function (generation) {
        var self = this;
        var numPokes = geninfo.option(generation).num_pokemon;

        // loading the list of pokemon
        var autocompletePokes = [],
            // TODO: Add pokeinfo.excludeFormes back and be able to change formes in some settings menu instead of the autocomplete
            releasedPokes = pokeinfo.releasedList(generation),
            poke;

        for (poke in releasedPokes) {
            autocompletePokes.push({
                label: releasedPokes[poke], // name
                value: +poke
            });
        }

        $(".pokemon-slot-name").autocomplete('option', {
            source: autocompletePokes,
            minLength: 0,
            autoFocus: true
        });

        // settings stats, ivs and evs
        var ivs_limit = geninfo.option(generation).ivs_limit;
        var special_stat_second_id = defaultSettings.special_stat.replace_ids.filter(function (id) {
            return id !== defaultSettings.special_stat.id;
        }).join('');

        if (geninfo.hasOption(generation, 'special_stat')) {
            $(".pokemon-slot-stat-content.stat-id-" + defaultSettings.special_stat.id + " .pokemon-slot-stat-name").html(defaultSettings.special_stat.name);
            $(".pokemon-ivs.stat-id-" + defaultSettings.special_stat.id + " .pokemon-ivs-stat-name").html('<strong>' + (ivs_limit == 15 ? 'DVs' : 'IVs') + '</strong> ' + defaultSettings.special_stat.name + '</span>');
            $(".pokemon-evs.stat-id-" + defaultSettings.special_stat.id + " .pokemon-evs-stat-name").html('<strong>EVs</strong> ' + defaultSettings.special_stat.name + '</span>');
            $(".pokemon-slot-stat-content.stat-id-" + special_stat_second_id + ", .pokemon-ivs.stat-id-" + special_stat_second_id + ", .pokemon-evs.stat-id-" + special_stat_second_id).hide();
        } else {
            $(".pokemon-slot-stat-content.stat-id-" + special_stat_second_id + ", .pokemon-ivs.stat-id-" + special_stat_second_id + ", .pokemon-evs.stat-id-" + special_stat_second_id).show();
        }

        $(".pokemon-ivs-value").val(ivs_limit);
        $(".pokemon-ivs-stat-name strong").html(ivs_limit === 15 ? 'DVs' : 'IVs');
        $(".pokemon-ivs, .pokemon-evs").css('width', (100 / ($(".pokemon-ivs").filter(function () {
            return $(this).css('display') != 'none';
        }).length / $(".pokemon-slot").length)) + '%');

        // shiny helper message
        $(".pokemon-slot-sprite-helper").attr('title', geninfo.hasOption(generation, 'shiny') ? 'Click here to switch between shiny states' : '');

        // loading the list of items
        if (geninfo.hasOption(generation, 'item')) {
            var items = iteminfo.releasedList(generation);
            $('.pokemon-slot-item').reloadCombobox(items, '(No Item)', function (e, ui) {
                var slot = $(e.target).closest('.pokemon-slot');
                var pokemonId = slot.find('.pokemon-slot-name').data('pokemon_id');
                var heldItem = pokeinfo.heldItem(pokemonId);

                if (heldItem && heldItem !== $(e.target).val()) {
                    $('.pokemon-slot-name').eq($(e.target).index('.pokemon-slot-item')).trigger('autocompleteselect', [{
                        item: {
                            label: pokeinfo.name(0),
                            value: 0
                        }
                    }]);
                }
            });
        }

        // editing the settings for knobs
        $(".pokemon-ivs-value").trigger('configure', {
            "max": ivs_limit
        });
        $(".pokemon-ivs-value").val(ivs_limit).trigger('change');
        $(".pokemon-evs-value").val(0).trigger('change');

        // hiding elements that aren't present in this generation and displaying the ones that are so
        var selectors = [],
            hidden_selectors = [];
        var selector, opt;

        for (opt in featureMap) {
            selector = featureMap[opt];
            selectors.push(selector);
            if (!geninfo.hasOption(generation, opt)) {
                hidden_selectors.push(selector);
            }
        }

        $(selectors.join(', ')).show();
        $(hidden_selectors.join(', ')).hide();

        // Remove pokemon out-of-bounds for the given generation
        // TODO: Other generation-specific checks
        var outofbounds = [],
            checkpoke, i;
        for (i = 0; i <= 5; i += 1) {
            checkpoke = $(".pokemon-slot:eq(" + i + ")");
            if (checkpoke.find(".pokemon-slot-name").data('pokemon_id') > numPokes) {
                outofbounds.push(i);
            }
        }

        self.resetPokemon(outofbounds);

        // we reset all the informations in the teambuilder
        //this.resetTeamBuilder();
    };

    Teambuilder.prototype.resetTeamBuilder = function () {
        var self = this;
        $("#tb-team-name, #tb-team-tier-value").val('');

        // making the first tab the one that is active
        $('.pokemon-tab').removeClass('active-pokemon-tab').eq(0).addClass('active-pokemon-tab');
        $('.pokemon-slot').removeClass('active-pokemon-slot').eq(0).addClass('active-pokemon-slot');

        // reseting all 6 pokemon
        self.resetPokemon([0, 1, 2, 3, 4, 5]);
    };

    Teambuilder.prototype.resetPokemon = function (pokemonIndex) {
        var self = this,
            generation = self.getTeamInfo('generation'),
            slot_selectors = [],
            tab_selectors = [];
        var value, len, i;

        pokemonIndex = Array.isArray(pokemonIndex) ? pokemonIndex : [pokemonIndex];
        len = pokemonIndex.length;
        if (len === 0) {
            return;
        }

        for (i = 0; i < len; i += 1) {
            value = pokemonIndex[i];
            slot_selectors.push(".pokemon-slot:eq(" + value + ")");
            tab_selectors.push(".pokemon-tab:eq(" + value + ")");
        }

        var slot = $(slot_selectors.join(', ')),
            tab = $(tab_selectors.join(', '));

        // pokemon icons reset (in tabs)
        var missingno_icon = '<img src="' + defaultSettings.missingno.icon + '" alt="" />Missingno';
        tab.html(missingno_icon);

        // pokemon sprite reset
        slot.find(".pokemon-slot-sprite table img").attr('src', defaultSettings.missingno.sprite);
        slot.find('.pokemon-slot-shiny').prop('checked', false);

        // pokemon name
        slot.find(".pokemon-slot-name").val('Missingno').data('pokemon_id', 0);

        // types
        var types = pokeinfo.types(0, generation);
        slot.find('.pokemon-slot-type-block').html('<span class="pokemon-slot-type type_' + types[0] + '">' + typeinfo.name(types[0]) + '</span>');

        // gender
        slot.find(".pokemon-slot-gender-selection .pokemon-slot-gender-radio[value='" + defaultSettings.gender + "']").val(defaultSettings.gender).trigger('change').parent().hide();

        // pokemon nickname
        slot.find(".pokemon-slot-nickname").val('');

        // hide advanced options
        slot.find(".pokemon-slot-advanced-content").hide();

        // setting level to default
        slot.find(".pokemon-level-value").slider('value', defaultSettings.level);

        // setting happiness to default
        slot.find(".pokemon-happiness-value").slider('value', defaultSettings.happiness);

        // reset IVs
        slot.find(".pokemon-ivs-value").val(geninfo.option(generation).ivs_limit).trigger('change');

        // reset EVs
        slot.find(".pokemon-evs-value").val(0).trigger('change');

        // hidden power reset
        slot.find('.pokemon-slot-hidden-power-type').val(16).combobox('refresh');
        self.recalculateHiddenPowerInfos(pokemonIndex);

        // emptying the ability selection
        slot.find('.pokemon-slot-ability').reloadCombobox({
            0: '(No Ability)'
        }, 0);

        // reset nature
        slot.find('.pokemon-slot-nature').val(0).combobox('refresh');

        // reset item
        slot.find('.pokemon-slot-item').val($(".pokemon-slot-item option:first").val()).combobox('refresh');

        // resetting the moves list
        slot.find('.moves-list-container').html('<table class="moves-list"></table>');

        // emptying move selection inputs
        slot.find('.pokemon-move-selection').val('');

        // We recalculate the stats of the pokemon with the new default infos
        for (i = 0, len = pokemonIndex.length; i < len; i += 1) {
            self.recalculateStats(pokemonIndex[i]);
        }
    };

    Teambuilder.prototype.recalculateStats = function (pokemonIndex) {
        var self = this,
            slot = $(".pokemon-slot").eq(pokemonIndex),
            generation = self.getTeamInfo('generation');

        var stat, max_stat, stat_progress_class_id, stat_ivs, stat_evs, base_stat, nature, stat_percentage;
        var level = parseInt(slot.find(".pokemon-level-value").slider('value'), 10);
        var baseStats = pokeinfo.stats(slot.find(".pokemon-slot-name").data('pokemon_id'), generation);
        var stats_list = self.getGenerationInfo(self.getTeamInfo('generation'), 'stats_list');

        // TODO: Get rid of each here
        $.each(stats_list, function (stat_id, stat_name) {
            stat_ivs = parseInt(slot.find(".pokemon-ivs.stat-id-" + stat_id + " .pokemon-ivs-value").val(), 10);
            stat_evs = parseInt(slot.find(".pokemon-evs.stat-id-" + stat_id + " .pokemon-evs-value").val(), 10);
            stat_ivs = isNaN(stat_ivs) ? 0 : stat_ivs;
            stat_evs = isNaN(stat_evs) ? 0 : stat_evs;
            nature = self.getNatureEffect(slot.find(".pokemon-slot-nature").val(), stat_id);
            base_stat = parseInt(baseStats[stat_id], 10);

            stat = self.calculateStat({
                'stat_id': stat_id,
                'generation': generation,
                'base_stat': base_stat,
                'level': level,
                'nature': nature,
                'stat_ivs': stat_ivs,
                'stat_evs': stat_evs
            });

            slot.find(".pokemon-slot-stat-content.stat-id-" + stat_id + " .pokemon-slot-stat-value").text(stat);

            min_stat = self.calculateStat({
                'stat_id': stat_id,
                'generation': generation,
                'base_stat': base_stat,
                'level': level,
                'nature': 0.9,
                'stat_ivs': 0,
                'stat_evs': 0
            });

            max_stat = self.calculateStat({
                'stat_id': stat_id,
                'generation': generation,
                'base_stat': base_stat,
                'level': level,
                'nature': 1.1,
                'stat_ivs': geninfo.option(generation).ivs_limit,
                'stat_evs': 255
            });

            stat_percentage = Math.floor(((stat - min_stat) / (max_stat - min_stat)) * 100);
            stat_progress_class_id = Math.ceil(stat_percentage / 25);
            slot.find(".pokemon-slot-stat-content.stat-id-" + stat_id + " .pokemon-slot-stat-progress")
                .css('width', stat_percentage + '%')
                .removeClass('pokemon-slot-stat-progress-1x pokemon-slot-stat-progress-2x pokemon-slot-stat-progress-3x pokemon-slot-stat-progress-4x')
                .addClass('pokemon-slot-stat-progress-' + stat_progress_class_id + 'x');
        });
    };

    Teambuilder.prototype.calculateStat = function (infos) {
        if (infos.stat_id == defaultSettings.hp_id) {
            if (infos.generation > 2) {
                return Math.floor(Math.floor((infos.stat_ivs + (2 * infos.base_stat) + Math.floor(infos.stat_evs / 4) + 100) * infos.level) / 100) + 10;
            } else {
                return Math.floor(((infos.stat_ivs + infos.base_stat + Math.sqrt(65535) / 8 + 50) * infos.level) / 50 + 10);
            }
        } else {
            if (infos.generation > 2) {
                return Math.floor(Math.floor(((infos.stat_ivs + (2 * infos.base_stat) + Math.floor(infos.stat_evs / 4)) * infos.level) / 100 + 5) * infos.nature);
            } else {
                return Math.floor(Math.floor((infos.stat_ivs + infos.base_stat + Math.sqrt(65535) / 8) * infos.level) / 50 + 5);
            }
        }
    };

    Teambuilder.prototype.recalculateHiddenPowerInfos = function (pokemonIndex) {
        var self = this,
            slot = $(".pokemon-slot").eq(pokemonIndex),
            generation = self.getTeamInfo('generation'),
            stats_list = self.getGenerationInfo(generation, 'stats_list'),
            ivs = [], id;

        for (id in stats_list) {
            ivs[id] = slot.find(".pokemon-ivs.stat-id-" + id + " .pokemon-ivs-value").val();
        }

        slot.find('.pokemon-slot-hidden-power-type').val(moveinfo.getHiddenPowerType(generation, ivs[0], ivs[1], ivs[2], ivs[3], ivs[4], ivs[5])).combobox('refresh');
        slot.find('.pokemon-slot-hidden-power-bp-value').text(moveinfo.getHiddenPowerBP(generation, ivs[0], ivs[1], ivs[2], ivs[3], ivs[4], ivs[5]));
    };

    Teambuilder.prototype.getTeamInfo = function (info_name) {
        switch (info_name) {
        case 'name':
            return $("#tb-team-name").val();
        case 'tier':
            return $("#tb-team-tier-value").val();
        case 'generation':
            return $("#tb-team-generation-value").val();
        }
    };

    Teambuilder.prototype.getGenerationInfo = function (generation, info_name) {
        var len, i;
        switch (info_name) {
        case 'stats_list':
            if (this._cache['stats_list_gen' + generation]) {
                return this._cache['stats_list_gen' + generation];
            }

            var stats = {},
                statId;

            for (i = 0, len = defaultSettings.stats_ids.length; i < len; i += 1) {
                statId = defaultSettings.stats_ids[i];
                stats[statId] = statinfo.name(statId);
            }

            this._cache['stats_list_gen' + generation] = stats;
            return stats;
        case 'types_list':
            if (this._cache['types_list_gen' + generation]) {
                return this._cache['types_list_gen' + generation];
            }

            var types = geninfo.option(generation).types_ids,
                pairs = {},
                type_id;

            for (i in types) {
                type_id = types[i];
                pairs[type_id] = typeinfo.name(type_id);
            }

            this._cache['types_list_gen' + generation] = pairs;
            return pairs;
        }
    };

    Teambuilder.prototype.getTeamInfos = function () {
        var infos = {};

        infos.name = this.getTeamInfo('name');
        infos.tier = this.getTeamInfo('tier');
        infos.generation = this.getTeamInfo('generation');

        return infos;
    };

    Teambuilder.prototype.getPokemonInfos = function (pokemonIndex) {
        pokemonIndex = Array.isArray(pokemonIndex) ? pokemonIndex : [pokemonIndex];
        var slot, self = this,
            generation = self.getTeamInfo('generation'),
            pokemon = {};

        $.each(pokemonIndex, function (key, index) {
            slot = $(".pokemon-slot").eq(index);
            pokemon[index] = {};

            pokemon[index].pokemonId = slot.find('.pokemon-slot-name').data('pokemon_id');
            pokemon[index].shiny = geninfo.hasOption(generation, 'shiny') ? slot.find('.pokemon-slot-shiny').prop('checked') : false;
            pokemon[index].gender = (geninfo.hasOption(generation, 'gender') && slot.find(".pokemon-slot-gender-selection").css('display') !== 'none') ? slot.find("#" + slot.find('.pokemon-slot-gender-checked').attr('for')).val() : 'neutral';
            pokemon[index].nickname = slot.find('.pokemon-slot-nickname').val();
            pokemon[index].level = slot.find('.pokemon-level-value').slider('value');
            pokemon[index].happiness = geninfo.hasOption(generation, 'happiness') ? slot.find('.pokemon-happiness-value').slider('value') : 0;
            pokemon[index].ivs = {};
            slot.find('.pokemon-ivs-value').each(function () {
                var $this = $(this);
                pokemon[index].ivs[$this.closest('.pokemon-ivs').attr('class').match(/stat-id-[0-9]/g).join('').split('-')[2]] = $this.val();
            });
            pokemon[index].abilityId = geninfo.hasOption(generation, 'ability') ? slot.find('.pokemon-slot-ability').val() : undefined;
            pokemon[index].natureId = geninfo.hasOption(generation, 'nature') ? slot.find('.pokemon-slot-nature').val() : undefined;
            pokemon[index].itemId = geninfo.hasOption(generation, 'item') ? slot.find('.pokemon-slot-item').val() : undefined;
            if (geninfo.hasOption(generation, 'evs')) {
                pokemon[index].evs = {};
                slot.find('.pokemon-evs-value').each(function () {
                    var $this = $(this);
                    pokemon[index].evs[$this.closest('.pokemon-evs').attr('class').match(/stat-id-[0-9]/g).join('').split('-')[2]] = $this.val();
                });
            }
            pokemon[index].movesIds = {};
            slot.find('.pokemon-move-selection').each(function (moveIndex) {
                var moveName = $(this).val();
                pokemon[index].movesIds[moveIndex] = moveinfo.findId(moveName);
            });
        });

        return pokemonIndex.length > 1 ? pokemon : pokemon[pokemonIndex[0]];
    };

    Teambuilder.prototype.getLoadedTeam = function (asString) {
        var team = {};
        team.infos = this.getTeamInfos();
        team.pokemon = this.getPokemonInfos([0, 1, 2, 3, 4, 5]);

        return asString ? JSON.stringify(team) : team;
    };

    Teambuilder.prototype.loadTeamInfos = function (infos) {
        if (infos.name !== undefined) {
            $("#tb-team-name").val(infos.name);
        }

        if (infos.tier !== undefined) {
            $("#tb-team-tier-value").val(infos.tier);
        }

        if (infos.generation !== undefined) {
            $("#tb-team-generation-value").val(infos.generation).combobox('select').combobox('refresh');
        }
    };

    Teambuilder.prototype.loadPokemonInfos = function (pokemonIndex, infos) {
        var slot, self = this,
            generation = self.getTeamInfo('generation'),
            data, pokemon = {};
        var key, len, index;

        pokemonIndex = Array.isArray(pokemonIndex) ? pokemonIndex : [pokemonIndex];

        for (index = 0, len = pokemonIndex.length; index < len; index += 1) {
            key = pokemonIndex[index];

            slot = $(".pokemon-slot").eq(index);
            data = pokemonIndex.length > 1 ? (infos[index] ? infos[index] : {
                pokemonId: 0
            }) : infos;

            if (data.pokemonId !== undefined) {
                slot.find('.pokemon-slot-name').trigger('autocompleteselect', [{
                    item: {
                        label: pokeinfo.name(data.pokemonId),
                        value: data.pokemonId
                    }
                }]);
            }

            if (geninfo.hasOption(generation, 'shiny') && data.shiny !== undefined && slot.find('.pokemon-slot-shiny').prop('checked') != data.shiny) {
                slot.find('.pokemon-slot-sprite').trigger('click');
            }

            if (geninfo.hasOption(generation, 'gender') && data.gender !== undefined) {
                if (data.gender == 'neutral') {
                    slot.find('.pokemon-slot-gender-selection').hide();
                } else {
                    slot.find('.pokemon-slot-gender-radio[value="' + data.gender + '"]').trigger('change');
                }
            }

            if (data.nickname !== undefined) {
                slot.find('.pokemon-slot-nickname').val(data.nickname);
            }

            if (data.level !== undefined) {
                slot.find('.pokemon-level-value').slider('value', data.level);
            }

            if (data.happiness !== undefined) {
                slot.find('.pokemon-happiness-value').slider('value', data.happiness);
            }

            if (data.ivs !== undefined) {
                // TODO: Get rid of each here
                $.each(data.ivs, function (stat_id, value) {
                    slot.find('input[name="pokemon-slot-ivs-' + stat_id + '"]').val(value).trigger('change').trigger('keyup');
                });
            }

            if (geninfo.hasOption(generation, 'ability') && data.abilityId !== undefined) {
                slot.find('.pokemon-slot-ability').val(data.abilityId).combobox('refresh');
            }

            if (geninfo.hasOption(generation, 'nature') && data.natureId !== undefined) {
                slot.find('.pokemon-slot-nature').val(data.natureId).combobox('select').combobox('refresh');
            }

            if (geninfo.hasOption(generation, 'evs') && data.evs !== undefined) {
                // TODO: Get rid of each here
                $.each(data.evs, function (stat_id, value) {
                    slot.find('input[name="pokemon-slot-evs-' + stat_id + '"]').val(value).trigger('change').trigger('keyup');
                });
            }

            if (data.movesIds !== undefined) {
                // TODO: Get rid of each here
                $.each(data.movesIds, function (moveIndex, move_id) {
                    if (move_id !== 0 && moveinfo.hasMove(move_id)) {
                        slot.find('.pokemon-move-selection').eq(moveIndex).val(moveinfo.name(move_id));
                    }
                });
            }

            if (geninfo.hasOption(generation, 'item') && data.itemId !== undefined) {
                slot.find('.pokemon-slot-item').val(data.itemId).combobox('select').combobox('refresh');
            }
        }
    };

    Teambuilder.prototype.loadTeam = function (team) {
        team = !$.isPlainObject(team) ? JSON.parse(team) : team;
        this.loadTeamInfos(team.infos);
        this.loadPokemonInfos([0, 1, 2, 3, 4, 5], team.pokemon);
    };

    Teambuilder.prototype.getNatureEffect = function (nature_id, stat_id) {
        var arr = {
            0: 0,
            1: 1,
            2: 2,
            3: 4,
            4: 5,
            5: 3
        };

        return (10 + (-(nature_id % 5 == arr[stat_id] - 1) + (Math.floor(nature_id / 5) == arr[stat_id] - 1))) / 10;
    };

    Teambuilder.prototype.getCorrectEVs = function (evs_element) {
        var total_evs = 0, val;
        evs_element.closest('.pokemon-evs-selectors').find('.pokemon-evs-value').each(function () {
            val = parseInt(this.value, 10);
            if (!isNaN(val)) {
                total_evs += val;
            }
        });

        if (total_evs > 510) {
            var remaining_evs = 510 - (total_evs - evs_element.val());
            return remaining_evs - (remaining_evs % 4);
        } else {
            return evs_element.val();
        }
    };

    Teambuilder.prototype.getTiersList = function (list) {
        var self = this,
            tiers = [];
        var tier, name, i, j;
        list = list || (window.tiersList ? window.tiersList : {});

        for (i in list) {
            tier = list[i];
            if (!tier.tiers) {
                continue;
            }

            for (j in tier.tiers) {
                name = tier.tiers[j];
                if ($.isPlainObject(name)) {
                    tiers = tiers.concat(self.getTiersList([name]));
                } else {
                    tiers.push(name);
                }
            }
        }

        return tiers;
    };

    // Crankshaft does not optimize try-catch,
    // however by separating it to a different function the main function can still be JIT'd
    Teambuilder.prototype.loadTeamObject = function (teamId) {
        var teamObj;
        try {
            teamObj = poStorage.get('tb.teams', 'object')[teamId];
        } catch (ex) {
            teamObj = null;
            console.error('Could not load team ' + teamId + '.', ex);
        }

        return teamObj;
    };

    // Accepts a jQuery element or number
    Teambuilder.prototype.loadTeamFrom = function (element, activeTeam) {
        var teamId = (element.data ? element.data('teamid') : element);
        var teamObj = this.loadTeamObject(teamId);

        this.team = teamId;
        if (!teamObj) {
            teamObj = {
                infos: {
                    tier: 'Challenge Cup',
                    name: 'Unnamed',
                    generation: 6
                },
                pokemon: {
                    '0': {pokemonId: 0},
                    '1': {pokemonId: 0},
                    '2': {pokemonId: 0},
                    '3': {pokemonId: 0},
                    '4': {pokemonId: 0},
                    '5': {pokemonId: 0}
                }
            };

            this.createTeam(teamId, teamObj, activeTeam);
        }

        this.loadTeam(teamObj);
    };

    Teambuilder.prototype.loadTeamPreviews = function () {
        var teamsHtml = $($.parseHTML($("#template_team_preview").html())[1]),
            $container = $("#team_previews"),
            teams = poStorage.get('tb.teams', 'object'),
            team, firstNode, elem;

        $container.empty();
        for (team in teams) {
            elem = teamsHtml.clone();
            elem.data('teamid', team);

            this.updateTeamPreview(teams[team], elem);
            $container.append(elem);

            if (!firstNode) {
                firstNode = elem;
            }
        }

        if (firstNode) {
            firstNode.addClass("current_team");
        }
    };

    Teambuilder.prototype.updateTeamPreview = function (teamObj, elem) {
        var images = elem.find("img");

        images.each(function (i) {
            var poke = teamObj.pokemon[i];
            if (!poke) {
                return;
            }

            $(this).attr("src", pokeinfo.icon(poke.pokemonId));
        });

        if (teamObj.infos.tier) {
            elem.find(".team_tier").text(teamObj.infos.tier);
        }
    };

    Teambuilder.prototype.freeTeamId = function () {
        var teams = poStorage('tb.teams', 'object'),
            teamId = 0;

        while (teams.hasOwnProperty(teamId)) {
            teamId += 1;
        }

        return teamId;
    };

    Teambuilder.prototype.createTeam = function (teamId, teamObj, activeTeam) {
        var elem = $($.parseHTML($("#template_team_preview").html())[1]),
            teams = poStorage('tb.teams', 'object');

        teams[teamId] = teamObj;
        poStorage.set('tb.teams', teams);

        elem.data('teamid', teamId);

        if (activeTeam) {
            $(".current_team").removeClass("current_team");
            elem.addClass('current_team');
        }

        this.updateTeamPreview(teamObj, elem);
        $("#team_previews").append(elem);
        return elem;
    };

    poStorage.init('tb.teams', '{}');
    Teambuilder.defaultSettings = defaultSettings;
    webclient.teambuilder = new Teambuilder();
    webclient.classes.Teambuilder = Teambuilder;
}(webclient, poStorage));

$(function () {
    $("#team_previews").on("click", ".team_preview_team_options", function (e) {
        var $teamPreview = $(this).parent().parent().parent();

        e.stopPropagation();

        // Click on the team preview div, opening the teambuilder and the team
        // Only do this if it isn't the loaded team
        if (webclient.teambuilder.team !== $teamPreview.data('teamid')) {
            $teamPreview.click();
        }

        $("#pokemon-parameters .fa-gear").click();
    });

    $("#team_previews").on("click", ".team_preview_delete_team", function (e) {
        var $teamPreview = $(this).parent().parent().parent(),
            teamId = $teamPreview.data('teamid');

        e.stopPropagation();

        vex.dialog.confirm({
            message: 'Are you sure you want to delete this team?',
            callback: function (yes) {
                var teams, team = null;

                if (yes) {
                    teams = poStorage('tb.teams', 'object');

                    // Load the first possible team
                    for (team in teams) {
                        webclient.teambuilder.loadTeamFrom(team);
                        break;
                    }

                    // If there are no other teams, load the default one.
                    if (team === null) {
                        webclient.teambuilder.loadTeamFrom(0);
                    }

                    // Delete old team
                    delete teams[teamId];
                    poStorage.set('tb.teams', teams);

                    // Close teambuilder view
                    $("#po_title").click();

                    // Re-render team previews
                    webclient.teambuilder.loadTeamPreviews();
                }
            }
        });
    });
});
