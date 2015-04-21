'use strict';

var DeviceModel = require('../models/device_model'),
    DevicesCollection;

    /**
     * @constructor DevicesCollection
     * Collection of virtual devices
     * */
    DevicesCollection = Backbone.Collection.extend({
        model: DeviceModel,
        methodToURL: {
            read: '/devices',
            create: '/devices',
            update: '/devices',
            delete: '/devices'
        },
        sync: function (method, model, options) {
            var self = this;

            options = options || {};
            options.data = {since: self.updateTime || 0};
            options.url = model.methodToURL[method.toLowerCase()];
            Backbone.sync(method, model, options);
        },
        parse: function (response) {
            var self = this;

            self.updateTime = response.data.updateTime;

            return response.data.devices;
        },
        initialize: function () {
            console.log('Init collection');
        }
    });

module.exports = DevicesCollection;