'use strict';

var app = require('ampersand-app'),
    CommonDeviceView = require('./common_device_view'),
    cameraDeviceTemplate = require('../../../templates/devices/camera.hbs'),
    cameraDeviceView = CommonDeviceView.extend({
        template: cameraDeviceTemplate,
        autoRender: true,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'render');
        },
        render: function() {
            var self = this;
            self.rootUrl = '//' + app.state.get('host') + ':' + app.state.get('port');
            self.renderWithTemplate(self);

            return self;
        }
    });

module.exports = cameraDeviceView;