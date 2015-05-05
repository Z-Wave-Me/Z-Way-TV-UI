'use strict';

var View = require('ampersand-view'),
    filtersTemplate = require('../../../templates/filters.hbs'),
    FiltersView = View.extend({
        template: filtersTemplate,
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