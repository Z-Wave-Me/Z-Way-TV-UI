'use strict';

var app = require('ampersand-app'),
    Legend;

Legend = function() {
    var self = this,
        activeDeviceType =  app.state.get('activeDeviceType'),
        includePanels = app.state.get('includePanels');

    app.state.on('change:deviceId change:column', function() {
        var column = app.state.get('column'),
            deviceId = app.state.get('deviceId'),
            device = app.collections.devices.get(deviceId),
            isActive = device ? activeDeviceType.indexOf(device.get('deviceType')) !== -1 : false,
            isIncludePanel = device ? includePanels.hasOwnProperty(device.get('deviceType')) : false;

        if (column === 2) {
            if (isActive) {
                $$legend.keys.enter('Send command');
                $$legend.keys.updown('');
            }
        } else if (column === 3) {
            if (isIncludePanel) {
                $$legend.keys.updown('Increase/Decrease');
                $$legend.keys.enter('');
            }
        } else {
            $$legend.keys.yellow('');
            $$legend.keys.enter('');
            $$legend.keys.updown('');
        }
    });

    $$legend.show();
};

module.exports = Legend;