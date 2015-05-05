'use strict';

var CommonDeviceView = require('./common_device_view'),
    template = require('../../../templates/devices/toggleButton.hbs'),
    ToggleButtonDeviceView = CommonDeviceView.extend({
        template: template,
        autoRender: true,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'render', 'onEnter');

            self.bind('click.enter', self.onEnter);
        },
        render: function() {
            var self = this;

            self.renderWithTemplate();

            return self;
        },
        onEnter: function() {
            var self = this;

            $(self.el).find('.jsToggle').addClass('mActive');

            setTimeout(function() {
                $(self.el).find('.jsToggle').removeClass('mActive');
            }, 300);

            self.model.command('on');
        }
    });

module.exports = ToggleButtonDeviceView;