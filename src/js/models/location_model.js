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
            title: 'string'
        },
        parse: function (response) {
            return response.hasOwnProperty('data') ? response.data : response;
        }
    });

module.exports = LocationModel;
