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
    methodToURL: {
        read: '/devices',
        create: '/devices',
        update: '/devices',
        delete: '/devices'
    },
    parse: function(response) {
        var self = this;

        if (response.data.structureChanged) {
            self._onStructureChanged(response.data.devices);
        }

        if (self.updateTime !== 0) {
            response.data.devices.forEach(function(device) {
                var model = self.get(device.id);

                if (model && model.get('metrics').level !== device.metrics.level) {
                    model.set('metrics', device.metrics).trigger('change:metrics');
                }
            });
        }

        self.updateTime = response.data.updateTime;

        return response.data.devices;
    },
    _onStructureChanged: function(receivedDevices) {
        var self = this,
            removedDevices = self.filter(function(device) {
                return !_.some(receivedDevices, function(receivedDevice) {
                    return receivedDevice.id === device.id;
                });
            });


        removedDevices.forEach(self.remove.bind(self));
    }
});

module.exports = DevicesCollection;