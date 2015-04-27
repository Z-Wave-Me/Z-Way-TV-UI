'use strict';

var AmpersandModel = require('ampersand-model'),
    AmpersandState = require('ampersand-state'),
    AmpersandApplicationState = AmpersandState.extend({
        props: {
            column: 'number',
            filterType: 'string',
            filterId: 'string',
            deviceId: 'string'
        }
    });

module.exports = AmpersandApplicationState;