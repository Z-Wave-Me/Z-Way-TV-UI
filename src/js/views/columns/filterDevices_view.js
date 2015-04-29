'use strict';

var app = require('ampersand-app'),
    View = require('ampersand-view'),
    CommonDeviceView = require('../devices/common_device_view'),
    FiltersView = View.extend({
        template: '<div class="bFilter jsDevices"></div>',
        autoRender: true,
        initialize: function () {
            var self = this;

            self.cached = {
                views: {}
            };

            _.bindAll(self, 'render', 'renderDevices', 'renderCommon');

            app.state.bind('change:filterType change:filterId', self.render);
        },
        render: function () {
            var self = this;

            self.renderWithTemplate(self);
            self.renderDevices();

            return self;
        },
        renderDevices: function () {
            var self = this,
                currentFilterType = self.model.get('filterType'),
                currentFilterId = self.model.get('filterId'),
                devices;

            if (currentFilterType === 'rooms' && currentFilterId) {
                devices = self.collection.filter(function (item) {
                    return item.get('id') === currentFilterId;
                });
            } else if (currentFilterType === 'types' && currentFilterId) {
                devices = self.collection.filter(function (item) {
                    return item.get('deviceType') === currentFilterId;
                });
            } else if (currentFilterType === 'tags' && currentFilterId) {
                devices = self.collection.filter(function (item) {
                    return item.get('tags').indexOf(currentFilterId) !== -1;
                });
            } else {
                devices = self.collection;
            }

            self.model.set('devices', devices);

            devices.forEach(self.renderCommon.bind(self));
        },
        renderCommon: function (device) {
            var self = this,
                deviceId = device.get('id'),
                $el = $(self.el),
                view = self.cached.views[deviceId] || new CommonDeviceView({model: device});

            view.render();
            $el.append(view.el);
        }
    });

module.exports = FiltersView;