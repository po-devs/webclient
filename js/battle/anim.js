
/* All the animation code is done by a separate class in order to keep code clean, and easily change animation mechanics
 as we're probably bound to do that.
 */
function BattleAnimator(battle) {
    battle.animator = this;
    this.battle = battle;
}

BattleAnimator.prototype.on = function(what) {
    var funcName = "on"+what[0].toUpperCase()+what.slice(1);
    if (funcName in BattleAnimator.prototype) {
        this.pause();

        /* arguments.slice() doesn't work, unfortunately */
        var newargs= [];
        for (var i = 1; i < arguments.length; i++) {
            newargs.push(arguments[i]);
        }
        /* Call the function with the same arguments, except the name of the command */
        this[funcName].apply(this, newargs);
    }
};

BattleAnimator.prototype.pause = function () {
    this.battle.pause();
};

BattleAnimator.prototype.unpause = function() {
    this.battle.unpause();
};

BattleAnimator.prototype.finished = function() {
    this.battle.unpause();
};

/*
    Gives the property changes when moving the sprite in a direction
 */
BattleAnimator.prototype.move = function(img, x, y) {
    var p = this.battle.player(img.spot);

    //this.battle.print("Player: " + p + ", spot: " + img.spot);
    if (p == 0) {
        return {"bottom": "+=" + y, "left": "+=" + x}
    } else {
        return {"top": "-=" + y, "right": "-=" + x}
    }
};

BattleAnimator.prototype.zoom = function(img, x) {
    return {"width": img.w * x, "height": img.h * x};
};

BattleAnimator.prototype.rel = function(img, x) {
    var p = this.battle.player(img.spot);

    if (p == 0) {
        return x;
    } else {
        return -x
    }
};

/* Introduces a new sprite (like a pokeball, or whatever) on the battle screen */
BattleAnimator.prototype.createImage = function(spot, effect) {
    var b = this.battle;
    var url = "images/" + BattleTab.effects[effect].url;

    var content = b.$content.find(".battle_window_content");

    var $img = $("<img src=\"" + url + "\" class=\"sprite\"/>");
    content.append($img);
    b.setPos($img, spot, effect);

    return $img;
};


BattleAnimator.prototype.fullCss = function(img, dict) {
    var dx = 0;
    var dy = 0;
    var zoom = 1;

    if (dict.zoom) {
        zoom = dict.zoom;
    }
    if (dict.relx) {
        dx = this.rel(img, dict.relx);
    } else if (dict.x) {
        dx = dict.x;
    }
    if (dict.rely) {
        dy = this.rel(img, dict.rely);
    } else if (dict.y) {
        dy = dict.y;
    }

    return $.extend(this.move(img, dx, dy), this.zoom(img, zoom));
};

BattleAnimator.prototype.showEffect = function(spot, effect, beginning, end, after, callback) {
    var img = this.createImage(spot, effect);
    var css = this.fullCss(img, beginning);
    img.css(css);

    var anim = this.transition(this.fullCss(img, end), "ballistic2");

    img.animate(anim, function() {
        if (after == "fade") {
            img.animate({
                opacity: 0
            }, 100, function() {
                img.remove();
            });
        } else {
            img.remove();
        }

        callback();
    });
};

BattleAnimator.prototype.onKo = function(spot) {
    var self = this;
    var b = this.battle;
    var sprite = b.$sprite(spot);

    sprite.animate($.extend(this.move(sprite, 0, -50), {"opacity": 0}), "slow", function() {
        sprite.css(self.move(sprite, 0, +50));//reset move
        self.finished();
    });
};

BattleAnimator.prototype.onSend = function(spot) {
    var b = this.battle;
    var sprite = b.$sprite(spot);
    var poke = b.pokes[spot];
    var $poke = b.$poke(spot);
    var self = this;

    $poke.find(".pokemon_name").text(poke.name);
    $poke.find(".sprite").attr("src", "");
    $poke.find(".sprite").attr("src", pokeinfo.battlesprite(poke, {"gen": b.conf.gen, "back": b.player(spot) == 0}));
    b.setPos(sprite, spot, poke);
    $poke.find(".battle-stat-value").text(poke.percent + "%");

    var $prog = $poke.find(".battle-stat-progress");
    $prog.removeClass("battle-stat-progress-1x battle-stat-progress-2x battle-stat-progress-3x battle-stat-progress-4x");
    $prog.addClass("battle-stat-progress-" + (Math.floor(poke.percent*4/100.1)+1) + "x");
    $prog.css("width", poke.percent + "%");

    this.showEffect(spot, "pokeball", {"relx": -100, "y": 60, "zoom": 0.7},
        {"relx": 100, "y": -60}, "fade",

        function() {
            sprite.css("opacity", 100);
            self.finished();
        }
    );
};

BattleAnimator.prototype.onSendback = function(spot) {
    var b = this.battle;
    var sprite = b.$sprite(spot);
    var self = this;

    sprite.css("opacity", 0);

    this.showEffect(spot, "pokeball", {},
        {"relx": -100, "y": +60, "zoom": 0.7}, "fade",

        function() {
            self.finished();
        }
    );
};

BattleAnimator.prototype.onHpchange = function(spot, oldpercent, newpercent) {
    var self = this;
    var $prog = this.battle.$poke(spot).find(".battle-stat-progress");
    var $text = this.battle.$poke(spot).find(".battle-stat-value");

    oldpercent = Math.floor(oldpercent);
    newpercent = Math.floor(newpercent);
    var duration = Math.abs(newpercent-oldpercent)*25;

    $prog.animate({"width":newpercent+"%"}, {"duration": duration, "easing": "linear",
        "progress": function(animation, progress, remaining) {
            $prog.removeClass("battle-stat-progress-1x battle-stat-progress-2x battle-stat-progress-3x battle-stat-progress-4x");

            var current = oldpercent + (newpercent-oldpercent)*progress;
            $prog.addClass("battle-stat-progress-" + (Math.floor(current*4/100.1)+1) + "x");
            $text.text(Math.floor(current) + "%");
        },
        "complete": function(){self.finished();}
    });
};


BattleAnimator.prototype.transition = function (movement, transition) {
    var transitionMap = {
        left: 'linear',
        top: 'linear',
        width: 'linear',
        height: 'linear',
        opacity: 'linear'
    };
    var up = (movement.top || movement.bottom).slice(2) > 0;
    var right = (movement.left || movement.right).slice(2) > 0;

    if (transition === 'ballistic') {
        transitionMap.top = (up ? 'ballisticUp' : 'ballisticDown');
    }
    if (transition === 'ballisticUnder') {
        transitionMap.top = (up ? 'ballisticDown' : 'ballisticUp');
    }
    if (transition === 'ballistic2') {
        transitionMap.top = (up ? 'quadUp' : 'quadDown');
    }
    if (transition === 'ballistic2Under') {
        transitionMap.top = (up ? 'quadDown' : 'quadUp');
    }
    if (transition === 'swing') {
        transitionMap.left = 'swing';
        transitionMap.top = 'swing';
        transitionMap.width = 'swing';
        transitionMap.height = 'swing';
    }
    if (transition === 'accel') {
        transitionMap.left = 'quadDown';
        transitionMap.top = 'quadDown';
        transitionMap.width = 'quadDown';
        transitionMap.height = 'quadDown';
    }
    if (transition === 'decel') {
        transitionMap.left = 'quadUp';
        transitionMap.top = 'quadUp';
        transitionMap.width = 'quadUp';
        transitionMap.height = 'quadUp';
    }

    var ret;
    if (movement.top) {
        ret = {
            right: [movement.right, transitionMap.left],
            top: [movement.top, transitionMap.top]
            //opacity: [pos.opacity, transitionMap.opacity]
        };
    } else {
        ret = {
            left: [movement.left, transitionMap.left],
            bottom: [movement.bottom, transitionMap.top]
            //opacity: [pos.opacity, transitionMap.opacity]
        };
    }

    if (movement.width) {
        ret.width = [movement.width, transitionMap.width]
    }
    if (movement.height) {
        ret.height = [movement.width, transitionMap.height]
    }
    return ret;
};

$.extend($.easing, {
    ballisticUp: function (x, t, b, c, d) {
        return -3 * x * x + 4 * x;
    },
    ballisticDown: function (x, t, b, c, d) {
        x = 1 - x;
        return 1 - (-3 * x * x + 4 * x);
    },
    quadUp: function (x, t, b, c, d) {
        x = 1 - x;
        return 1 - (x * x);
    },
    quadDown: function (x, t, b, c, d) {
        return x * x;
    }
});

BattleTab.effects = {
    wisp: {
        url: 'fx/wisp.png',
        w: 100, h: 100
    },
    poisonwisp: {
        url: 'fx/poisonwisp.png',
        w: 100, h: 100
    },
    waterwisp: {
        url: 'fx/waterwisp.png',
        w: 100, h: 100
    },
    fireball: {
        url: 'fx/fireball.png',
        w: 64, h: 64
    },
    icicle: {
        url: 'fx/icicle.png', // http://opengameart.org/content/icicle-spell
        w: 80, h: 60
    },
    lightning: {
        url: 'fx/lightning.png', // http://opengameart.org/content/lightning-shock-spell
        w: 48, h: 229
    },
    rock: {
        url: 'fx/rock.png', // http://opengameart.org/content/rock-low-poly
        w: 80, h: 80
    },
    rocks: {
        url: 'fx/rocks.png', // Pokemon Online - Gilad
        w: 100, h: 100
    },
    rock1: {
        url: 'fx/rock1.png', // Pokemon Online - Gilad
        w: 64, h: 80
    },
    rock2: {
        url: 'fx/rock2.png', // Pokemon Online - Gilad
        w: 66, h: 72
    },
    caltrop: {
        url: 'fx/caltrop.png', // http://en.wikipedia.org/wiki/File:Caltrop.jpg
        w: 80, h: 80
    },
    poisoncaltrop: {
        url: 'fx/poisoncaltrop.png', // http://en.wikipedia.org/wiki/File:Caltrop.jpg
        w: 80, h: 80
    },
    shadowball: {
        url: 'fx/shadowball.png',
        w: 100, h: 100
    },
    energyball: {
        url: 'fx/energyball.png',
        w: 100, h: 100
    },
    electroball: {
        url: 'fx/electroball.png',
        w: 100, h: 100
    },
    pokeball: {
        url: 'fx/pokeball.png',
        w: 24, h: 24
    },
    fist: {
        url: 'fx/fist.png',
        w: 56, h: 44
    },
    foot: {
        url: 'fx/foot.png',
        w: 52, h: 64
    },
    topbite: {
        url: 'fx/topbite.png',
        w: 108, h: 64
    },
    bottombite: {
        url: 'fx/bottombite.png',
        w: 108, h: 64
    },
    none: {
        // this is for passing to battle.pos() and battle.posT() for CSS effects
        w: 100, h: 100
    }
};