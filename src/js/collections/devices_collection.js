'use strict';
var Collection = require('ampersand-collection'),
    restMixin = require('ampersand-collection-rest-mixin'),
    underscoreMixin = require('ampersand-collection-underscore-mixin'),
    ajaxSettings = require('../helpers/ajaxSettings'),
    DeviceModel = require('../models/device_model'),
    DevicesCollection;

    /**
     * @constructor DevicesCollection
     * Collection of virtual devices
     * */
    DevicesCollection = Collection.extend(underscoreMixin, restMixin, ajaxSettings, {
        model: DeviceModel,
        updateTime: 0,
        parse: function (response) {
            var self = this;

            self.updateTime = response.data.updateTime;

            return response.data.devices;
        },
        methodToURL: {
            read: '/devices',
            create: '/devices',
            update: '/devices',
            delete: '/devices'
        }
    });

module.exports = DevicesCollection;