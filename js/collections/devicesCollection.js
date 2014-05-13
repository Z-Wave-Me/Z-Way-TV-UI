(function () {
    "use strict";

    window.App.collections.devices = Backbone.Collection.extend({

        model: window.App.models.device,

        defaults: {
            metrics: {}
        },

        methodToURL: {
            'read': '/devices',
            'create': '/devices',
            'update': '/devices',
            'delete': '/devices'
        },

        sync: function (method, model, options) {

            options = options || {};
            options.url = model.methodToURL[method.toLowerCase()];
            Backbone.sync(method, model, options);
        },

        parse: function (response) {
            return response.data.devices;
        },

        initialize: function () {
            console.log('Init collection');
        }
    });
})();