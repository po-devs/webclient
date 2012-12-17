exports.BattleItems = {
	"absorbbulb": {
		id: "absorbbulb",
		name: "Absorb Bulb",
		spritenum: 2,
		fling: {
			basePower: 30
		},
		onAfterDamage: function(damage, target, source, move) {
			if (move.type === 'Water' && target.useItem()) {
				this.boost({spa: 1});
			}
		},
		desc: "Boosts Special Attack of holder if hit by a Water-type attack. One-time use."
	},
	"adamantorb": {
		id: "adamantorb",
		name: "Adamant Orb",
		spritenum: 4,
		fling: {
			basePower: 60
		},
		onBasePower: function(basePower, user, target, move) {
			if (move && user.template.species === 'Dialga' && (move.type === 'Steel' || move.type === 'Dragon')) {
				return basePower * 1.2;
			}
		},
		desc: "Hold item which raises power of Dialga's STAB moves 20%."
	},
	"aguavberry": {
		id: "aguavberry",
		name: "Aguav Berry",
		spritenum: 5,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Dragon"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/2) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.heal(pokemon.maxhp/8);
			if (pokemon.getNature().minus === 'spd') {
				pokemon.addVolatile('confusion');
			}
		},
		desc: "Restores 1\/8 max HP when at 50% HP or less. May confuse. One-time use."
	},
	"airballoon": {
		id: "airballoon",
		name: "Air Balloon",
		spritenum: 6,
		desc: "Makes the holder immune to Ground-type attacks. Disappears when holder is hit.",
		fling: {
			basePower: 10
		},
		onStart: function(target) {
			this.add('-item', target, 'Air Balloon');
		},
		onImmunity: function(type) {
			if (type === 'Ground') return false;
		},
		onAfterDamage: function(damage, target, source, effect) {
			this.debug('effect: '+effect.id);
			if (effect.effectType === 'Move') {
				this.add('-enditem', target, 'Air Balloon');
				target.setItem('');
			}
		},
		onAfterSubDamage: function(damage, target, source, effect) {
			this.debug('effect: '+effect.id);
			if (effect.effectType === 'Move') {
				this.add('-enditem', target, 'Air Balloon');
				target.setItem('');
			}
		}
	},
	"apicotberry": {
		id: "apicotberry",
		name: "Apicot Berry",
		spritenum: 10,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Ground"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/4|| (pokemon.hp <= pokemon.maxhp/2 && pokemon.ability === 'gluttony')) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.boost({spd:1});
		},
		desc: "Raises Special Defense by one stage when at 25% HP or less. One-time use."
	},
	"armorfossil": {
		id: "armorfossil",
		name: "Armor Fossil",
		spritenum: 12,
		fling: {
			basePower: 100
		},
		desc: "Can be revived into Shieldon."
	},
	"aspearberry": {
		id: "aspearberry",
		name: "Aspear Berry",
		spritenum: 13,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Ice"
		},
		onUpdate: function(pokemon) {
			if (pokemon.status === 'frz') {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			if (pokemon.status === 'frz') {
				pokemon.cureStatus();
			}
		},
		desc: "Cures freeze. One-time use."
	},
	"babiriberry": {
		id: "babiriberry",
		name: "Babiri Berry",
		spritenum: 17,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Steel"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Steel' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Steel-type attack by 50%. Consumed after use."
	},
	"belueberry": {
		id: "belueberry",
		name: "Belue Berry",
		spritenum: 21,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Electric"
		},
		desc: "No use. Unobtainable in BW."
	},
	"berryjuice": {
		id: "berryjuice",
		name: "Berry Juice",
		spritenum: 22,
		fling: {
			basePower: 30
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/2) {
				if (pokemon.useItem()) {
					this.heal(20);
				}
			}
		},
		desc: "Restores 20 HP when at 50% HP or less. One-time use."
	},
	"bigroot": {
		id: "bigroot",
		name: "Big Root",
		spritenum: 29,
		fling: {
			basePower: 10
		},
		onTryHealPriority: 1,
		onTryHeal: function(damage, target, source, effect) {
			var heals = {drain: 1, leechseed: 1, ingrain: 1, aquaring: 1};
			if (heals[effect.id]) {
				return Math.ceil((damage * 1.3) - 0.5); // Big Root rounds half down
			}
		},
		desc: "Increases HP gained from draining moves by 30%."
	},
	"bindingband": {
		id: "bindingband",
		name: "Binding Band",
		spritenum: 31,
		fling: {
			basePower: 30
		},
		// implemented in statuses
		desc: "Increases power of multi-turn trapping moves."
	},
	"blackbelt": {
		id: "blackbelt",
		name: "Black Belt",
		spritenum: 32,
		fling: {
			basePower: 30
		},
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Fighting') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Fighting-type moves 20%."
	},
	"blacksludge": {
		id: "blacksludge",
		name: "Black Sludge",
		spritenum: 34,
		fling: {
			basePower: 30
		},
		onResidualOrder: 5,
		onResidualSubOrder: 2,
		onResidual: function(pokemon) {
			if (pokemon.hasType('Poison')) {
				this.heal(pokemon.maxhp/16);
			} else {
				this.damage(pokemon.maxhp/8);
			}
		},
		desc: "Recovers 1\/16 HP each turn for Poison types. Damages all other types."
	},
	"blackglasses": {
		id: "blackglasses",
		name: "BlackGlasses",
		spritenum: 35,
		fling: {
			basePower: 30
		},
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Dark') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Dark-type moves 20%."
	},
	"blukberry": {
		id: "blukberry",
		name: "Bluk Berry",
		spritenum: 44,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Fire"
		},
		desc: "No use. Unobtainable in BW."
	},
	"brightpowder": {
		id: "brightpowder",
		name: "BrightPowder",
		spritenum: 51,
		fling: {
			basePower: 10
		},
		onSourceModifyMove: function(move) {
			if (typeof move.accuracy !== 'number') return;
			this.debug('brightpowder - decreasing accuracy');
			move.accuracy *= 0.9;
		},
		desc: "Raises evasion 10%."
	},
	"buggem": {
		id: "buggem",
		name: "Bug Gem",
		spritenum: 53,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Bug') {
				if (user.useItem(user, move)) {
					this.add('-enditem', user, 'Bug Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Bug-type move by 50%. One-time use."
	},
	"burndrive": {
		id: "burndrive",
		name: "Burn Drive",
		spritenum: 54,
		fling: {
			basePower: 70
		},
		onDrive: 'Fire',
		desc: "Changes the type of Techno Blast to Fire."
	},
	"cellbattery": {
		id: "cellbattery",
		name: "Cell Battery",
		spritenum: 60,
		fling: {
			basePower: 30
		},
		onAfterDamage: function(damage, target, source, move) {
			if (move.type === 'Electric' && target.useItem()) {
				this.boost({atk: 1});
			}
		},
		desc: "Boosts Attack of holder if hit by an Electric-type attack. One-time use."
	},
	"charcoal": {
		id: "charcoal",
		name: "Charcoal",
		spritenum: 61,
		fling: {
			basePower: 30
		},
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Fire') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Fire-type moves 20%."
	},
	"chartiberry": {
		id: "chartiberry",
		name: "Charti Berry",
		spritenum: 62,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Rock"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Rock' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Rock-type attack by 50%. Consumed after use."
	},
	"cheriberry": {
		id: "cheriberry",
		name: "Cheri Berry",
		spritenum: 63,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Fire"
		},
		onUpdate: function(pokemon) {
			if (pokemon.status === 'par') {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			if (pokemon.status === 'par') {
				pokemon.cureStatus();
			}
		},
		desc: "Cures paralysis. One-time use."
	},
	"chestoberry": {
		id: "chestoberry",
		name: "Chesto Berry",
		spritenum: 65,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Water"
		},
		onUpdate: function(pokemon) {
			if (pokemon.status === 'slp') {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			if (pokemon.status === 'slp') {
				pokemon.cureStatus();
			}
		},
		desc: "Cures sleep. One-time use."
	},
	"chilanberry": {
		id: "chilanberry",
		name: "Chilan Berry",
		spritenum: 66,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Normal"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Normal') {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a Normal-type attack by 50%. Consumed after use."
	},
	"chilldrive": {
		id: "chilldrive",
		name: "Chill Drive",
		spritenum: 67,
		fling: {
			basePower: 70
		},
		onDrive: 'Ice',
		desc: "Changes the type of Techno Blast to Ice."
	},
	"choiceband": {
		id: "choiceband",
		name: "Choice Band",
		spritenum: 68,
		fling: {
			basePower: 10
		},
		onStart: function(pokemon) {
			if (pokemon.volatiles['choicelock']) {
				this.debug('removing choicelock: '+pokemon.volatiles.choicelock);
			}
			pokemon.removeVolatile('choicelock');
		},
		onModifyMove: function(move, pokemon) {
			pokemon.addVolatile('choicelock');
		},
		onModifyStats: function(stats) {
			stats.atk *= 1.5;
		},
		isChoice: true,
		desc: "Hold item which raises Attack 50%, but locks holder into one move."
	},
	"choicescarf": {
		id: "choicescarf",
		name: "Choice Scarf",
		spritenum: 69,
		fling: {
			basePower: 10
		},
		onStart: function(pokemon) {
			if (pokemon.volatiles['choicelock']) {
				this.debug('removing choicelock: '+pokemon.volatiles.choicelock);
			}
			pokemon.removeVolatile('choicelock');
		},
		onModifyMove: function(move, pokemon) {
			pokemon.addVolatile('choicelock');
		},
		onModifyStats: function(stats) {
			stats.spe *= 1.5;
		},
		isChoice: true,
		desc: "Hold item which raises Speed 50%, but locks holder into one move."
	},
	"choicespecs": {
		id: "choicespecs",
		name: "Choice Specs",
		spritenum: 70,
		fling: {
			basePower: 10
		},
		onStart: function(pokemon) {
			if (pokemon.volatiles['choicelock']) {
				this.debug('removing choicelock: '+pokemon.volatiles.choicelock);
			}
			pokemon.removeVolatile('choicelock');
		},
		onModifyMove: function(move, pokemon) {
			pokemon.addVolatile('choicelock');
		},
		onModifyStats: function(stats) {
			stats.spa *= 1.5;
		},
		isChoice: true,
		desc: "Hold item which raises Special Attack 50%, but locks holder into one move."
	},
	"chopleberry": {
		id: "chopleberry",
		name: "Chople Berry",
		spritenum: 71,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Fighting"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Fighting' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Fighting-type attack by 50%. Consumed after use."
	},
	"clawfossil": {
		id: "clawfossil",
		name: "Claw Fossil",
		spritenum: 72,
		fling: {
			basePower: 100
		},
		desc: "Can be revived into Anorith."
	},
	"cobaberry": {
		id: "cobaberry",
		name: "Coba Berry",
		spritenum: 76,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Flying"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Flying' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Flying-type attack by 50%. Consumed after use."
	},
	"colburberry": {
		id: "colburberry",
		name: "Colbur Berry",
		spritenum: 78,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Dark"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Dark' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Dark-type attack by 50%. Consumed after use."
	},
	"cornnberry": {
		id: "cornnberry",
		name: "Cornn Berry",
		spritenum: 81,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Bug"
		},
		desc: "No use. Unobtainable in BW."
	},
	"coverfossil": {
		id: "coverfossil",
		name: "Cover Fossil",
		spritenum: 85,
		fling: {
			basePower: 100
		},
		desc: "Can be revived into Tirtouga."
	},
	"custapberry": {
		id: "custapberry",
		name: "Custap Berry",
		spritenum: 86,
		isUnreleased: true,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Ghost"
		},
		onResidual: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/4 || (pokemon.hp <= pokemon.maxhp/2 && pokemon.ability === 'gluttony')) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			pokemon.addVolatile('custapberry');
		},
		effect: {
			duration: 2,
			onModifyPriority: function(priority, pokemon) {
				this.add('-enditem', pokemon, 'Custap Berry');
				pokemon.removeVolatile('custapberry');
				return priority + 0.1;
			}
		},
		desc: "Activates at 25% HP. Next move used goes first. Unobtainable in BW. One-time use."
	},
	"damprock": {
		id: "damprock",
		name: "Damp Rock",
		spritenum: 88,
		fling: {
			basePower: 60
		},
		desc: "Rain Dance lasts 8 turns."
	},
	"darkgem": {
		id: "darkgem",
		name: "Dark Gem",
		spritenum: 89,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Dark') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Dark Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Dark-type move by 50%. One-time use."
	},
	"deepseascale": {
		id: "deepseascale",
		name: "DeepSeaScale",
		spritenum: 93,
		fling: {
			basePower: 30
		},
		onModifyStats: function(stats, pokemon) {
			if (pokemon.template.species === 'Clamperl') {
				stats.spd *= 2;
			}
		},
		desc: "Doubles Clamperl's Special Defence. Evolves Clamperl into Gorebyss."
	},
	"deepseatooth": {
		id: "deepseatooth",
		name: "DeepSeaTooth",
		spritenum: 94,
		fling: {
			basePower: 90
		},
		onModifyStats: function(stats, pokemon) {
			if (pokemon.template.species === 'Clamperl') {
				stats.spa *= 2;
			}
		},
		desc: "Doubles Clamperl's Special Attack. Evolves Clamperl into Huntail."
	},
	"destinyknot": {
		id: "destinyknot",
		name: "Destiny Knot",
		spritenum: 95,
		fling: {
			basePower: 10
		},
		desc: "If the holder becomes infatuated, so does the enemy."
	},
	"domefossil": {
		id: "domefossil",
		name: "Dome Fossil",
		spritenum: 102,
		fling: {
			basePower: 100
		},
		desc: "Can be revived into Kabuto."
	},
	"dousedrive": {
		id: "dousedrive",
		name: "Douse Drive",
		spritenum: 103,
		fling: {
			basePower: 70
		},
		onDrive: 'Water',
		desc: "Changes the type of Techno Blast to Water."
	},
	"dracoplate": {
		id: "dracoplate",
		name: "Draco Plate",
		spritenum: 105,
		fling: {
			basePower: 90
		},
		onPlate: 'Dragon',
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Dragon') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Dragon-type moves 20%. Pokemon with Multitype become Dragon-type."
	},
	"dragonfang": {
		id: "dragonfang",
		name: "Dragon Fang",
		spritenum: 106,
		fling: {
			basePower: 70
		},
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Dragon') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Dragon-type moves 20%."
	},
	"dragongem": {
		id: "dragongem",
		name: "Dragon Gem",
		spritenum: 107,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Dragon') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Dragon Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Dragon-type move by 50%. One-time use."
	},
	"dreadplate": {
		id: "dreadplate",
		name: "Dread Plate",
		spritenum: 110,
		fling: {
			basePower: 90
		},
		onPlate: 'Dark',
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Dark') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of the holder's Dark-type moves 20%. Pokemon with Multitype become Dark-type."
	},
	"durinberry": {
		id: "durinberry",
		name: "Durin Berry",
		spritenum: 114,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Water"
		},
		desc: "No use. Unobtainable in BW."
	},
	"earthplate": {
		id: "earthplate",
		name: "Earth Plate",
		spritenum: 117,
		fling: {
			basePower: 90
		},
		onPlate: 'Ground',
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Ground') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Ground-type moves 20%. Pokemon with Multitype become Ground-type."
	},
	"ejectbutton": {
		id: "ejectbutton",
		name: "Eject Button",
		spritenum: 118,
		fling: {
			basePower: 30
		},
		onHit: function(target, source, move) {
			if (source && source !== target && move && move.selfSwitch) {
				move.selfSwitch = false;
			}
		},
		onAfterMoveSecondary: function(target, source, move) {
			if (source && source !== target && move && move.category !== 'Status') {
				if (target.useItem()) {
					target.switchFlag = true;
				}
			}
		},
		desc: "When the holder is hit, it immediately switches out. One-time use."
	},
	"electirizer": {
		id: "electirizer",
		name: "Electirizer",
		spritenum: 119,
		fling: {
			basePower: 80
		},
		desc: "Evolves Electabuzz into Electivire."
	},
	"electricgem": {
		id: "electricgem",
		name: "Electric Gem",
		spritenum: 120,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Electric') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Electric Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Electric-type move by 50%. One-time use."
	},
	"energypowder": {
		id: "energypowder",
		name: "EnergyPowder",
		spritenum: 123,
		fling: {
			basePower: 30
		},
		desc: "Restores 50 HP to one Pokemon but tastes bitter."
	},
	"enigmaberry": {
		id: "enigmaberry",
		name: "Enigma Berry",
		spritenum: 124,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Bug"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move && this.getEffectiveness(move.type, target) >= 2) {
				target.addVolatile('enigmaberry');
			}
		},
		effect: {
			duration: 1,
			onUpdate: function(target) {
				if (target.eatItem()) {
					target.removeVolatile('enigmaberry');
				}
			}
		},
		onEat: function(pokemon) {
			this.heal(pokemon.maxhp/4);
		},
		desc: "Heals 25% HP after being hit by a super effective attack. One-time use."
	},
	"eviolite": {
		id: "eviolite",
		name: "Eviolite",
		spritenum: 130,
		fling: {
			basePower: 40
		},
		onModifyStats: function(stats, pokemon) {
			if (pokemon.baseTemplate.nfe) {
				stats.def *= 1.5;
				stats.spd *= 1.5;
			}
		},
		desc: "Boosts Defense and Special Defense of holder by 50% if it is an NFE Pokemon."
	},
	"expertbelt": {
		id: "expertbelt",
		name: "Expert Belt",
		spritenum: 132,
		fling: {
			basePower: 10
		},
		onBasePower: function(basePower, user, target, move) {
			if (move && this.getEffectiveness(move.type, target) > 0) {
				return basePower * 1.2;
			}
		},
		desc: "Super effective attacks are 20% stronger."
	},
	"fightinggem": {
		id: "fightinggem",
		name: "Fighting Gem",
		spritenum: 139,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Fighting') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Fighting Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Fighting-type move by 50%. One-time use."
	},
	"figyberry": {
		id: "figyberry",
		name: "Figy Berry",
		spritenum: 140,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Bug"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/2) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.heal(pokemon.maxhp/8);
			if (pokemon.getNature().minus === 'atk') {
				pokemon.addVolatile('confusion');
			}
		},
		desc: "Restores 1\/8 max HP when at 50% HP or less. May confuse. One-time use."
	},
	"firegem": {
		id: "firegem",
		name: "Fire Gem",
		spritenum: 141,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Fire') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Fire Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Fire-type move by 50%. One-time use."
	},
	"fistplate": {
		id: "fistplate",
		name: "Fist Plate",
		spritenum: 143,
		fling: {
			basePower: 90
		},
		onPlate: 'Fighting',
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Fighting') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Fighting-type moves 20%. Pokemon with Multitype become Fighting-type."
	},
	"flameorb": {
		id: "flameorb",
		name: "Flame Orb",
		spritenum: 145,
		fling: {
			basePower: 30,
			status: 'brn'
		},
		onResidualOrder: 26,
		onResidualSubOrder: 2,
		onResidual: function(pokemon) {
			if (!pokemon.status && !pokemon.hasType('Fire') && pokemon.ability !== 'waterveil') {
				this.add('-activate', pokemon, 'item: Flame Orb');
				pokemon.trySetStatus('brn');
			}
		},
		desc: "Burns the holder."
	},
	"flameplate": {
		id: "flameplate",
		name: "Flame Plate",
		spritenum: 146,
		fling: {
			basePower: 90
		},
		onPlate: 'Fire',
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Fire') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Fire-type moves 20%. Pokemon with Multitype become Fire-type."
	},
	"floatstone": {
		id: "floatstone",
		name: "Float Stone",
		spritenum: 147,
		fling: {
			basePower: 30
		},
		onModifyPokemon: function(pokemon) {
			pokemon.weightkg /= 2;
		},
		desc: "The weight of the holder is halved."
	},
	"flyinggem": {
		id: "flyinggem",
		name: "Flying Gem",
		spritenum: 149,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Flying') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Flying Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Flying-type move by 50%. One-time use."
	},
	"focusband": {
		id: "focusband",
		name: "Focus Band",
		spritenum: 150,
		fling: {
			basePower: 10
		},
		onDamage: function(damage, target, source, effect) {
			if (this.random(10) === 0 && damage >= target.hp && effect && effect.effectType === 'Move') {
				this.add("-message",target.name+" held on using its Focus Band! (placeholder)");
				return target.hp - 1;
			}
		},
		desc: "Gives a 10% chance of surviving a hit with at least 1 HP."
	},
	"focussash": {
		id: "focussash",
		name: "Focus Sash",
		spritenum: 151,
		fling: {
			basePower: 10
		},
		onDamage: function(damage, target, source, effect) {
			if (target.hp === target.maxhp && damage >= target.hp && effect && effect.effectType === 'Move') {
				if (target.useItem()) {
					return target.hp - 1;
				}
			}
		},
		desc: "The holder always survives one attack at full HP. One-time use."
	},
	"fullincense": {
		id: "fullincense",
		name: "Full Incense",
		spritenum: 155,
		fling: {
			basePower: 10
		},
		onModifyPriority: function(priority, pokemon) {
			if (pokemon.ability !== 'stall') {
				return priority - 0.1;
			}
		},
		desc: "Makes the holder move last. Allows breeding of Munchlax."
	},
	"ganlonberry": {
		id: "ganlonberry",
		name: "Ganlon Berry",
		spritenum: 158,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Ice"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/4 || (pokemon.hp <= pokemon.maxhp/2 && pokemon.ability === 'gluttony')) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.boost({def:1});
		},
		desc: "Raises Defense by one stage when at 25% HP or less. One-time use."
	},
	"ghostgem": {
		id: "ghostgem",
		name: "Ghost Gem",
		spritenum: 161,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Ghost') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Ghost Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Ghost-type move by 50%. One-time use."
	},
	"grassgem": {
		id: "grassgem",
		name: "Grass Gem",
		spritenum: 172,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Grass') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Grass Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Grass-type move by 50%. One-time use."
	},
	"grepaberry": {
		id: "grepaberry",
		name: "Grepa Berry",
		spritenum: 178,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Flying"
		},
		desc: "Increases happiness, but lowers Special Defense EVs by 10."
	},
	"gripclaw": {
		id: "gripclaw",
		name: "Grip Claw",
		spritenum: 179,
		fling: {
			basePower: 90
		},
		// implemented in statuses
		desc: "Partial trapping moves last 5 turns."
	},
	"griseousorb": {
		id: "griseousorb",
		name: "Griseous Orb",
		spritenum: 180,
		fling: {
			basePower: 60
		},
		onBasePower: function(basePower, user, target, move) {
			if (user.template.num === 487 && (move.type === 'Ghost' || move.type === 'Dragon')) {
				return basePower * 1.2;
			}
		},
		onTakeItem: function(item, pokemon, source) {
			if ((source && source.template.num === 487) || pokemon.template.num === 487) {
				return false;
			}
		},
		desc: "Raises the Base Power of Giratina's STAB moves 20% and transforms Giratina into Giratina-O when held. Cannot be removed or given to Giratina in battle."
	},
	"groundgem": {
		id: "groundgem",
		name: "Ground Gem",
		spritenum: 182,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Ground') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Ground Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Ground-type move by 50%. One-time use."
	},
	"habanberry": {
		id: "habanberry",
		name: "Haban Berry",
		spritenum: 185,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Dragon"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Dragon' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Dragon-type attack by 50%. Consumed after use."
	},
	"hardstone": {
		id: "hardstone",
		name: "Hard Stone",
		spritenum: 187,
		fling: {
			basePower: 100
		},
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Rock') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Rock-type moves 20%."
	},
	"heatrock": {
		id: "heatrock",
		name: "Heat Rock",
		spritenum: 193,
		fling: {
			basePower: 60
		},
		desc: "Sunny Day lasts 8 turns."
	},
	"helixfossil": {
		id: "helixfossil",
		name: "Helix Fossil",
		spritenum: 195,
		fling: {
			basePower: 100
		},
		desc: "Can be revived into Omanyte."
	},
	"hondewberry": {
		id: "hondewberry",
		name: "Hondew Berry",
		spritenum: 213,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Ground"
		},
		desc: "Increases happiness, but lowers Special Attack EVs by 10."
	},
	"iapapaberry": {
		id: "iapapaberry",
		name: "Iapapa Berry",
		spritenum: 217,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Dark"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/2) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.heal(pokemon.maxhp/8);
			if (pokemon.getNature().minus === 'def') {
				pokemon.addVolatile('confusion');
			}
		},
		desc: "Restores 1\/8 max HP when at 50% HP or less. May confuse. One-time use."
	},
	"icegem": {
		id: "icegem",
		name: "Ice Gem",
		spritenum: 218,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Ice') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Ice Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Ice-type move by 50%. One-time use."
	},
	"icicleplate": {
		id: "icicleplate",
		name: "Icicle Plate",
		spritenum: 220,
		fling: {
			basePower: 90
		},
		onPlate: 'Ice',
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Ice') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Ice-type moves 20%. Pokemon with Multitype become Ice-type."
	},
	"icyrock": {
		id: "icyrock",
		name: "Icy Rock",
		spritenum: 221,
		fling: {
			basePower: 40
		},
		desc: "Hail lasts 8 turns."
	},
	"insectplate": {
		id: "insectplate",
		name: "Insect Plate",
		spritenum: 223,
		fling: {
			basePower: 90
		},
		onPlate: 'Bug',
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Bug') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Bug-type moves 20%. Pokemon with Multitype become Bug-type."
	},
	"ironball": {
		id: "ironball",
		name: "Iron Ball",
		spritenum: 224,
		fling: {
			basePower: 130
		},
		onModifyPokemon: function(pokemon) {
			pokemon.negateImmunity['Ground'] = true;
		},
		onModifyStats: function(stats, pokemon) {
			stats.spe /= 2;
		},
		desc: "Reduces Speed 50% and removes holder's Ground-type immunity."
	},
	"ironplate": {
		id: "ironplate",
		name: "Iron Plate",
		spritenum: 225,
		fling: {
			basePower: 90
		},
		onPlate: 'Steel',
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Steel') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Steel-type moves 20%. Pokemon with Multitype become Steel-type."
	},
	"jabocaberry": {
		id: "jabocaberry",
		name: "Jaboca Berry",
		spritenum: 230,
		isUnreleased: true,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Dragon"
		},
		onAfterMoveSecondary: function(target, source, move) {
			if (source && source !== target && move && move.category === 'Physical') {
				if (target.eatItem()) {
					this.damage(source.maxhp/8, source, target);
				}
			}
		},
		onEat: function() { },
		desc: "If hit by a physical attack, the attacker takes 12.5% damage. Unobtainable in BW. One-time use."
	},
	"kasibberry": {
		id: "kasibberry",
		name: "Kasib Berry",
		spritenum: 233,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Ghost"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Ghost' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Ghost-type attack by 50%. Consumed after use."
	},
	"kebiaberry": {
		id: "kebiaberry",
		name: "Kebia Berry",
		spritenum: 234,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Poison"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Poison' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Poison-type attack by 50%. Consumed after use."
	},
	"kelpsyberry": {
		id: "kelpsyberry",
		name: "Kelpsy Berry",
		spritenum: 235,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Fighting"
		},
		desc: "Increases happiness, but lowers Attack EVs by 10."
	},
	"kingsrock": {
		id: "kingsrock",
		name: "King's Rock",
		spritenum: 236,
		fling: {
			basePower: 30,
			volatileStatus: 'flinch'
		},
		onModifyMove: function(move) {
			if (move.category !== "Status") {
				if (!move.secondaries) move.secondaries = [];
				for (var i=0; i<move.secondaries.length; i++) {
					if (move.secondaries[i].volatileStatus === 'flinch') return;
				}
				move.secondaries.push({
					chance: 10,
					volatileStatus: 'flinch'
				});
			}
		},
		desc: "Certain moves have a 10% flinch rate."
	},
	"laggingtail": {
		id: "laggingtail",
		name: "Lagging Tail",
		spritenum: 237,
		fling: {
			basePower: 10
		},
		onModifyPriority: function(priority, pokemon) {
			if (pokemon.ability !== 'stall') {
				return priority - 0.1;
			}
		},
		desc: "The holder will go last within its move's priority bracket, regardless of Speed."
	},
	"lansatberry": {
		id: "lansatberry",
		name: "Lansat Berry",
		spritenum: 238,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Flying"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/4 || (pokemon.hp <= pokemon.maxhp/2 && pokemon.ability === 'gluttony')) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			pokemon.addVolatile('focusenergy');
		},
		desc: "Raises critical hit rate by two stages when at 25% HP or less. One-time use."
	},
	"laxincense": {
		id: "laxincense",
		name: "Lax Incense",
		spritenum: 240,
		fling: {
			basePower: 10
		},
		onSourceModifyMove: function(move) {
			if (typeof move.accuracy !== 'number') return;
			this.debug('Lax Incense - decreasing accuracy');
			move.accuracy *= 0.9;
		},
		desc: "Hold item which raises evasion 10%. Allows breeding of Wynaut."
	},
	"leftovers": {
		id: "leftovers",
		name: "Leftovers",
		spritenum: 242,
		fling: {
			basePower: 10
		},
		onResidualOrder: 5,
		onResidualSubOrder: 2,
		onResidual: function(pokemon) {
			this.heal(pokemon.maxhp/16);
		},
		desc: "Heals 1\/16 HP each turn."
	},
	"leppaberry": {
		id: "leppaberry",
		name: "Leppa Berry",
		spritenum: 244,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Fighting"
		},
		onUpdate: function(pokemon) {
			var move = pokemon.getMoveData(pokemon.lastMove);
			if (move && move.pp === 0) {
				pokemon.addVolatile('leppaberry');
				pokemon.volatiles['leppaberry'].move = move;
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			var move;
			if (pokemon.volatiles['leppaberry']) {
				move = pokemon.volatiles['leppaberry'].move;
				pokemon.removeVolatile('leppaberry');
			} else {
				var pp = 99;
				for (var i in pokemon.moveset) {
					if (pokemon.moveset[i].pp < pp) {
						move = pokemon.moveset[i];
						pp = move.pp;
					}
				}
			}
			move.pp += 10;
			if (move.pp > move.maxpp) move.pp = move.maxpp;
			this.add("-message",pokemon.name+" restored "+move.move+"'s PP using its Leppa Berry! (placeholder)");
		},
		desc: "Restores 10 PP to a move that has run out of PP. One-time use."
	},
	"liechiberry": {
		id: "liechiberry",
		name: "Liechi Berry",
		spritenum: 248,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Grass"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/4 || (pokemon.hp <= pokemon.maxhp/2 && pokemon.ability === 'gluttony')) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.boost({atk:1});
		},
		desc: "Raises Attack by one stage when at 25% HP or less. One-time use."
	},
	"lifeorb": {
		id: "lifeorb",
		name: "Life Orb",
		spritenum: 249,
		fling: {
			basePower: 30
		},
		onBasePower: function(basePower, user) {
			user.addVolatile('lifeorb');
			return basePower * 1.3;
		},
		effect: {
			duration: 1,
			onAfterMoveSecondarySelf: function(source, target, move) {
				if (move && move.effectType === 'Move' && source && source.volatiles['lifeorb']) {
					this.damage(source.maxhp/10, source, source, this.getItem('lifeorb'));
					source.removeVolatile('lifeorb');
				}
			}
		},
		desc: "Boosts power by 30%, user takes 10% recoil each turn it attacks."
	},
	"lightball": {
		id: "lightball",
		name: "Light Ball",
		spritenum: 251,
		fling: {
			basePower: 30,
			status: 'par'
		},
		onModifyStats: function(stats, pokemon) {
			if (pokemon.template.species === 'Pikachu') {
				stats.atk *= 2;
				stats.spa *= 2;
			}
		},
		desc: "Doubles Pikachu's Attack and Special Attack."
	},
	"lightclay": {
		id: "lightclay",
		name: "Light Clay",
		spritenum: 252,
		fling: {
			basePower: 30
		},
		// implemented in the corresponding thing
		desc: "If the holder uses either Light Screen or Reflect, the two moves will stay on the field for eight turns instead of five."
	},
	"luckypunch": {
		id: "luckypunch",
		name: "Lucky Punch",
		spritenum: 261,
		fling: {
			basePower: 40
		},
		onModifyMove: function(move, user) {
			if (user.template.species === 'Chansey') {
				move.critRatio += 2;
			}
		},
		desc: "Raises Chansey's critical hit ratio two stages."
	},
	"lumberry": {
		id: "lumberry",
		name: "Lum Berry",
		spritenum: 262,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Flying"
		},
		onUpdate: function(pokemon) {
			if (pokemon.status || pokemon.volatiles['confusion']) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			pokemon.cureStatus();
			pokemon.removeVolatile('confusion');
		},
		desc: "Cures status. Consumed after use."
	},
	"lustrousorb": {
		id: "lustrousorb",
		name: "Lustrous Orb",
		spritenum: 265,
		fling: {
			basePower: 60
		},
		onBasePower: function(basePower, user, target, move) {
			if (move && user.template.species === 'Palkia' && (move.type === 'Water' || move.type === 'Dragon')) {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Palkia's STAB moves 20%."
	},
	"machobrace": {
		id: "machobrace",
		name: "Macho Brace",
		spritenum: 269,
		fling: {
			basePower: 60
		},
		onModifyStats: function(stats, pokemon) {
			stats.spe /= 2;
		},
		desc: "Reduces Speed 50%. Doubles EVs gained."
	},
	"magnet": {
		id: "magnet",
		name: "Magnet",
		spritenum: 273,
		fling: {
			basePower: 30
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Electric') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Electric-type moves 20%."
	},
	"magoberry": {
		id: "magoberry",
		name: "Mago Berry",
		spritenum: 274,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Ghost"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/2) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.heal(pokemon.maxhp/8);
			if (pokemon.getNature().minus === 'spe') {
				pokemon.addVolatile('confusion');
			}
		},
		desc: "Restores 1\/8 max HP when at 50% HP or less. May confuse. One-time use."
	},
	"magostberry": {
		id: "magostberry",
		name: "Magost Berry",
		spritenum: 275,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Rock"
		},
		desc: "No use. Unobtainable in BW."
	},
	"meadowplate": {
		id: "meadowplate",
		name: "Meadow Plate",
		spritenum: 282,
		fling: {
			basePower: 90
		},
		onPlate: 'Grass',
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Grass') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Grass-type moves 20%. Pokemon with Multitype become Grass-type."
	},
	"mentalherb": {
		id: "mentalherb",
		name: "Mental Herb",
		spritenum: 285,
		fling: {
			basePower: 10,
			effect: function(pokemon) {
				var conditions = ['attract','taunt','encore','torment','disable'];
				for (var i=0; i<conditions.length; i++) {
					if (pokemon.volatiles[conditions[i]]) {
						for (var j=0; j<conditions.length; j++) {
							pokemon.removeVolatile(conditions[j]);
						}
						return;
					}
				}
			}
		},
		onUpdate: function(pokemon) {
			var conditions = ['attract','taunt','encore','torment','disable'];
			for (var i=0; i<conditions.length; i++) {
				if (pokemon.volatiles[conditions[i]]) {
					if (!pokemon.useItem()) return;
					for (var j=0; j<conditions.length; j++) {
						pokemon.removeVolatile(conditions[j]);
					}
					return;
				}
			}
		},
		desc: "Cures certain conditions. One-time use."
	},
	"metalcoat": {
		id: "metalcoat",
		name: "Metal Coat",
		spritenum: 286,
		fling: {
			basePower: 30
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Steel') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Steel-type moves 20%. Evolves Onix and Scyther."
	},
	"metalpowder": {
		id: "metalpowder",
		name: "Metal Powder",
		fling: {
			basePower: 10
		},
		spritenum: 287,
		onModifyStats: function(stats, pokemon) {
			if (pokemon.template.species === 'Ditto') {
				stats.def *= 2;
			}
		},
		desc: "Raises Ditto's Defense and Special Defense by 50%."
	},
	"metronome": {
		id: "metronome",
		name: "Metronome",
		spritenum: 289,
		fling: {
			basePower: 30
		},
		desc: "Boost the power of attacks used consecutively."
	},
	"micleberry": {
		id: "micleberry",
		name: "Micle Berry",
		spritenum: 290,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Rock"
		},
		onResidual: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/4 || (pokemon.hp <= pokemon.maxhp/2 && pokemon.ability === 'Gluttony')) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			pokemon.addVolatile('MicleBerry');
		},
		effect: {
			duration: 2,
			onModifyMove: function(move, pokemon) {
				this.add('-enditem', pokemon, 'Micle Berry');
				pokemon.removeVolatile('MicleBerry');
				if (typeof move.accuracy === 'number') {
					move.accuracy *= 1.2;
				}
			}
		},
		desc: "Activates at 25% HP. Next move used will always hit. One-time use."
	},
	"mindplate": {
		id: "mindplate",
		name: "Mind Plate",
		spritenum: 291,
		fling: {
			basePower: 90
		},
		onPlate: 'Psychic',
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Psychic') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Psychic-type moves 20%. Pokemon with Multitype become Psychic-type."
	},
	"miracleseed": {
		id: "miracleseed",
		name: "Miracle Seed",
		fling: {
			basePower: 30
		},
		spritenum: 292,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Grass') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Grass-type moves 20%."
	},
	"muscleband": {
		id: "muscleband",
		name: "Muscle Band",
		spritenum: 297,
		fling: {
			basePower: 10
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.category === 'Physical') {
				return basePower * 1.1;
			}
		},
		desc: "Raises power of physical moves 10%."
	},
	"mysticwater": {
		id: "mysticwater",
		name: "Mystic Water",
		spritenum: 300,
		fling: {
			basePower: 30
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Water') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Water-type moves 20%."
	},
	"nanabberry": {
		id: "nanabberry",
		name: "Nanab Berry",
		spritenum: 302,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Water"
		},
		desc: "No use. Unobtainable in BW."
	},
	"nevermeltice": {
		id: "nevermeltice",
		name: "NeverMeltIce",
		spritenum: 305,
		fling: {
			basePower: 30
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Ice') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Ice-type moves 20%."
	},
	"nomelberry": {
		id: "nomelberry",
		name: "Nomel Berry",
		spritenum: 306,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Dragon"
		},
		desc: "No use. Unobtainable in BW."
	},
	"normalgem": {
		id: "normalgem",
		name: "Normal Gem",
		spritenum: 307,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Normal') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Normal Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Normal-type move by 50%. One-time use."
	},
	"occaberry": {
		id: "occaberry",
		name: "Occa Berry",
		spritenum: 311,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Fire"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Fire' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Fire-type attack by 50%. Consumed after use."
	},
	"oddincense": {
		id: "oddincense",
		name: "Odd Incense",
		spritenum: 312,
		fling: {
			basePower: 10
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Psychic') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Psychic-type moves 20%. Allows breeding of Mime Jr."
	},
	"oldamber": {
		id: "oldamber",
		name: "Old Amber",
		spritenum: 314,
		fling: {
			basePower: 100
		},
		desc: "Can be revived into Aerodactyl."
	},
	"oranberry": {
		id: "oranberry",
		name: "Oran Berry",
		spritenum: 319,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Poison"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/2) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.heal(10);
		},
		desc: "Restores 10 HP when at 50% HP or less. One-time use."
	},
	"pamtreberry": {
		id: "pamtreberry",
		name: "Pamtre Berry",
		spritenum: 323,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Steel"
		},
		desc: "No use. Unobtainable in BW."
	},
	"passhoberry": {
		id: "passhoberry",
		name: "Passho Berry",
		spritenum: 329,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Water"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Water' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Water-type attack by 50%. Consumed after use."
	},
	"payapaberry": {
		id: "payapaberry",
		name: "Payapa Berry",
		spritenum: 330,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Psychic"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Psychic' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Psychic-type attack by 50%. Consumed after use."
	},
	"pechaberry": {
		id: "pechaberry",
		name: "Pecha Berry",
		spritenum: 333,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Electric"
		},
		onUpdate: function(pokemon) {
			if (pokemon.status === 'psn' || pokemon.status === 'tox') {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			if (pokemon.status === 'psn' || pokemon.status === 'tox') {
				pokemon.cureStatus();
			}
		},
		desc: "Cures poison. One-time use."
	},
	"persimberry": {
		id: "persimberry",
		name: "Persim Berry",
		spritenum: 334,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Ground"
		},
		onUpdate: function(pokemon) {
			if (pokemon.volatiles['confusion']) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			pokemon.removeVolatile('confusion');
		},
		desc: "Cures confusion. One-time use."
	},
	"petayaberry": {
		id: "petayaberry",
		name: "Petaya Berry",
		spritenum: 335,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Poison"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/4 || (pokemon.hp <= pokemon.maxhp/2 && pokemon.ability === 'gluttony')) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.boost({spa:1});
		},
		desc: "Raises Special Attack by one stage when at 25% HP or less. One-time use."
	},
	"pinapberry": {
		id: "pinapberry",
		name: "Pinap Berry",
		spritenum: 337,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Grass"
		},
		desc: "No use. Unobtainable in BW."
	},
	"plumefossil": {
		id: "plumefossil",
		name: "Plume Fossil",
		spritenum: 339,
		fling: {
			basePower: 100
		},
		desc: "Can be revived into Archen."
	},
	"poisonbarb": {
		id: "poisonbarb",
		name: "Poison Barb",
		spritenum: 343,
		fling: {
			basePower: 70,
			status: 'psn'
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Poison') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Poison-type moves 20%."
	},
	"poisongem": {
		id: "poisongem",
		name: "Poison Gem",
		spritenum: 344,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Poison') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Poison Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Poison-type move by 50%. One-time use."
	},
	"pomegberry": {
		id: "pomegberry",
		name: "Pomeg Berry",
		spritenum: 351,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Ice"
		},
		desc: "Increases happiness, but lowers HP EVs by 10."
	},
	"powerherb": {
		id: "powerherb",
		onChargeMove: function(pokemon, move) {
			if (pokemon.useItem()) {
				this.debug('power herb - remove charge turn for '+move.id);
				return false; // skip charge turn
			}
		},
		name: "Power Herb",
		spritenum: 358,
		fling: {
			basePower: 10
		},
		desc: "Moves with a charge turn activate instantly."
	},
	"psychicgem": {
		id: "psychicgem",
		name: "Psychic Gem",
		spritenum: 369,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Psychic') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Psychic Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Psychic-type move by 50%. One-time use."
	},
	"qualotberry": {
		id: "qualotberry",
		name: "Qualot Berry",
		spritenum: 371,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Poison"
		},
		desc: "Increases happiness, but lowers Defense EVs by 10."
	},
	"quickclaw": {
		id: "quickclaw",
		onModifyPriority: function(priority, pokemon) {
			if (this.random(5) === 0) {
				this.add('-activate', pokemon, 'item: Quick Claw');
				return priority + 0.1;
			}
		},
		name: "Quick Claw",
		spritenum: 373,
		fling: {
			basePower: 80
		},
		desc: "Gives the user a 20% chance to go first."
	},
	"quickpowder": {
		id: "quickpowder",
		name: "Quick Powder",
		spritenum: 374,
		fling: {
			basePower: 10
		},
		onModifyStats: function(stats, pokemon) {
			if (pokemon.template.species === 'Ditto') {
				stats.spe *= 2;
			}
		},
		desc: "Doubles Ditto's Speed."
	},
	"rabutaberry": {
		id: "rabutaberry",
		name: "Rabuta Berry",
		spritenum: 375,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Ghost"
		},
		desc: "No use. Unobtainable in BW."
	},
	"rarebone": {
		id: "rarebone",
		name: "Rare Bone",
		spritenum: 379,
		fling: {
			basePower: 100
		},
		desc: "Can be Flung for 100 BP."
	},
	"rawstberry": {
		id: "rawstberry",
		name: "Rawst Berry",
		spritenum: 381,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Grass"
		},
		onUpdate: function(pokemon) {
			if (pokemon.status === 'brn') {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			if (pokemon.status === 'brn') {
				pokemon.cureStatus();
			}
		},
		desc: "Cures burn. One-time use."
	},
	"razorclaw": {
		id: "razorclaw",
		name: "Razor Claw",
		spritenum: 382,
		fling: {
			basePower: 80
		},
		onModifyMove: function(move) {
			move.critRatio++;
		},
		desc: "Raises critical hit rate one stage. Evolves Sneasel into Weavile."
	},
	"razorfang": {
		id: "razorfang",
		name: "Razor Fang",
		spritenum: 383,
		fling: {
			basePower: 30,
			volatileStatus: 'flinch'
		},
		onModifyMove: function(move) {
			if (move.category !== "Status") {
				if (!move.secondaries) move.secondaries = [];
				for (var i=0; i<move.secondaries.length; i++) {
					if (move.secondaries[i].volatileStatus === 'flinch') return;
				}
				move.secondaries.push({
					chance: 10,
					volatileStatus: 'flinch'
				});
			}
		},
		desc: "Certain moves have a 10% flinch rate. Evolves Gligar into Gliscor."
	},
	"razzberry": {
		id: "razzberry",
		name: "Razz Berry",
		spritenum: 384,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Steel"
		},
		desc: "No use. Unobtainable in BW."
	},
	"redcard": {
		id: "redcard",
		name: "Red Card",
		spritenum: 387,
		fling: {
			basePower: 10
		},
		onAfterMoveSecondary: function(target, source, move) {
			if (source && source !== target && move && move.category !== 'Status') {
				if (target.useItem()) { // This order is correct - the item is used up even against a pokemon with Ingrain or that otherwise can't be forced out
					if (this.runEvent('DragOut', source, target, move)) {
						this.dragIn(source.side);
					}
				}
			}
		},
		desc: "The opponent is forced out immediately if it attacks the holder. One-time use."
	},
	"rindoberry": {
		id: "rindoberry",
		name: "Rindo Berry",
		spritenum: 409,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Grass"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Grass' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Grass-type attack by 50%."
	},
	"ringtarget": {
		id: "ringtarget",
		name: "Ring Target",
		spritenum: 410,
		fling: {
			basePower: 10
		},
		onModifyPokemon: function(pokemon) {
			pokemon.negateImmunity['Type'] = true;
		},
		desc: "Negates any type-based immunities. Does not affect abilities."
	},
	"rockgem": {
		id: "rockgem",
		name: "Rock Gem",
		spritenum: 415,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Rock') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Rock Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Rock-type move by 50%. One-time use."
	},
	"rockincense": {
		id: "rockincense",
		name: "Rock Incense",
		spritenum: 416,
		fling: {
			basePower: 10
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Rock') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Rock-type moves 20%. Allows breeding of Bonsly."
	},
	"rockyhelmet": {
		id: "rockyhelmet",
		name: "Rocky Helmet",
		spritenum: 417,
		fling: {
			basePower: 60
		},
		onAfterDamage: function(damage, target, source, move) {
			if (source && source !== target && move && move.isContact) {
				this.damage(source.maxhp/6, source, target);
			}
		},
		desc: "Deals 1\/6 damage when the opponent makes contact."
	},
	"rootfossil": {
		id: "rootfossil",
		name: "Root Fossil",
		spritenum: 418,
		fling: {
			basePower: 100
		},
		desc: "Can be revived into Lileep."
	},
	"roseincense": {
		id: "roseincense",
		name: "Rose Incense",
		spritenum: 419,
		fling: {
			basePower: 10
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Grass') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Grass-type moves 20%. Allows breeding of Budew."
	},
	"rowapberry": {
		id: "rowapberry",
		name: "Rowap Berry",
		spritenum: 420,
		isUnreleased: true,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Dark"
		},
		onAfterMoveSecondary: function(target, source, move) {
			if (source && source !== target && move && move.category === 'Special') {
				if (target.eatItem()) {
					this.damage(source.maxhp/8, source, target);
				}
			}
		},
		onEat: function() { },
		desc: "If hit by a special attack, the attacker takes 12.5% damage. Unobtainable in BW. One-time use."
	},
	"salacberry": {
		id: "salacberry",
		name: "Salac Berry",
		spritenum: 426,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Fighting"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/4 || (pokemon.hp <= pokemon.maxhp/2 && pokemon.ability === 'gluttony')) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.boost({spe:1});
		},
		desc: "Raises Speed by one stage when at 25% HP or less. One-time use."
	},
	"scopelens": {
		id: "scopelens",
		name: "Scope Lens",
		spritenum: 429,
		fling: {
			basePower: 30
		},
		onModifyMove: function(move) {
			move.critRatio++;
		},
		desc: "Raises critical hit rate one stage."
	},
	"seaincense": {
		id: "seaincense",
		name: "Sea Incense",
		spritenum: 430,
		fling: {
			basePower: 10
		},
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Water') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Water-type moves 20%. Allows breeding of Azurill."
	},
	"sharpbeak": {
		id: "sharpbeak",
		name: "Sharp Beak",
		spritenum: 436,
		fling: {
			basePower: 50
		},
		onBasePower: function(basePower, user, target, move) {
			if (move && move.type === 'Flying') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Flying-type moves 20%."
	},
	"shedshell": {
		id: "shedshell",
		name: "Shed Shell",
		spritenum: 437,
		fling: {
			basePower: 10
		},
		onModifyPokemonPriority: -10,
		onModifyPokemon: function(pokemon) {
			pokemon.trapped = false;
		},
		desc: "Allows holder to switch out even when trapped."
	},
	"shellbell": {
		id: "shellbell",
		name: "Shell Bell",
		spritenum: 438,
		fling: {
			basePower: 30
		},
		onAfterMoveSelf: function(source, target) {
			if (source.lastDamage > 0) {
				this.heal(source.lastDamage/8, source);
			}
		},
		desc: "Heals holder 1\/8 of damage dealt."
	},
	"shockdrive": {
		id: "shockdrive",
		name: "Shock Drive",
		spritenum: 442,
		fling: {
			basePower: 70
		},
		onDrive: 'Electric',
		desc: "Changes the type of Techno Blast to Electric."
	},
	"shucaberry": {
		id: "shucaberry",
		name: "Shuca Berry",
		spritenum: 443,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Ground"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Ground' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Ground-type attack by 50%. Consumed after use."
	},
	"silkscarf": {
		id: "silkscarf",
		name: "Silk Scarf",
		spritenum: 444,
		fling: {
			basePower: 10
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Normal') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Normal-type moves 20%."
	},
	"silverpowder": {
		id: "silverpowder",
		name: "SilverPowder",
		spritenum: 447,
		fling: {
			basePower: 10
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Bug') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Bug-type moves 20%."
	},
	"sitrusberry": {
		id: "sitrusberry",
		name: "Sitrus Berry",
		spritenum: 448,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Psychic"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/2) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.heal(pokemon.maxhp/4);
		},
		desc: "Restores 25% max HP when at 50% HP or less. One-time use."
	},
	"skullfossil": {
		id: "skullfossil",
		name: "Skull Fossil",
		spritenum: 449,
		fling: {
			basePower: 100
		},
		desc: "Can be revived into Cranidos."
	},
	"skyplate": {
		id: "skyplate",
		name: "Sky Plate",
		spritenum: 450,
		fling: {
			basePower: 90
		},
		onPlate: 'Flying',
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Flying') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Flying-type moves 20%. Pokemon with Multitype become Flying-type."
	},
	"smoothrock": {
		id: "smoothrock",
		name: "Smooth Rock",
		spritenum: 453,
		fling: {
			basePower: 10
		},
		desc: "Makes sandstorm last 8 turns."
	},
	"softsand": {
		id: "softsand",
		name: "Soft Sand",
		spritenum: 456,
		fling: {
			basePower: 10
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Ground') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Ground-type moves 20%."
	},
	"souldew": {
		id: "souldew",
		name: "Soul Dew",
		spritenum: 459,
		fling: {
			basePower: 30
		},
		onModifyStats: function(stats, pokemon) {
			if (pokemon.template.species === 'Latios' || pokemon.template.species === 'Latias') {
				stats.spa *= 1.5;
				stats.spd *= 1.5;
			}
		},
		desc: "Raises Special Attack and Special Defense by 50% if the holder is Latias or Latios. Unobtainable in BW."
	},
	"spelltag": {
		id: "spelltag",
		name: "Spell Tag",
		spritenum: 461,
		fling: {
			basePower: 30
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Ghost') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Ghost-type moves 20%."
	},
	"spelonberry": {
		id: "spelonberry",
		name: "Spelon Berry",
		spritenum: 462,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Dark"
		},
		desc: "No use. Unobtainable in BW."
	},
	"splashplate": {
		id: "splashplate",
		name: "Splash Plate",
		spritenum: 463,
		fling: {
			basePower: 90
		},
		onPlate: 'Water',
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Water') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Water-type moves 20%. Pokemon with Multitype become Water-type."
	},
	"spookyplate": {
		id: "spookyplate",
		name: "Spooky Plate",
		spritenum: 464,
		fling: {
			basePower: 90
		},
		onPlate: 'Ghost',
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Ghost') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Ghost-type moves 20%. Pokemon with Multitype become Ghost-type."
	},
	"starfberry": {
		id: "starfberry",
		name: "Starf Berry",
		spritenum: 472,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Psychic"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/4 || (pokemon.hp <= pokemon.maxhp/2 && pokemon.ability === 'gluttony')) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			var stats = [];
			for (var i in pokemon.boosts) {
				if (pokemon.boosts[i] < 6) {
					stats.push(i);
				}
			}
			if (stats.length) {
				var i = stats[this.random(stats.length)];
				var boost = {};
				boost[i] = 2;
				this.boost(boost);
			}
		},
		desc: "Raises a random stat by two stages when at 25% HP or less. One-time use."
	},
	"steelgem": {
		id: "steelgem",
		name: "Steel Gem",
		spritenum: 473,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Steel') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Steel Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Steel-type move by 50%. One-time use."
	},
	"stick": {
		id: "stick",
		name: "Stick",
		fling: {
			basePower: 60
		},
		spritenum: 475,
		onModifyMove: function(move, user) {
			if (user.template.species === 'Farfetch\'d') {
			move.critRatio += 2;
			}
		},
		desc: "Raises Farfetch'd's critical hit rate two stages."
	},
	"stickybarb": {
		id: "stickybarb",
		name: "Sticky Barb",
		spritenum: 476,
		fling: {
			basePower: 80
		},
		onResidualOrder: 26,
		onResidualSubOrder: 2,
		onResidual: function(pokemon) {
			this.damage(pokemon.maxhp/8);
		},
		onHit: function(target, source, move) {
			if (source && source !== target && !source.item && move && move.isContact) {
				var barb = target.takeItem();
				source.setItem(barb);
				// no message for Sticky Barb changing hands
			}
		},
		desc: "Causes damage to holder and attaches to attacker upon contact."
	},
	"stoneplate": {
		id: "stoneplate",
		name: "Stone Plate",
		spritenum: 477,
		fling: {
			basePower: 90
		},
		onPlate: 'Rock',
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Rock') {
				return basePower * 1.2;
			}
		},
		desc: "Raises base power of Rock-type moves 20%. Pokemon with Multitype become Rock-type."
	},
	"tamatoberry": {
		id: "tamatoberry",
		name: "Tamato Berry",
		spritenum: 486,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Psychic"
		},
		desc: "Increases happiness, but lowers Speed EVs by 10."
	},
	"tangaberry": {
		id: "tangaberry",
		name: "Tanga Berry",
		spritenum: 487,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Bug"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Bug' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Bug-type attack by 50%. Consumed after use."
	},
	"thickclub": {
		id: "thickclub",
		name: "Thick Club",
		spritenum: 491,
		fling: {
			basePower: 90
		},
		onModifyStats: function(stats, pokemon) {
			if (pokemon.template.species === 'Cubone' || pokemon.template.species === 'Marowak') {
				stats.atk *= 2;
			}
		},
		desc: "Doubles Cubone's and Marowak's Attack."
	},
	"toxicorb": {
		id: "toxicorb",
		name: "Toxic Orb",
		spritenum: 515,
		fling: {
			basePower: 30,
			status: 'tox'
		},
		onResidualOrder: 26,
		onResidualSubOrder: 2,
		onResidual: function(pokemon) {
			if (!pokemon.status && !pokemon.hasType('Poison') && !pokemon.hasType('Steel') && pokemon.ability !== 'immunity') {
				this.add('-activate', pokemon, 'item: Toxic Orb');
				pokemon.trySetStatus('tox');
			}
		},
		desc: "Poisons the holder."
	},
	"toxicplate": {
		id: "toxicplate",
		name: "Toxic Plate",
		spritenum: 516,
		fling: {
			basePower: 90
		},
		onPlate: 'Poison',
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Poison') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Poison-type moves 20%. Pokemon with Multitype become Poison-type."
	},
	"twistedspoon": {
		id: "twistedspoon",
		name: "TwistedSpoon",
		spritenum: 520,
		fling: {
			basePower: 30
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Psychic') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Psychic-type moves 20%."
	},
	"wacanberry": {
		id: "wacanberry",
		name: "Wacan Berry",
		spritenum: 526,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Electric"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Electric' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Electric-type attack by 50%. Consumed after use."
	},
	"watergem": {
		id: "watergem",
		name: "Water Gem",
		spritenum: 528,
		isGem: true,
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Water') {
				if (user.useItem()) {
					this.add('-enditem', user, 'Water Gem', '[from] gem', '[move] '+move.name);
					return basePower * 1.5;
				}
			}
		},
		desc: "Raises the power of a Water-type move by 50%. One-time use."
	},
	"watmelberry": {
		id: "watmelberry",
		name: "Watmel Berry",
		spritenum: 530,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Fire"
		},
		desc: "No use. Unobtainable in BW."
	},
	"waveincense": {
		id: "waveincense",
		name: "Wave Incense",
		spritenum: 531,
		fling: {
			basePower: 10
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Water') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Water-type moves 20%. Allows breeding of Mantyke."
	},
	"wepearberry": {
		id: "wepearberry",
		name: "Wepear Berry",
		spritenum: 533,
		isBerry: true,
		naturalGift: {
			basePower: 70,
			type: "Electric"
		},
		desc: "No use. Unobtainable in BW."
	},
	"whiteherb": {
		id: "whiteherb",
		name: "White Herb",
		spritenum: 535,
		fling: {
			basePower: 10,
			effect: function(pokemon) {
				var activate = false;
				var boosts = {};
				for (var i in pokemon.baseBoosts) {
					if (pokemon.baseBoosts[i] < 0) {
						activate = true;
						boosts[i] = 0;
					}
				}
				if (activate) {
					pokemon.setBoost(boosts);
				}
			}
		},
		onUpdate: function(pokemon) {
			var activate = false;
			var boosts = {};
			for (var i in pokemon.baseBoosts) {
				if (pokemon.baseBoosts[i] < 0) {
					activate = true;
					boosts[i] = 0;
				}
			}
			if (activate && pokemon.useItem()) {
				pokemon.setBoost(boosts);
				this.add('-restoreboost', pokemon, '[silent]');
			}
		},
		desc: "Removes stat decreases. Consumed after use."
	},
	"widelens": {
		id: "widelens",
		name: "Wide Lens",
		spritenum: 537,
		fling: {
			basePower: 10
		},
		onModifyMove: function(move) {
			if (typeof move.accuracy === 'number') {
				move.accuracy *= 1.1;
			}
		},
		desc: "Raises accuracy 10%."
	},
	"wikiberry": {
		id: "wikiberry",
		name: "Wiki Berry",
		spritenum: 538,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Rock"
		},
		onUpdate: function(pokemon) {
			if (pokemon.hp <= pokemon.maxhp/2) {
				pokemon.eatItem();
			}
		},
		onEat: function(pokemon) {
			this.heal(pokemon.maxhp/8);
			if (pokemon.getNature().minus === 'spa') {
				pokemon.addVolatile('confusion');
			}
		},
		desc: "Restores 1\/8 max HP when at 50% HP or less. May confuse. One-time use."
	},
	"wiseglasses": {
		id: "wiseglasses",
		name: "Wise Glasses",
		spritenum: 539,
		fling: {
			basePower: 10
		},
		onBasePower: function(basePower, user, target, move) {
			if (move.category === 'Special') {
				return basePower * 1.1;
			}
		},
		desc: "Raises damage from special moves 10%."
	},
	"yacheberry": {
		id: "yacheberry",
		name: "Yache Berry",
		spritenum: 567,
		isBerry: true,
		naturalGift: {
			basePower: 60,
			type: "Ice"
		},
		onSourceBasePower: function(basePower, user, target, move) {
			if (move.type === 'Ice' && this.getEffectiveness(move.type, target) > 0) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					return basePower * 0.5;
				}
			}
		},
		onEat: function() { },
		desc: "Reduces damage from a super effective Ice-type attack by 50%. Consumed after use."
	},
	"zapplate": {
		id: "zapplate",
		name: "Zap Plate",
		spritenum: 572,
		fling: {
			basePower: 90
		},
		onPlate: 'Electric',
		onBasePower: function(basePower, user, target, move) {
			if (move.type === 'Electric') {
				return basePower * 1.2;
			}
		},
		desc: "Raises power of Electric moves 20%. Pokemon with Multitype become Electric-type."
	},
	"zoomlens": {
		id: "zoomlens",
		name: "Zoom Lens",
		spritenum: 574,
		fling: {
			basePower: 10
		},
		onModifyMove: function(move, user, target) {
			if (typeof move.accuracy === 'number' && !this.willMove(target)) {
				this.debug('Zoom Lens boosting accuracy');
				move.accuracy *= 1.2;
			}
		},
		desc: "Raises accuracy by 20% if the holder moves after the target."
	},
    nums: {
        0: "(No Item)",
        1: "Big Root",
        2: "Blue Scarf",
        3: "BrightPowder",
        4: "Choice Band",
        5: "Choice Scarf",
        6: "Choice Specs",
        7: "Destiny Knot",
        8: "Expert Belt",
        9: "Focus Band",
        10: "Focus Sash",
        11: "Full Incense",
        12: "Green Scarf",
        13: "Lagging Tail",
        14: "Lax Incense",
        15: "Leftovers",
        16: "Luck Incense",
        17: "Mental Herb",
        18: "Metal Powder",
        19: "Muscle Band",
        20: "Odd Incense",
        21: "Pink Scarf",
        22: "Power Herb",
        23: "Pure Incense",
        24: "Quick Powder",
        25: "Reaper Cloth",
        26: "Red Scarf",
        27: "Rock Incense",
        28: "Rose Incense",
        29: "Sea Incense",
        30: "Shed Shell",
        31: "Silk Scarf",
        32: "Silver Powder",
        33: "Smooth Rock",
        34: "Soft Sand",
        35: "Soothe Bell",
        36: "Wave Incense",
        37: "White Herb",
        38: "Wide Lens",
        39: "Wise Glasses",
        40: "Yellow Scarf",
        41: "Zoom Lens",
        42: "Amulet Coin",
        43: "Antidote",
        44: "Awakening",
        45: "Berry Juice",
        46: "Big Pearl",
        47: "Big Mushroom",
        48: "Black Belt",
        49: "Black Flute",
        50: "Black Sludge",
        51: "BlackGlasses",
        52: "Blue Flute",
        53: "Blue Shard",
        54: "Burn Heal",
        55: "Calcium",
        56: "Carbos",
        57: "Charcoal",
        58: "Cleanse Tag",
        59: "Damp Mulch",
        60: "DeepSeaScale",
        61: "Dire Hit",
        62: "Dragon Scale",
        63: "Elixir",
        64: "Energy Root",
        65: "EnergyPowder",
        66: "Escape Rope",
        67: "Ether",
        68: "Everstone",
        69: "Exp. Share",
        70: "Fire Stone",
        71: "Flame Orb",
        72: "Fluffy Tail",
        73: "Fresh Water",
        74: "Full Heal",
        75: "Full Restore",
        76: "Gooey Mulch",
        77: "Green Shard",
        78: "Growth Mulch",
        79: "Guard Spec.",
        80: "Heal Powder",
        81: "Heart Scale",
        82: "Honey",
        83: "HP Up",
        84: "Hyper Potion",
        85: "Ice Heal",
        86: "Iron",
        87: "King's Rock",
        88: "Lava Cookie",
        89: "Leaf Stone",
        90: "Lemonade",
        91: "Life Orb",
        92: "Light Ball",
        93: "Light Clay",
        94: "Lucky Egg",
        95: "Magnet",
        96: "Max Elixir",
        97: "Max Ether",
        98: "Max Potion",
        99: "Max Repel",
        100: "Max Revive",
        101: "Metal Coat",
        102: "Metronome",
        103: "Miracle Seed",
        104: "Moomoo Milk",
        105: "Moon Stone",
        106: "Mystic Water",
        107: "NeverMeltIce",
        108: "Nugget",
        109: "Old Gateau",
        110: "Parlyz Heal",
        111: "Pearl",
        112: "Poké Doll",
        113: "Potion",
        114: "PP Max",
        115: "PP Up",
        116: "Protein",
        117: "Rare Candy",
        118: "Razor Fang",
        119: "Red Flute",
        120: "Red Shard",
        121: "Repel",
        122: "Revival Herb",
        123: "Revive",
        124: "Sacred Ash",
        125: "Scope Lens",
        126: "Shell Bell",
        127: "Shoal Salt",
        128: "Shoal Shell",
        129: "Smoke Ball",
        130: "Soda Pop",
        131: "Soul Dew",
        132: "Spell Tag",
        133: "Stable Mulch",
        134: "Star Piece",
        135: "Stardust",
        136: "Sun Stone",
        137: "Super Potion",
        138: "Super Repel",
        139: "Thunderstone",
        140: "TinyMushroom",
        141: "Toxic Orb",
        142: "TwistedSpoon",
        143: "Up-Grade",
        144: "Water Stone",
        145: "White Flute",
        146: "X Accuracy",
        147: "X Attack",
        148: "X Defend",
        149: "X Special",
        150: "X Sp. Def",
        151: "X Speed",
        152: "Yellow Flute",
        153: "Yellow Shard",
        154: "Zinc",
        155: "Icy Rock",
        156: "Lucky Punch",
        157: "Dubious Disc",
        158: "Sharp Beak",
        159: "Adamant Orb",
        160: "Damp Rock",
        161: "Heat Rock",
        162: "Lustrous Orb",
        163: "Macho Brace",
        164: "Stick",
        165: "Dragon Fang",
        166: "Poison Barb",
        167: "Power Anklet",
        168: "Power Band",
        169: "Power Belt",
        170: "Power Bracer",
        171: "Power Lens",
        172: "Power Weight",
        173: "Dawn Stone",
        174: "Dusk Stone",
        175: "Electirizer",
        176: "Magmarizer",
        177: "Odd Keystone",
        178: "Oval Stone",
        179: "Protector",
        180: "Quick Claw",
        181: "Razor Claw",
        182: "Shiny Stone",
        183: "Sticky Barb",
        184: "DeepSeaTooth",
        185: "Draco Plate",
        186: "Dread Plate",
        187: "Earth Plate",
        188: "Fist Plate",
        189: "Flame Plate",
        190: "Grip Claw",
        191: "Icicle Plate",
        192: "Insect Plate",
        193: "Iron Plate",
        194: "Meadow Plate",
        195: "Mind Plate",
        196: "Sky Plate",
        197: "Splash Plate",
        198: "Spooky Plate",
        199: "Stone Plate",
        200: "Thick Club",
        201: "Toxic Plate",
        202: "Zap Plate",
        203: "Armor Fossil",
        204: "Claw Fossil",
        205: "Dome Fossil",
        206: "Hard Stone",
        207: "Helix Fossil",
        208: "Old Amber",
        209: "Rare Bone",
        210: "Root Fossil",
        211: "Skull Fossil",
        212: "Iron Ball",
        213: "Griseous Orb",
        214: "Air Mail",
        215: "Bloom Mail",
        216: "Brick Mail",
        217: "Bubble Mail",
        218: "Flame Mail",
        219: "Grass Mail",
        220: "Harbor Mail",
        221: "Heart Mail",
        222: "Mosaic Mail",
        223: "Snow Mail",
        224: "Space Mail",
        225: "Steel Mail",
        226: "Tunnel Mail",
        227: "Douse Drive",
        228: "Shock Drive",
        229: "Burn Drive",
        230: "Chill Drive",
        231: "Sweet Heart",
        232: "Prism Scale",
        233: "Eviolite",
        234: "Float Stone",
        235: "Rocky Helmet",
        236: "Air Balloon",
        237: "Red Card",
        238: "Ring Target",
        239: "Binding Band",
        240: "Absorb Bulb",
        241: "Cell Battery",
        242: "Eject Button",
        243: "Fire Gem",
        244: "Water Gem",
        245: "Electric Gem",
        246: "Grass Gem",
        247: "Ice Gem",
        248: "Fighting Gem",
        249: "Poison Gem",
        250: "Ground Gem",
        251: "Flying Gem",
        252: "Psychic Gem",
        253: "Bug Gem",
        254: "Rock Gem",
        255: "Ghost Gem",
        256: "Dragon Gem",
        257: "Dark Gem",
        258: "Steel Gem",
        259: "Normal Gem",
        260: "Health Wing",
        261: "Muscle Wing",
        262: "Resist Wing",
        263: "Genius Wing",
        264: "Clever Wing",
        265: "Swift Wing",
        266: "Pretty Wing",
        267: "Dream Ball",
        268: "BalmMushroom",
        269: "Big Nugget",
        270: "Pearl String",
        271: "Comet Shard",
        272: "Relic Copper",
        273: "Relic Silver",
        274: "Relic Gold",
        275: "Relic Vase",
        276: "Relic Band",
        277: "Relic Statue",
        278: "Relic Crown",
        279: "Casteliacone",
        280: "Dire Hit 2",
        281: "X Speed 2",
        282: "X Special 2",
        283: "X Sp. Def 2",
        284: "X Defend 2",
        285: "X Attack 2",
        286: "X Accuracy 2",
        287: "X Speed 3",
        288: "X Special 3",
        289: "X Sp. Def 3",
        290: "X Defend 3",
        291: "X Attack 3",
        292: "X Accuracy 3",
        293: "X Speed 6",
        294: "X Special 6",
        295: "X Sp. Def 6",
        296: "X Defend 6",
        297: "X Attack 6",
        298: "X Accuracy 6",
        299: "Ability Urge",
        300: "Item Drop",
        301: "Item Urge",
        302: "Reset Urge",
        303: "Dire Hit 3",
        304: "Berserk Gene",
        305: "Poké Ball",
        306: "Great Ball",
        307: "Ultra Ball",
        308: "Master Ball",
        309: "Safari Ball",
        310: "Level Ball",
        311: "Lure Ball",
        312: "Moon Ball",
        313: "Friend Ball",
        314: "Love Ball",
        315: "Heavy Ball",
        316: "Fast Ball",
        317: "Sport Ball",
        318: "Premier Ball",
        319: "Repeat Ball",
        320: "Timer Ball",
        321: "Nest Ball",
        322: "Net Ball",
        323: "Dive Ball",
        324: "Luxury Ball",
        325: "Heal Ball",
        326: "Quick Ball",
        327: "Dusk Ball",
        328: "Cherish Ball",
        329: "Park Ball",
        1000: "Pink Bow",
        1001: "Polkadot Bow"
    }
};
