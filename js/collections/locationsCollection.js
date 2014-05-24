(function () {
    "use strict";

    window.App.collections.locations = Backbone.Collection.extend({

        model: window.App.models.location,

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
        },

        initialize: function () {
            console.log('Init collection');
        }
    });
})();