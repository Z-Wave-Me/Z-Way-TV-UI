(function () {
    "use strict";

    window.App.collections.profiles = Backbone.Collection.extend({

        model: window.App.models.profile,

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
            this.getActive().get('positions').save({positions: _.uniq(this.getActive().get('positions').push(id))});
        },

        initialize: function () {
            console.log('Init profiles');
        }
    });
})();