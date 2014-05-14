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
            var that = this,
                view = model.hasOwnProperty('view') ? model.view : null;

            if (view === null) {
                if (model.get('deviceType') === "sensorBinary" || model.get('deviceType') === "sensorMultilevel" || model.get('deviceType') === "battery") {
                    view = new window.App.views.probe({model: model});
                } else if (model.get('deviceType') === "fan") {

                } else if (model.get('deviceType') === "switchMultilevel") {

                } else if (model.get('deviceType') === "thermostat") {

                } else if (model.get('deviceType') === "doorlock") {

                } else if (model.get('deviceType') === "switchBinary" || model.get('deviceType') === "switchRGBW") {

                } else if (model.get('deviceType') === "toggleButton") {

                } else if (model.get('deviceType') === "camera") {

                } else if (model.get('deviceType') === "switchControl") {

                } else {
                    //log(model);
                }
            }


            if (view !== null) {
                view.render();
            }
        },

        show: function (scene) {
            var that = this;
            that.scene = scene;
            that.render();
        }
    });

})();