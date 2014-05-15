(function () {
    "use strict";

    window.App.views.probe = Backbone.View.extend({

        el: '.container-devices',
        template:
            '<div class="widget widget-probe just-hidden">' +
                '<span class="icon icons <%= metrics.icon %>"></span>' +
                '<span class="title"><%= metrics.title %></span>' +
                '<span class="level"><%= metrics.level %> <%= metrics.scaleTitle %></span>' +
            '</div>',

        initialize: function () {
            _.bindAll(this, 'render', 'changeFocus');
            var that = this;

            that.$template = $(_.template(that.template, that.model.toJSON()));

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
            } else {
                that.$template.removeClass('focus');
            }
        }
    });
})();