'use strict';

var CommonDeviceView = require('./common_device_view'),
    template = require('../../../templates/devices/switchBinary.hbs'),
    SwitchBinaryDeviceView = CommonDeviceView.extend({
        template: template,
        autoRender: true,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'render', 'onEnter', 'onChange');

            self.bind('click.enter', self.onEnter);
            self.model.bind('change:metrics', self.onChange);
        },
        render: function() {
            var self = this;

            self.renderWithTemplate();

            return self;
        },
        onEnter: function() {
            var self = this,
                metrics = self.model.get('metrics'),
                currentLevel = metrics.level,
                nextLevel;

            if (self.model.get('deviceType') === 'doorlock') {
                nextLevel = currentLevel === 'open' ? 'close' : 'open';
            } else {
                nextLevel = currentLevel === 'on' ? 'off' : 'on';
            }

            metrics.level = nextLevel;
            self.model.set('metrics', metrics);
            self.model.trigger('change:metrics');
            self.model.command(nextLevel);
        },
        onChange: function() {
            var self = this,
                currentLevel = self.model.get('metrics').level;

            $(self.el).find('.jsInput').prop('checked', ['on', 'open'].indexOf(currentLevel) !== -1);
        }
    });

module.exports = SwitchBinaryDeviceView;