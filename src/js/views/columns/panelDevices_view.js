'use strict';

var app = require('ampersand-app'),
    View = require('ampersand-view'),
    FiltersView = View.extend({
        template: '<div class="bFilter jsDevicePanel"></div>',
        autoRender: true,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'render');

            app.state.bind('change:filterType change:filterId', self.render);
        },
        render: function() {
            var self = this,
                currentId = self.model.get('deviceId'),
                device = self.collection.get(currentId),
                deviceType = device ? device.get('deviceType') : null,
                panel = deviceType ? app.state.includePanels[deviceType] : null;

            self.renderWithTemplate(self);
            self.$el = $(self.el);

            self.$el.parent()[panel ? 'addClass' : 'removeClass']('nav-item');

            return self;
        }
    });

module.exports = FiltersView;