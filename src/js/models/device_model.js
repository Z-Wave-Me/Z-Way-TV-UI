'use strict';

var AmpersandModel = require('ampersand-model'),
    ajaxSettings = require('../helpers/ajaxSettings'),
    DeviceModel = AmpersandModel.extend(ajaxSettings, {
        methodToURL: {
            read: '/devices',
            create: '/devices',
            update: '/devices',
            delete: '/devices'
        },
        props: {
            metrics: 'object'
        },
        parse: function (response) {
            return response.hasOwnProperty('data') ? response.data : response;
        },
        command: function (value, command, getParams) {
            var options = {};

            getParams = getParams || {};
            command = command || 'command';

            _.extend(options, {data: getParams});

            options.url = this.methodToURL.read + this.url() + '/' + command + '/' + value;
        }
    });

module.exports = DeviceModel;
