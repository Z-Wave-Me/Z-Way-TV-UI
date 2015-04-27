'use strict';

var app = require('ampersand-app'),
    View = require('ampersand-view'),
    filtersTemplate = require('../templates/filters.hbs'),
    FiltersView = View.extend({
        template: filtersTemplate,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'offsetTop');
        },
        offsetTop: function(up) {
            var self = this,
                $el = $(self.el),
                childHeight = self.childHeight || $el.children().eq(0).outerHeight(true),
                currentTop = parseInt($el.css('top')) || 0,
                containerHeight = $el.outerHeight(true);

            if (self.childHeight !== childHeight) {
                self.childHeight = childHeight;
            }

            if (!up && containerHeight > currentTop - childHeight) {
                $el.animate({top: '-=' + childHeight, duration: 200});
            } else if (up && containerHeight < currentTop + childHeight) {
                $el.animate({top: '+=' + childHeight, duration: 200});
            }
        }
    });

module.exports = FiltersView;