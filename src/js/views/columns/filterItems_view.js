'use strict';

var app = require('ampersand-app'),
    View = require('ampersand-view'),
    filtersTemplate = require('../../../templates/filterItems.hbs'),
    FiltersView = View.extend({
        template: filtersTemplate,
        autoRender: true,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'changeItems', 'render', 'movePanel');

            app.state.bind('change:filterType', function() {
                self.resetPosition();
                self.changeItems();
            });
            app.state.bind('change:filterId', self.movePanel);
            app.state.get('collections').locations.bind('sync', self.changeItems);
            app.state.get('collections').devices.bind('sync', self.changeItems);
        },
        render: function() {
            var self = this;

            self.renderWithTemplate(self);

            return self;
        },
        changeItems: function() {
            var self = this,
                items = [],
                currentType = self.model.get('filterType');

            if (currentType === 'rooms') {
                items = self.model.get('collections').locations.map(function(item) {
                    return item.get('title');
                });
            } else if (currentType === 'tags') {
                items = self.model.get('collections').devices.reduce(function(memo, item) {
                    return _.uniq(_.union(memo, item.get('tags')));
                }, []);
            } else if (currentType === 'types') {
                items = self.model.get('collections').devices.reduce(function(memo, item) {
                    memo.push(item.get('deviceType'));

                    return _.uniq(memo);
                }, []);
            }

            self.model.set('filterItems', items);
            self.items = items;
            self.render();
            $(self.el).parent()[items.length > 0 || currentType !== 'all' ? 'addClass' : 'removeClass']('nav-item');
            items.length > 0 && app.state.set('filterId', items[0]);
            self.movePanel();
        },
        movePanel: function() {
            var self = this,
                $el = $(self.el),
                items = self.model.get('filterItems'),
                currentId = self.model.get('filterId'),
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
        resetPosition: function() {
            var self = this,
                $el = $(self.el);

            $el.animate({top: '0px'}, 'fast');
        }
    });

module.exports = FiltersView;