(function () {
    "use strict";

    window.App.views.devices = Backbone.View.extend({

        el: '.js-scene-devices',

        initialize: function () {
            _.bindAll(this, 'render', 'renderWidget', 'show', 'changeSelected');
            var that = this;

            that.scene = 'rooms';
            that.listenTo(that.collection, 'add', that.renderWidget);
            that.listenTo(that.collection, 'change:selected', that.changeSelected);
            //console.log('Init model');
        },

        render: function () {
            var that = this;
            console.log('render View');
            console.log(that.scene);
        },

        renderWidget: function (model) {
            var that = this,
                views = window.App.views,
                view = model.hasOwnProperty('view') ? model.view : null;

            if (view === null) {
                if (model.get('deviceType') === "sensorBinary" || model.get('deviceType') === "sensorMultilevel" || model.get('deviceType') === "battery") {
                    view = new views.probe({model: model});
                } else if (model.get('deviceType') === "fan") {
                    view = new views.probe({model: model});
                } else if (model.get('deviceType') === "switchMultilevel") {
                    view = new views.probe({model: model});
                } else if (model.get('deviceType') === "thermostat") {
                    view = new views.probe({model: model});
                } else if (model.get('deviceType') === "doorlock") {
                    view = new views.probe({model: model});
                } else if (model.get('deviceType') === "switchBinary" || model.get('deviceType') === "switchRGBW") {
                    view = new views.probe({model: model});
                } else if (model.get('deviceType') === "toggleButton") {
                    view = new views.probe({model: model});
                } else if (model.get('deviceType') === "camera") {
                    view = new views.probe({model: model});
                } else if (model.get('deviceType') === "switchControl") {
                    view = new views.probe({model: model});
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
        },

        changeSelected: function () {
            var that = this,
                selected = that.collection.findWhere({selected: true}),
                index = !Boolean(selected) ? 0 : that.collection.indexOf(selected) - 2,// TODO: Quick fix - 2?
                top;

            if (selected) {
                top = index * -64; // 64px height unfocused widget
                that.$el.find('.container-devices').animate({top: top + 'px'}, 100);
            }
        }
    });

})();