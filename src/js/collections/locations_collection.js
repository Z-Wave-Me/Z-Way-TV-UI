'use strict';
var LocationModel = require('../models/location_model'),
    LocationsCollection = Backbone.Collection.extend({
        model: LocationModel,
        methodToURL: {
            'read': '/locations',
            'create': '/locations',
            'update': '/locations',
            'delete': '/locations'
        },
        sync: function (method, model, options) {
            options = options || {};
            options.url = model.methodToURL[method.toLowerCase()];
            Backbone.sync(method, model, options);
        },
        parse: function (response) {
            return response.data;
        }
    });

module.exports = LocationsCollection;