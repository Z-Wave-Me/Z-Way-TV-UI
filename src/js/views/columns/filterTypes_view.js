'use strict';

var app = require('ampersand-app'),
    View = require('ampersand-view'),
    filtersTemplate = require('../../../templates/filters.hbs'),
    FiltersView = View.extend({
        template: filtersTemplate,
        autoRender: true,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'movePanel', 'render');

            app.state.bind('change:filterType', self.movePanel);
            self.movePanel();
        },
        render: function() {
            var self = this;

            self.renderWithTemplate(self);

            return self;
        },
        movePanel: function() {
            var self = this,
                $el = $(self.el),
                filters = self.model.get('filters'),
                currentType = self.model.get('filterType'),
                currentTypeIndex = filters.indexOf(currentType),
                childHeight = self.childHeight || $el.children().eq(0).outerHeight(true);

            if (!self.childHeight) {
                self.childHeight = childHeight;
            }

            $el.children().removeClass('mActive');
            $el.animate({top: childHeight * -currentTypeIndex + 'px'}, 'fast', function() {
                $el.children().removeClass('mActive').eq(currentTypeIndex).addClass('mActive');
            });
        }
    });

module.exports = FiltersView;