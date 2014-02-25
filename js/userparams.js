$(function () {
    var $idle = $("#user_params_idle"),
        $ladder = $("#user_params_ladder"),
        $timestamps = $("#user_params_timestamps"),
        $username = $("#user_params_username"),
        $avatar = $("#user_params_avatar"),
        $avatarImg = $("#user_params_avatar_image").find("img").add("#trainer_img"),
        $trainerUsername = $("#trainer_username"),
        $userParamsColor = $("#user_params_color");

    var defaultAvatar = 125,
        dirty = false;

    $userParamsColor.val(poStorage.get('player.color') || '#123456');
    $("#user_params_color_picker").farbtastic($userParamsColor);

    function toggle(e, active) {
        var setting = this.getAttribute('data-setting');

        switch (setting) {
        case 'idle':
            dirty = true;
            poStorage.set("player.idle", active);
            break;
        case 'ladder':
            dirty = true;
            poStorage.set("player.ladder", active);
            break;
        case 'timestamps':
            poStorage.set("chat.timestamps", active);
            $(".timestamp-enabled").toggleClass("timestamp", active);
            break;
        }
    }

    $idle.toggles({on: poStorage("player.idle", "boolean"), text: {on: 'YES', off: 'NO'}}).on('toggle', toggle);
    $ladder.toggles({on: poStorage("player.ladder", "boolean")}).on('toggle', toggle);
    $timestamps.toggles({on: poStorage("chat.timestamps", "boolean")}).on('toggle', toggle);

    // TODO: Validator
    $username.on('keyup change', function () {
        poStorage.set('player.name', $username.val());
        dirty = true;
    });

    $userParamsColor.on('keyup change', function () {
        poStorage.set('player.color', $userParamsColor.val());
        dirty = true;
    });

    $trainerUsername.on('received', function () {
        $username.val($trainerUsername.text());
    });

    $avatar.val(poStorage('player.avatar', 'number') || defaultAvatar).on('keyup change', function () {
        var num = parseInt($avatar.val(), 10);
        if (isNaN(num) || (num < 1 || num > 300)) {
            $avatar.val(poStorage('player.avatar', 'number') || defaultAvatar);
            return;
        }

        poStorage.set('player.avatar', num);
        $avatarImg.attr('src', 'http://pokemon-online.eu/images/trainers/' + num + '.png');
        dirty = true;
    });

    $avatarImg.attr('src', 'http://pokemon-online.eu/images/trainers/' + (poStorage('player.avatar') || defaultAvatar) + '.png');

    $("#user_params_submit").click(function (e, auto) {
        webclient.sendProfile();
        $("#po_title").click();
    });

    webclient.sendProfile = function () {
        if (!dirty) {
            return;
        }

        network.command('teamchange', {
            color: poStorage.get('player.color'),
            name: poStorage.get('player.name')
        });

        dirty = false;
    };
});
