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
            that.listenTo(that.model, 'change:show', function () {
                if (that.model.get('show')) {
                    that.$template.slideDown('fast');
                } else {
                    that.$template.slideUp('fast');
                }
            });
            that.listenTo(that.model, 'change', function () {
                var $title = that.$template.find('.title'),
                    $level = that.$template.find('.metrics');

                [
                    ['title', $title, that.model.get('metrics').title],
                    ['level', $level, that.model.get('metrics').level + ' ' + that.model.get('metrics').scaleTitle]
                ].forEach(function (group) {
                        if (group[1].text() !== group[2]) {
                            group[1].text(group[2]);
                        }
                    });
            });
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