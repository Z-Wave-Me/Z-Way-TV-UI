'use strict';

var app = require('ampersand-app'),
    _ = require('lodash'),
    View = require('ampersand-view'),
    CommonDeviceView = require('../devices/common_device_view'),
    FiltersView = View.extend({
        template: '<div class="bFilter jsDevices"></div>',
        autoRender: true,
        initialize: function() {
            var self = this;

            self.cached = {
                views: {}
            };

            _.bindAll(self, 'render', 'renderDevices', 'renderCommon');

            app.state.bind('change:filterType change:filterId', self.render);
            app.state.bind('change:deviceId', self.movePanel.bind(self));
        },
        render: function() {
            var self = this;

            self.renderWithTemplate(self);
            self.renderDevices();

            return self;
        },
        renderDevices: function() {
            var self = this,
                currentFilterType = self.model.get('filterType'),
                currentFilterId = self.model.get('filterId'),
                $el = $(self.el),
                devices,
                deviceIds;

            if (currentFilterType === 'rooms' && currentFilterId) {
                devices = self.collection.filter(function(item) {
                    return item.get('location') === currentFilterId;
                });
            } else if (currentFilterType === 'types' && currentFilterId) {
                devices = self.collection.filter(function(item) {
                    return item.get('deviceType') === currentFilterId;
                });
            } else if (currentFilterType === 'tags' && currentFilterId) {
                devices = self.collection.filter(function(item) {
                    return item.get('tags').indexOf(currentFilterId) !== -1;
                });
            } else {
                devices = self.collection.models;
            }

            deviceIds = _.map(devices, function(device) {
                return device.get('id');
            });

            self.model.set('deviceItems', deviceIds);
            self.model.set('deviceId', _.first(deviceIds));

            $el.parent()[devices.length === 0 ? 'addClass' : 'removeClass']('mEmpty');

            _.each(devices, self.renderCommon.bind(self));
        },
        renderCommon: function(device) {
            var self = this,
                deviceId = device.get('id'),
                $el = $(self.el),
                view = self.cached.views[deviceId] || new CommonDeviceView({model: device});

            if (!self.cached.views.hasOwnProperty(deviceId)) {
                self.cached.views[deviceId] = view;
            }

            view.render();
            $el.append(view.el);
        },
        movePanel: function() {
            var self = this,
                $el = $(self.el),
                items = self.model.get('deviceItems'),
                currentId = self.model.get('deviceId'),
                currentIdIndex = items.indexOf(currentId),
                childHeight = 90;

            if (!self.childHeight) {
                self.childHeight = childHeight;
            }

            $el.children().removeClass('mActive');
            $el.animate({top: childHeight * -currentIdIndex + 'px'}, 'fast', function() {
                $el.children().removeClass('mActive').eq(currentIdIndex).addClass('mActive');
            });

        }
    });

module.exports = FiltersView;