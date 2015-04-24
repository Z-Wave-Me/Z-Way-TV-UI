'use strict';
var Collection = require('ampersand-collection'),
    restMixin = require('ampersand-collection-rest-mixin'),
    underscoreMixin = require('ampersand-collection-underscore-mixin'),
    ajaxSettings = require('../helpers/ajaxSettings'),
    ProfileModel = require('../models/profile_model'),
    ProfileCollection;

    /**
     * @constructor ProfileCollection
     * Collection of user profiles
     * */
    ProfileCollection = Collection.extend(underscoreMixin, restMixin, ajaxSettings, {
        model: ProfileModel,
        methodToURL: {
            read: '/profiles',
            create: '/profiles',
            update: '/profiles',
            delete: '/profiles'
        }
    });

module.exports = ProfileCollection;