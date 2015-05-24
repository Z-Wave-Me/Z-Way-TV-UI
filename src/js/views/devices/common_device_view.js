'use strict';

var View = require('ampersand-view'),
    commonDeviceTemplate = require('../../../templates/devices/common.hbs'),
    CommonDeviceView = View.extend({
        template: commonDeviceTemplate,
        autoRender: true,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'render', 'remove', 'onChange');
            self.model.bind('change:metrics', self.onChange);
        },
        render: function() {
            var self = this;

            self.renderWithTemplate(self);

            return self;
        },
        remove: function() {
            var self = this;

            $(self.el).unbind().remove();
        },
        onChange: function() {
            var self = this,
                metrics = self.model.get('metrics'),
                scaleTitle = metrics.scaleTitle || '';

            $(self.el).find('.eDevice_level').text(metrics.level + ' ' + scaleTitle);
        }
    });

module.exports = CommonDeviceView;