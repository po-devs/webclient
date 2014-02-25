$(function () {
    var defaultAvatar = 125;

    $("#user_params_color_picker").farbtastic("#user_params_color");

    var $idle = $("#user_params_idle"),
        $ladder = $("#user_params_ladder"),
        $timestamps = $("#user_params_timestamps"),
        $username = $("#user_params_username"),
        $avatar = $("#user_params_avatar"),
        $avatarImg = $("#user_params_avatar_image").find("img").add("#trainer_img"),
        $trainerUsername = $("#trainer_username"),
        dirty = false;

    function toggle(e, active) {
        var setting = this.getAttribute('data-setting');
        dirty = true;

        switch (setting) {
        case 'idle':
            poStorage.set("player.idle", active);
            break;
        case 'ladder':
            poStorage.set("player.ladder", active);
            break;
        case 'timestamps':
            poStorage.set("chat.timestamps", active);
            $(".timestamp-enabled").toggleClass("timestamp", active);
            break;
        }
    }

    $idle.toggles({on: poStorage("player.idle", "boolean")}).on('toggle', toggle);
    $ladder.toggles({on: poStorage("player.ladder", "boolean")}).on('toggle', toggle);
    $timestamps.toggles({on: poStorage("chat.timestamps", "boolean")}).on('toggle', toggle);

    // TODO: Validator
    $username.change(function () {
        poStorage.set('player.name', $username.val());
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

    // TODO: Send stuff to relay
    $("#user_params_submit").click(function (e, auto) {
        if (auto && !dirty) {
            return;
        }

        if (!auto) {
            $("#po_title").click();
        }
    });
});
