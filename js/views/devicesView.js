(function () {
    "use strict";

    window.App.views.devices = Backbone.View.extend({

        el: '.js-scene-devices',

        initialize: function () {
            _.bindAll(this, 'render', 'renderWidget', 'show');
            var that = this;

            that.scene = 'rooms';
            that.listenTo(that.collection, 'add', that.renderWidget);
            //console.log('Init model');
        },

        render: function () {
            var that = this;
            console.log('render View');
            console.log(that.scene);
        },

        renderWidget: function (model) {
            var that = this;

            if (model.get('deviceType') === 'probe') {

            }
        },

        show: function (scene) {
            var that = this;
            that.scene = scene;
            that.render();
        }
    });

})();