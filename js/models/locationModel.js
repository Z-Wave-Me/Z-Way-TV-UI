(function () {
    "use strict";

    window.App.models.location = Backbone.Model.extend({

        defaults: {
            selected: false
        },

        methodToURL: {
            'read': '/locations',
            'create': '/locations',
            'update': '/locations',
            'delete': '/locations'
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
        }
    });

})();