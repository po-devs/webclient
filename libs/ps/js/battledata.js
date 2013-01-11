/*

License: GPLv2
  <http://www.gnu.org/licenses/gpl-2.0.html>

*/

if (!window.exports) window.exports = window;

// todo: http://www.youtube.com/watch?v=eEwAPnIev38
// 32.930 - 1:13.032
// 32930 to 73032
// subway
// 1:33.120 - 3:08.614
/* 

// PO importer

text = $('textarea')[1].value
text = text.split("\n");

for (var i=0; i<text.length; i++)
{
	var line = text[i].split(' ');
	if (!text[i].length) continue;
	if (!exports.BattleLearnsets[POPokemon[line[0]].replace(/ /g,'')])
	{
		exports.BattleLearnsets[POPokemon[line[0]].replace(/ /g,'')] = {};
	}
	var poke = exports.BattleLearnsets[POPokemon[line[0]].replace(/ /g,'')];
	for (var j=1; j<line.length; j++)
	{
		if (!poke.learnset) poke.learnset = {};
		var move = POMoves[line[j]].replace(/ /g,'');
		poke.learnset[move] = '4M';
	}
}

*/

var colorCache = {};

function hashColor(name) {
	if (colorCache[name]) return colorCache[name];
	
	var hash = MD5(name);
	var H = parseInt(hash.substr(4, 4), 16) % 360;
	var S = parseInt(hash.substr(0, 4), 16) % 50 + 50;
	var L = parseInt(hash.substr(8, 4), 16) % 20 + 25;
	colorCache[name] = "color:hsl(" + H + "," + S + "%," + L + "%);";
	return colorCache[name];
}

// a few library functions
function sanitize(str, jsEscapeToo) {
	str = (str?''+str:'');
	str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	if (jsEscapeToo) str = str.replace(/'/g, '\\\'');
	return str;
}
function jsEscape(str) {
	str = (str?''+str:'');
	str = str.replace(/'/g, '\\\'');
	return str;
}

function messageSanitize(str) {
	return sanitize(str).replace(/\`\`([^< ]([^<`]*?[^< ])?)\`\`/g, '<code>$1</code>').replace(/\~\~([^< ]([^<]*?[^< ])?)\~\~/g, '<s>$1</s>').replace(/(https?\:\/\/[a-z0-9-.]+(\/([^\s]*[^\s?.,])?)?|[a-z0-9]([a-z0-9-\.]*[a-z0-9])?\.(com|org|net|edu|tk)((\/([^\s]*[^\s?.,])?)?|\b))/ig, '<a href="$1" target="_blank">$1</a>').replace(/<a href="([a-z]*[^a-z:])/g, '<a href="http://$1').replace(/(\bgoogle ?\[([^\]<]+)\])/ig, '<a href="http://www.google.com/search?ie=UTF-8&q=$2" target="_blank">$1</a>').replace(/(\bgl ?\[([^\]<]+)\])/ig, '<a href="http://www.google.com/search?ie=UTF-8&btnI&q=$2" target="_blank">$1</a>').replace(/(\bwiki ?\[([^\]<]+)\])/ig, '<a href="http://en.wikipedia.org/w/index.php?title=Special:Search&search=$2" target="_blank">$1</a>').replace(/\[\[([^< ]([^<`]*?[^< ])?)\]\]/ig, '<a href="http://www.google.com/search?ie=UTF-8&btnI&q=$1" target="_blank">$1</a>').replace(/\_\_([^< ]([^<]*?[^< ])?)\_\_/g, '<i>$1</i>').replace(/\*\*([^< ]([^<]*?[^< ])?)\*\*/g, '<b>$1</b>');
}

function toId(text) {
	text = text || '';
	if (typeof text === 'number') text = ''+text;
	if (typeof text !== 'string') return toId(text && text.id);
	return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function toUserid(text) {
	text = text || '';
	if (typeof text === 'number') text = ''+text;
	if (typeof text !== 'string') return ''; //???
	return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// miscellaneous things too minor to deserve their own resource file
var BattleNatures = {
	Adamant: {
		plus: 'atk',
		minus: 'spa'
	},
	Bashful: {},
	Bold: {
		plus: 'def',
		minus: 'atk'
	},
	Brave: {
		plus: 'atk',
		minus: 'spe'
	},
	Calm: {
		plus: 'spd',
		minus: 'atk'
	},
	Careful: {
		plus: 'spd',
		minus: 'spa'
	},
	Docile: {},
	Gentle: {
		plus: 'spd',
		minus: 'def'
	},
	Hardy: {},
	Hasty: {
		plus: 'spe',
		minus: 'def'
	},
	Impish: {
		plus: 'def',
		minus: 'spa'
	},
	Jolly: {
		plus: 'spe',
		minus: 'spa'
	},
	Lax: {
		plus: 'def',
		minus: 'spd'
	},
	Lonely: {
		plus: 'atk',
		minus: 'def'
	},
	Mild: {
		plus: 'spa',
		minus: 'def'
	},
	Modest: {
		plus: 'spa',
		minus: 'atk'
	},
	Naive: {
		plus: 'spe',
		minus: 'spd'
	},
	Naughty: {
		plus: 'atk',
		minus: 'spd'
	},
	Quiet: {
		plus: 'spa',
		minus: 'spe'
	},
	Quirky: {},
	Rash: {
		plus: 'spa',
		minus: 'spd'
	},
	Relaxed: {
		plus: 'def',
		minus: 'spe'
	},
	Sassy: {
		plus: 'spd',
		minus: 'spe'
	},
	Serious: {},
	Timid: {
		plus: 'spe',
		minus: 'atk'
	}
};
var StatIDs = {
	HP: 'hp',
	hp: 'hp',
	Atk: 'atk',
	atk: 'atk',
	Def: 'def',
	def: 'def',
	SpA: 'spa',
	SAtk: 'spa',
	SpAtk: 'spa',
	spa: 'spa',
	SpD: 'spd',
	SDef: 'spd',
	SpDef: 'spd',
	spd: 'spd',
	Spe: 'spe',
	Spd: 'spe',
	spe: 'spe'
};
var POStatNames = { // PO style
	hp: 'HP',
	atk: 'Atk',
	def: 'Def',
	spa: 'SAtk',
	spd: 'SDef',
	spe: 'Spd',
    /* improper style go */
    nums: {
        0: "hp",
        1: "atk",
        2: "def",
        3: "spa",
        4: "spd",
        5: "spe",
        6: "accuracy",
        7: "evasion"
    }
};
var StatNames = { // proper style
	hp: 'HP',
	atk: 'Atk',
	def: 'Def',
	spa: 'SpA',
	spd: 'SpD',
	spe: 'Spe'
};

var basespecieschart = {
	'unown': 1,
	'castform': 1,
	'deoxys': 1,
	'burmy': 1,
	'wormadam': 1,
	'cherrim': 1,
	'shellos': 1,
	'gastrodon': 1,
	'rotom': 1,
	'giratina': 1,
	'arceus': 1,
	'shaymin': 1,
	'basculin': 1,
	'darmanitan': 1,
	'deerling': 1,
	'sawsbuck': 1,
	'meloetta': 1,
	'genesect': 1,
	'tornadus': 1,
	'thundurus': 1,
	'landorus': 1,
	'kyurem': 1,
	'keldeo': 1
};

var Tools = {
	
	getEffect: function(effect) {
		if (!effect || typeof effect === 'string') {
			var name = $.trim(effect||'');
			if (name.substr(0,5) === 'item:') {
				return Tools.getItem(name.substr(5));
			} else if (name.substr(0,8) === 'ability:') {
				return Tools.getAbility(name.substr(8));
			} else if (name.substr(0,5) === 'move:') {
				return Tools.getMove(name.substr(5));
			}
			var id = toId(name);
			effect = {};
			if (id && window.BattleStatuses && BattleStatuses[id]) {
				effect = BattleStatuses[id];
				effect.exists = true;
			} else if (id && window.BattleMovedex && BattleMovedex[id] && BattleMovedex[id].effect) {
				effect = BattleMovedex[id].effect;
				effect.exists = true;
			} else if (id && window.BattleAbilities && BattleAbilities[id] && BattleAbilities[id].effect) {
				effect = BattleAbilities[id].effect;
				effect.exists = true;
			} else if (id && window.BattleItems && BattleItems[id] && BattleItems[id].effect) {
				effect = BattleItems[id].effect;
				effect.exists = true;
			} else if (id && window.BattleFormats && BattleFormats[id]) {
				effect = BattleFormats[id];
				effect.exists = true;
				if (!effect.effectType) effect.effectType = 'Format';
			} else if (id === 'recoil') {
				effect = {
					effectType: 'Recoil'
				};
				effect.exists = true;
			} else if (id === 'drain') {
				effect = {
					effectType: 'Drain'
				};
				effect.exists = true;
			}
			if (!effect.id) effect.id = id;
			if (!effect.name) effect.name = name;
			if (!effect.category) effect.category = 'Effect';
			if (!effect.effectType) effect.effectType = 'Effect';
		}
		return effect;
	},

	getMove: function(move) {
		if (!move || typeof move === 'string') {
			var name = $.trim(move||'');
			var id = toId(name);
			move = (window.BattleMovedex && window.BattleMovedex[id]) || {};
			if (move.name) move.exists = true;
			
			if (!move.id) move.id = id;
			if (!move.name) move.name = name;
			
			if (!move.critRatio) move.critRatio = 1;
			if (!move.baseType) move.baseType = move.type;
			if (!move.effectType) move.effectType = 'Move';
			if (!move.secondaries && move.secondary) move.secondaries = [move.secondary];
			
			if (!move.anim) move.anim = BattleOtherAnims.attack.anim;
			$.extend(move, BattleMoveAnims[move.id]);
		}
		return move;
	},

	getItem: function(item) {
		if (!item || typeof item === 'string') {
			var name = $.trim(item||'');
			var id = toId(name);
			item = (window.BattleItems && window.BattleItems[id]) || {};
			if (item.name) item.exists = true;
			if (!item.id) item.id = id;
			if (!item.name) item.name = name;
			if (!item.category) item.category = 'Effect';
			if (!item.effectType) item.effectType = 'Item';
		}
		return item;
	},

	getAbility: function(ability) {
		if (!ability || typeof ability === 'string') {
			var name = $.trim(ability||'');
			var id = toId(name);
			ability = (window.BattleAbilities && window.BattleAbilities[id]) || {};
			if (ability.name) ability.exists = true;
			if (!ability.id) ability.id = id;
			if (!ability.name) ability.name = name;
			if (!ability.category) ability.category = 'Effect';
			if (!ability.effectType) ability.effectType = 'Ability';
		}
		return ability;
	},

	getTemplate: function(template) {
		if (!template || typeof template === 'string') {
			var name = template;
			var id = toId(name);
			if (window.BattleAliases && BattleAliases[id]) {
				name = BattleAliases[id];
				id = toId(name);
			}
			if (!window.BattlePokedex) window.BattlePokedex = {};
			if (!window.BattlePokedex[id]) {
				template = window.BattlePokedex[id] = {};
				for (var k in basespecieschart) {
					if (id.length > k.length && id.substr(0, k.length) === k) {
						template.basespecies = k;
						template.forme = id.substr(k.length);
					}
				}
				template.exists = false;
			}
			template = window.BattlePokedex[id];
			if (template.exists === undefined) template.exists = true;
			if (window.BattleFormatsData && window.BattleFormatsData[id]) {
				template.tier = window.BattleFormatsData[id].tier;
				template.isNonstandard = window.BattleFormatsData[id].isNonstandard;
			}
			if (window.BattleLearnsets && window.BattleLearnsets[id]) {
				template.learnset = window.BattleLearnsets[id].learnset;
			}
			if (!template.id) template.id = id;
			if (!template.name) template.name = name;
			if (!template.speciesid) template.speciesid = id;
			if (!template.species) template.species = name;
			if (!template.basespecies) template.basespecies = name;
			if (!template.forme) template.forme = '';
			if (!template.formeletter) template.formeletter = '';
			if (!template.spriteid) template.spriteid = toId(template.basespecies)+(template.basespecies!==name?'-'+toId(template.forme):'');
		}
		return template;
	},

	getLearnset: function(template) {
		template = Tools.getTemplate(template);
		var alreadyChecked = {};
		var learnset = {};
		do {
			alreadyChecked[template.speciesid] = true;
			if (template.learnset) {
				for (var l in template.learnset) {
					learnset[l] = template.learnset[l];
				}
			}
			if (template.speciesid === 'shaymin') {
				template = Tools.getTemplate('shayminsky');
			} else if (template.basespecies !== template.species) {
				template = Tools.getTemplate(template.basespecies);
			} else {
				template = Tools.getTemplate(template.prevo);
			}
		} while (template && template.species && !alreadyChecked[template.speciesid]);
		return learnset;
	},
	
	getSpriteData: function(pokemon, siden) {
        /*** PO change ***/
        var sub = pokemon === "substitute";
		pokemon = Tools.getTemplate(pokemon);
        var padd = function(num) {return ("00"+num).slice(-3);};
		var isBack = !siden;
		var back = (siden?'':'back/');
        var shiny = pokemon.shiny ? "shiny/" : "";
        var facing = (siden?'front':'back');
        var female = (pokemon.speciesid in BattlePokemonSprites) && BattlePokemonSprites[pokemon.speciesid][facing]['anif'] && pokemon.gender === 'F' ? "female/":"";
		var cryurl = '';
        /*** PO change ***/
        var forme = '';
        if (pokemon.forme && pokemon.num in exports.BattlePokedex.nums.formes) {
            var index = exports.BattlePokedex.nums.formes[pokemon.num].split(" ").indexOf(pokemon.forme.toLowerCase());
            if (index != 0 && index != -1) {
                forme = "-"+index;
            }
        }
		var spriteid = pokemon.spriteid;
        /*** PO change ***/
        if (sub) {
            pokemon.num = "substitute";
        }
		if (window.BattlePokemonSprites && BattlePokemonSprites[pokemon.speciesid]) {
			var num = '' + BattlePokemonSprites[pokemon.speciesid].num;
			if (num.length < 3) num = '0' + num;
			if (num.length < 3) num = '0' + num;
			cryurl = '/audio/cries/' + num + '.wav';
		}
		if (window.BattlePokemonSprites && BattlePokemonSprites[pokemon.speciesid] && BattlePokemonSprites[pokemon.speciesid][facing]) {
			var url = 'http://pokemon-online.eu/images/pokemon/black-white/animated/'+ back + shiny + female + padd(pokemon.num) + forme + '.gif';
			var spriteType = 'ani';

			return {
				w: BattlePokemonSprites[pokemon.speciesid][facing][spriteType].w,
				h: BattlePokemonSprites[pokemon.speciesid][facing][spriteType].h,
				url: url,
				cryurl: cryurl,
				isBackSprite: isBack,
				shiny: pokemon.shiny
			};
		}
		return {
			w: 96,
			h: 96,
			url: 'http://pokemon-online.eu/images/pokemon/black-white/'+ back + shiny + pokemon.num + forme + '.png',
			cryurl: cryurl,
			isBackSprite: isBack
		};
        return 'background-image:url(http://pokemon-online.eu/images/pokemon/black-white/'+shiny+pokemon.num + forme +'.png)';
	},

	getIcon: function(pokemon) {
		var num = 0;
		if (pokemon === 'pokeball') {
			return 'background:transparent url(libs/ps/sprites/bwicons-pokeball-sheet.png) no-repeat scroll -0px -0px';
		} else if (pokemon === 'pokeball-statused') {
			return 'background:transparent url(libs/ps/sprites/bwicons-pokeball-sheet.png) no-repeat scroll -32px -0px';
		} else if (pokemon === 'pokeball-none') {
			return 'background:transparent url(libs/ps/sprites/bwicons-pokeball-sheet.png) no-repeat scroll -64px -0px';
		}
		var id = toId(pokemon);
		if (pokemon && pokemon.species) id = toId(pokemon.species);
		if (pokemon && pokemon.volatiles && pokemon.volatiles.formechange && !pokemon.volatiles.transform) id = toId(pokemon.volatiles.formechange[2]);
		if (pokemon && pokemon.num) num = pokemon.num;
		else if (BattlePokemonSprites[id] && BattlePokemonSprites[id].num) num = BattlePokemonSprites[id].num;
		else if (exports.BattlePokedex[id] && exports.BattlePokedex[id].num) num = exports.BattlePokedex[id].num;
		if (num < 0) num = 0;
		/*var altNums = {
			"rotomfan": 699,
			"rotomfrost": 700,
			"rotomheat": 701,
			"rotommow": 702,
			"rotomwash": 703,
			"giratinaorigin": 705,
			"shayminsky": 707,
			"basculinbluestriped": 709,
			"darmanitanzen": 712,
			"deoxysattack": 683,
			"deoxysdefense": 684,
			"deoxysspeed": 686,
			"wormadamsandy": 691,
			"wormadamtrash": 692,
			"cherrimsunshine": 694,
			"castformrainy": 680,
			"castformsnowy": 681,
			"castformsunny": 682,
			"meloettapirouette": 724,
			"tornadustherian": 736,
			"thundurustherian": 737,
			"landorustherian": 738,
			"kyuremblack": 739,
			"kyuremwhite": 740,
			"keldeoresolution": 741
		};
		if (altNums[id]) {
			num = altNums[id];
		}

		if (pokemon && pokemon.gender === 'F') {
			if (id === 'unfezant') num = 708;
			else if (id === 'frillish') num = 721;
			else if (id === 'jellicent') num = 722;
		}*/

		var fainted = (pokemon && pokemon.fainted?';opacity:.4':'');
		return 'background:transparent url(http://pokemon-online.eu/images/poke_img/' + num + '.png) no-repeat ' + fainted;
	},

	getTeambuilderSprite: function(pokemon) {
		if (!pokemon) return '';
		var id = toId(pokemon);
		if (pokemon.spriteid) id = pokemon.spriteid;
		if (pokemon.species && !id) {
			var template = Tools.getTemplate(pokemon.species);
			if (template.spriteid) {
				id = template.spriteid;
			} else {
				id = toId(pokemon.species);
			}
		}
		var shiny = (pokemon.shiny?'shiny/':'');
		if (BattlePokemonSprites && BattlePokemonSprites[id] && BattlePokemonSprites[id].front && BattlePokemonSprites[id].front.anif && pokemon.gender === 'F') {
			//id+='-f';
		}
		return 'background-image:url(http://pokemon-online.eu/images/pokemon/black-white/'+shiny+id+'.png)';
	},

	getItemIcon: function(item) {
		var num = 0;
		if (typeof item === 'string' && exports.BattleItems) item = exports.BattleItems[toId(item)];
		if (item && item.spritenum) num = item.spritenum;

		var top = Math.floor(num / 16) * 24;
		var left = (num % 16) * 24;
		return 'background:transparent url(libs/ps/sprites/itemicons-sheet.png) no-repeat scroll -' + left + 'px -' + top + 'px';
	},

	getTypeIcon: function(type, b) { // b is just for utilichart.js
		sanitizedType = type.replace(/\?/g,'%3f');
		return '<img src="libs/ps/sprites/types/'+sanitizedType+'.png" alt="'+type+'" height="14" width="32"'+(b?' class="b"':'')+' />';
	},

    getSpecies: function(num, forme) {
        var res = exports.BattlePokedex.nums[num];
        if (forme && (num in exports.BattlePokedex.nums.formes)) {
            var formes = exports.BattlePokedex.nums.formes[num].split(" ");
            if (forme < formes.length) {
                res += "-"+formes[forme].tu();
            }
        }
        return res;
    },

    getMoveName: function(num) {
        return exports.BattleMovedex.nums[num];
    },

    getStatName : function (num) {
        return POStatNames.nums[num];
    },

    getItemName : function(num) {
        return exports.BattleItems.nums[num];
    },

    getTypeName : function(num) {
        /* inefficient but w/e */
        var types = [
            "Normal",
            "Fighting",
            "Flying",
            "Poison",
            "Ground",
            "Rock",
            "Bug",
            "Ghost",
            "Steel",
            "Fire",
            "Water",
            "Grass",
            "Electric",
            "Psychic",
            "Ice",
            "Dragon",
            "Dark",
            "???"
        ];
        return types[num];
    },

    getAbilityName : function(num) {
        return exports.BattleAbilities.nums[num]
    }
};
