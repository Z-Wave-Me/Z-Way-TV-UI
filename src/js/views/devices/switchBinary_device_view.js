'use strict';

var CommonDeviceView = require('./common_device_view'),
    template = require('../../../templates/devices/switchBinary.hbs'),
    SwitchBinaryDeviceView = CommonDeviceView.extend({
        template: template,
        autoRender: true,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'render', 'onEnter');

            self.bind('click.enter', self.onEnter);
            self.model.bind('change', self.render);
        },
        render: function() {
            var self = this;

            if (self.model.get('deviceType') === 'doorlock') {
                self.checked = self.model.get('metrics').level === 'open';
            } else {
                self.checked = self.model.get('metrics').level === 'on';
            }

            self.renderWithTemplate(self);

            return self;
        },
        onEnter: function() {
            var self = this,
                metrics = self.model.get('metrics');

            if (self.model.get('deviceType') === 'doorlock') {
                metrics.level = metrics.level === 'open' ? 'close' : 'open';
            } else {
                metrics.level = metrics.level === 'on' ? 'off' : 'on';
            }

            self.model.set('metrics', metrics);
            $(self.el).find('.jsInput').prop('checked', ['on', 'open'].indexOf(metrics.level) !== -1);
            self.model.command(metrics.level);
        }
    });

module.exports = SwitchBinaryDeviceView;