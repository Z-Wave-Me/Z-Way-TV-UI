'use strict';
var Collection = require('ampersand-collection'),
    restMixin = require('ampersand-collection-rest-mixin'),
    underscoreMixin = require('ampersand-collection-underscore-mixin'),
    ajaxSettings = require('../helpers/ajaxSettings'),
    LocationModel = require('../models/location_model'),
    LocationCollection;

    /**
     * @constructor DevicesCollection
     * Collection of rooms
     * */
    LocationCollection = Collection.extend(underscoreMixin, restMixin, ajaxSettings, {
        model: LocationModel,
        methodToURL: {
            read: '/locations',
            create: '/locations',
            update: '/locations',
            delete: '/locations'
        }
    });

module.exports = LocationCollection;