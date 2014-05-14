(function () {
    "use strict";

    window.App.views.probe = Backbone.View.extend({

        el: '.container-devices',
        template:
            '<div class="widget widget-probe nav-item just-hidden">' +
                '<span class="icon"></span>' +
                '<span class="title"><%= metrics.title %></span>' +
                '<span class="level"><%= metrics.level %> <%= metrics.scaleTitle %></span>' +
            '</div>',

        initialize: function () {
            _.bindAll(this, 'render');
            var that = this;

            that.$template = $(_.template(that.template, that.model.toJSON()));
            //console.log('Init model');
        },

        render: function () {
            var that = this;
            that.$el.append(that.$template);
            that.$template.fadeIn();
        }
    });
})();