(function () {
    "use strict";

    window.App.views.probe = Backbone.View.extend({

        el: '.container-devices',
        template:
            '<div class="widget widget-probe just-hidden">' +
                '<span class="icon icons <%= metrics.icon %> "></span>' +
                '<span class="title"><%= metrics.title %></span>' +
                '<span class="metrics"><%= metrics.level %> <%= metrics.scaleTitle %></span>' +
            '</div>',

        initialize: function () {
            _.bindAll(this, 'render', 'changeFocus');
            var that = this,
                json = that.model.toJSON();

            _.extend(json.metrics, {
                icon: Boolean(json.metrics.icon) ? json.metrics.icon : json.deviceType
            });

            that.$template = $(_.template(that.template, json));

            if (that.model.get('deviceType') === 'battery') {
                if (that.model.get('metrics').level <= 30 && that.model.get('metrics').level > 0) {
                    that.$template.find('.icon').addClass('critical');
                } else if (that.model.get('metrics').level <= 60 && that.model.get('metrics').level > 30) {
                    that.$template.find('.icon').addClass('low');
                } else {
                    that.$template.find('.icon').addClass('full');
                }
            }

            // events
            that.listenTo(that.model, 'change:selected', that.changeFocus);
        },

        render: function () {
            var that = this;
            that.$el.append(that.$template);
            that.$template.fadeIn();
        },

        changeFocus: function (model) {
            var that = this;
            if (model.get('selected')) {
                that.$template.addClass('focus');
                that.$template.find('.icon').addClass('focus');
            } else {
                that.$template.removeClass('focus');
                that.$template.find('.icon').removeClass('focus');
            }
        }
    });
})();