'use strict';

var ProfileModel = require('../models/profile_model'),
    ProfilesCollection = Backbone.Collection.extend({
        model: ProfileModel,
        methodToURL: {
            'read': '/profiles',
            'create': '/profiles',
            'update': '/profiles',
            'delete': '/profiles'
        },
        sync: function (method, model, options) {

            options = options || {};
            options.url = model.methodToURL[method.toLowerCase()];
            Backbone.sync(method, model, options);
        },
        parse: function (response) {
            return response.data;
        },
        getActive: function () {
            var activeId = SB.getData('activeProfile');

            if (activeId) {
                return this.findWhere({id: activeId});
            } else {
                return this.first();
            }
        },
        toggleDevice: function (id) {
            this.getActive().get('positions').save({
                positions: _.uniq(this.getActive().get('positions').push(id))
            });
        }
    });

module.exports = ProfilesCollection;