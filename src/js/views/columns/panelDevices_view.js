'use strict';

var View = require('ampersand-view'),
    FiltersView = View.extend({
        template: '<div class="bFilter jsDevicePanel"></div>',
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

module.exports = FiltersView;