'use strict';

var app = require('ampersand-app'),
    _ = require('lodash'),
    View = require('ampersand-view'),
    CommonDeviceView = require('../devices/common_device_view'),
    SwitchBinaryView = require('../devices/switchBinary_device_view'),
    FiltersView = View.extend({
        template: '<div class="bFilter jsDevices"></div>',
        autoRender: true,
        initialize: function() {
            var self = this;

            self.cached = {
                views: {},
                constructors: {
                    common: CommonDeviceView,
                    switchBinary: SwitchBinaryView
                }
            };

            _.bindAll(self, 'render', 'renderDevices', 'makeDevice');

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
            self.devices = devices;

            $el.parent()[devices.length === 0 ? 'addClass' : 'removeClass']('mEmpty');

            _.each(devices, function(device) {
                if (device.get('id') === self.model.get('deviceId')) {
                    self.makeDevice(device, true, true);
                } else {
                    self.makeDevice(device, false, true);
                }
            });
        },
        makeDevice: function(device, special, insert) {
            var self = this,
                deviceId = device.get('id'),
                $el = $(self.el),
                deviceType = device.get('deviceType'),
                cachedView = self.cached.views[deviceId],
                ConstructorView,
                view;

            // get view constructor
            if (special && self.cached.constructors.hasOwnProperty(deviceType)) {
                ConstructorView = self.cached.constructors[deviceType];
            } else {
                ConstructorView = self.cached.constructors.common;
            }

            if (cachedView && cachedView instanceof ConstructorView) {
                view = cachedView;
            } else {
                view = new ConstructorView({model: device});
                self.cached.views[deviceId] = view;
            }

            view.render();

            if (insert) {
                $el.append(view.el);
            } else if (Boolean(cachedView)) {
                $(cachedView.el).replaceWith(view.el);
            }

            return view;
        },
        movePanel: function() {
            var self = this,
                $el = $(self.el),
                items = self.model.get('deviceItems'),
                currentId = self.model.get('deviceId'),
                currentIdIndex = items.indexOf(currentId),
                childHeight = self.childHeight || $el.children().eq(0).outerHeight(true);

            if (!self.childHeight) {
                self.childHeight = childHeight;
            }

            $el.children().removeClass('mActive');
            $el.animate({top: childHeight * -currentIdIndex + 'px'}, 'fast', function() {
                $el.children().removeClass('mActive').eq(currentIdIndex).addClass('mActive');
            });
        },
        onSendEvent: function(keyName) {
            var self = this,
                currentDeviceId = self.model.get('deviceId'),
                view = self.cached.views[currentDeviceId];

            if (view) {
                view.trigger('click.' + keyName);
            }
        }
    });

module.exports = FiltersView;