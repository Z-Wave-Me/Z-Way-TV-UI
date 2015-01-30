(function () {
    "use strict";

    window.App.views.doorlock = Backbone.View.extend({

        el: '.container-devices',
        template:
            '<div class="widget widget-switch doorlock just-hidden">' +
                '<span class="icon icons <%= metrics.icon %> "></span>' +
                '<span class="title"><%= metrics.title %></span>' +
                '<span class="metrics">' +
                    '<span class="text-level"> <%= metrics.level.toUpperCase() %></span>' +
                    '<div class="onoffswitch">' +
                        '<input type="checkbox" name="<%= id %>-onoffswitch" class="onoffswitch-checkbox" id="<%= id %>-onoffswitch" <% if (metrics.level === "open") { print("checked"); } %>>' +
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
            that.listenTo(that.model, 'change:show', function () {
                if (that.model.get('show')) {
                    that.$template.fadeIn('fast');
                } else {
                    that.$template.fadeOut('fast');
                }
            });

            that.listenTo(that.model, 'change', function () {
                var $title = that.$template.find('.title'),
                    $mode = that.$template.find('.text-level'),
                    $switchBox = that.$template.find('.onoffswitch-checkbox');

                [
                    ['title', $title, that.model.get('metrics').title],
                    ['mode', $mode, that.model.get('metrics').level.toUpperCase()]
                ].forEach(function (group) {
                    if (group[1].text() !== group[2]) {
                        group[1].text(group[2]);
                        if (group[0] === 'mode') {
                            if (group[2] === 'OPEN') {
                                $switchBox.prop('checked', true);
                            } else {
                                $switchBox.prop('checked', false);
                            }
                        }
                    }
                });
            });
        },

        render: function () {
            var that = this;
            that.$el.append(that.$template);
            that.$template.fadeIn();
        },

        changeStatus: function () {
            var that = this,
                $switchBox = that.$template.find('.onoffswitch-checkbox');

            if ($switchBox.is(':checked')) {
                that.model.command('open');
                that.model.set({
                    metrics: _.extend(that.model.get('metrics'), {mode: 'open'})
                });
                $switchBox.prop('checked', false);
            } else {
                that.model.command('close');
                that.model.set({
                    metrics: _.extend(that.model.get('metrics'), {mode: 'closed'})
                });
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