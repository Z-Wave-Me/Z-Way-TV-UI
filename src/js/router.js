'use strict';

var app = require('ampersand-app'),
    Router = require('ampersand-router'),
    router = Router.extend({
        routes: {
            '': 'devices',
            'devices/:filterType/(/:filterId)(/:deviceId)(/:options)': 'devices'
        },
        devices: function(filterType, filterId, deviceId, options) {
            var self = this,
                activeColumn = 0;

            filterType = filterType || 'all';
            filterId = filterId || null;
            deviceId = deviceId || null;
            options = options || false;

            if (deviceId !== undefined) {
                activeColumn = 1;
            } else if (options !== undefined) {
                activeColumn = 2;
            }

            app.state.set('column', activeColumn);
            app.state.set('filterType', filterType);
            app.state.set('filterId', filterId);
            app.state.set('deviceId', deviceId);
            app.state.set('options', options);
        }
    });

module.exports = router;