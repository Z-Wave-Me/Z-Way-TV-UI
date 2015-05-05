'use strict';

var AmpersandModel = require('ampersand-model'),
    ajaxSettings = require('../helpers/ajaxSettings'),
    ProfileModel = AmpersandModel.extend(ajaxSettings, {
        methodToURL: {
            read: '/profile',
            create: '/profile',
            update: '/profile',
            delete: '/profile'
        },
        props: {
            id: 'number',
            name: 'string',
            positions: 'array',
            description: 'string'
        },
        parse: function (response) {
            return response.hasOwnProperty('data') ? response.data : response;
        }
    });

module.exports = ProfileModel;
