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
            metrics: 'object',
            id: 'string',
            location: 'any',
            tags: 'array',
            creatorId: 'number',
            deviceType: 'string',
            permanently_hidden: 'boolean'
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
