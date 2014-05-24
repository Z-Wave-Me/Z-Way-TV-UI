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
            options.data = {since: this.updateTime || 0};
            options.url = model.methodToURL[method.toLowerCase()];
            Backbone.sync(method, model, options);
        },

        parse: function (response) {
            this.updateTime = response.data.updateTime;
            return response.data.devices;
        },

        initialize: function () {
            console.log('Init collection');
        }
    });
})();