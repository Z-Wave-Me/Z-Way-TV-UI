'use strict';

var app = require('ampersand-app'),
    View = require('ampersand-view'),
    DecimalDevicePanel = require('../panels/decimal_panel_view'),
    FiltersView = View.extend({
        initialize: function() {
            var self = this;

            _.bindAll(self, 'render', 'onChangeColumn');
            app.state.bind('change:column change:filterType change:deviceId', self.render);
            app.state.bind('change:column', self.onChangeColumn);
        },
        render: function() {
            var self = this,
                currentId = self.model.get('deviceId') || _.first(self.model.get('deviceItems')),
                device = self.collection.get(currentId),
                deviceType = device ? device.get('deviceType') : null,
                isShowPanel = deviceType ? app.state.get('includePanels').hasOwnProperty(deviceType) : null;

            if (isShowPanel) {
                if (app.state.get('includePanels')[deviceType] === 'decimal') {
                    self.panel = new DecimalDevicePanel({
                        el: $(self.el).find('.jsPanel').get(0),
                        model: device
                    });
                }
                $(self.el).addClass('mShow nav-item');
            } else {
                $(self.el).find('.jsPanel').empty();
                $(self.el).removeClass('mShow nav-item');
            }

            return self;
        },
        onChangeColumn: function() {
            var self = this;

            if (self.panel) {
                $(self.panel.el)[app.state.get('column') === 3 ? 'addClass' : 'removeClass']('mActive');
            }
        }
    });

module.exports = FiltersView;