'use strict';

var View = require('ampersand-view'),
    commonDeviceTemplate = require('../../../templates/devices/common.hbs'),
    CommonDeviceView = View.extend({
        template: commonDeviceTemplate,
        autoRender: true,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'render');
        },
        render: function() {
            var self = this;

            self.renderWithTemplate(self);

            return self;
        }
    });

module.exports = CommonDeviceView;