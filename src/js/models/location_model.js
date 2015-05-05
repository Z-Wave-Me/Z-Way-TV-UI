'use strict';

var AmpersandModel = require('ampersand-model'),
    ajaxSettings = require('../helpers/ajaxSettings'),
    LocationModel = AmpersandModel.extend(ajaxSettings, {
        methodToURL: {
            read: '/locations',
            create: '/locations',
            update: '/locations',
            delete: '/locations'
        },
        props: {
            id: 'number',
            title: 'string',
            icon: 'string'
        }
    });

module.exports = LocationModel;
