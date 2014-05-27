$(function () {
    "use strict";


    var $body = $(document.body),
        devices = window.App.devices,
        keys = window.$$legend.keys,
        selected;


    $('.scenes-wrapper').on('nav_key', function (e) {
        if (['up', 'down', 'right', 'enter'].indexOf(e.keyName) !== -1) {
            keys.yellow('Add to favourites');
            devices = window.App.devices;
            selected = devices.findWhere({selected: true, show: true});
            if (selected) {
                if (['switchBinary', 'switchRGBW'].indexOf(selected.get('deviceType')) !== -1) {
                    keys.enter('enter');
                } else {
                    keys.enter('');
                }
            } else {
                keys.enter('');
            }
        } else {
            keys.yellow('');
            keys.enter('');
        }
    });
});

