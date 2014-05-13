(function () {
    "use strict";

    window.App.views.devices = Backbone.View.extend({

        el: '.js-scene-devices',

        initialize: function () {
            _.bindAll(this, 'render');
            var that = this;

            that.scene = 'rooms';
            that.listenTo(that.collection, 'add', that.renderWidget);
            //console.log('Init model');
        },

        render: function () {
            var that = this;
        }
    });
})();