$(function () {
    "use strict";

    var devices,
        profiles,
        keys = window.$$legend.keys,
        selected;

    $('.scenes-wrapper').on('nav_key', function (e) {
        devices = window.App.devices;
        profiles = window.App.profiles;
        selected = devices.findWhere({selected: true, show: true});

        if (['up', 'down', 'right', 'enter'].indexOf(e.keyName) !== -1) {
            if (profiles.getActive().get('positions').indexOf(selected.id) === -1) {
                keys.yellow('Add to favourites');
            } else {
                keys.yellow('Remove from favourites');
            }

        } else {
            keys.yellow('');
        }

        // events
        if (e.keyName === 'yellow') {
            profiles.toggleDevice(selected.id);
        }
    });
});

