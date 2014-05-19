(function () {
    "use strict";

    window.App.views.switch = Backbone.View.extend({

        el: '.container-devices',
        template:
            '<div class="widget widget-switch just-hidden">' +
                '<span class="icon icons <%= metrics.icon %> "></span>' +
                '<span class="title"><%= metrics.title %></span>' +
                '<span class="metrics">' +
                    '<span class="text-level"> <%= metrics.level %></span>' +
                    '<div class="onoffswitch">' +
                        '<input type="checkbox" name="<%= id %>-onoffswitch" class="onoffswitch-checkbox" id="<%= id %>-onoffswitch" <% if (metrics.level === "on") { print("checked"); } %>>' +
                        '<label class="onoffswitch-label" for="<%= id %>-onoffswitch">' +
                        '<div class="onoffswitch-inner"></div>' +
                        '<div class="onoffswitch-switch"></div>' +
                        '</label>' +
                    '</div>' +
                '</span>' +
            '</div>',

        initialize: function () {
            _.bindAll(this, 'render', 'changeFocus');
            var that = this,
                json = that.model.toJSON();

            _.extend(json.metrics, {
                icon: Boolean(json.metrics.icon) ? json.metrics.icon : json.deviceType
            });

            that.$template = $(_.template(that.template, json));

            // events
            that.listenTo(that.model, 'change:selected', that.changeFocus);
            that.listenTo(that.model, 'enter', that.changeStatus);
        },

        render: function () {
            var that = this;
            that.$el.append(that.$template);
            that.$template.fadeIn();
        },

        changeStatus: function (model) {
            var that = this,
                $switchBox = that.$template.find('.onoffswitch-checkbox');
            if ($switchBox.is(':checked')) {
                $switchBox.prop('checked', false);
            } else {
                $switchBox.prop('checked', true);
            }
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