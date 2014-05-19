(function () {
    "use strict";

    window.App.models.device = Backbone.Model.extend({

        defaults: {
            metrics: {},
            selected: false
        },

        methodToURL: {
            'read': '/devices',
            'create': '/devices',
            'update': '/devices',
            'delete': '/devices'
        },

        url: function () {
            return !this.id ? '' : '/' + this.id;
        },

        sync: function (method, model, options) {

            options = options || {};
            options.url = model.methodToURL[method.toLowerCase()] + this.url();
            Backbone.sync(method, model, options);
        },

        parse: function (response) {
            return response.hasOwnProperty('data') ? response.data : response;
        },

        initialize: function () {
            //console.log('Init model');
        },

        command: function () {

        }
    });

})();