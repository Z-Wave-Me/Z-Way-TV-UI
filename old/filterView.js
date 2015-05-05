(function () {
    "use strict";

    window.App.views.filters = Backbone.View.extend({

        el: '.menu',
        template: '<li data-id="<%= id %>" data-type="<%= type %>" class="menu-item nav-item"><%= title %></li>',

        initialize: function () {
            _.bindAll(this, 'render', 'renderRoom', 'renderOther', 'select', 'setMenu');
            var that = this;

            _.extend(that, arguments[0]);

            that.listenTo(that.locations, 'add', that.renderRoom); //room collection
            that.listenTo(that.devices, 'change add sync', that.renderOther); //room collection
        },

        render: function () {
            var that = this;
            that.locations.push({
                id: 0,
                title: 'Unassigned'
            });
        },

        renderRoom: function (model) {
            var that = this,
                $template = $(_.template(that.template, _.extend(model.toJSON(), {type: 'rooms'})));

            that.listenTo(model, 'change:selected', function () {
                if (model.get('selected')) {
                    $template.addClass('focus');
                } else {
                    $template.removeClass('focus');
                }
            });

            that.$el.find('.rooms-items').append($template);
        },

        renderOther: function () {
            var that = this,
                $template;

            that.types = _.uniq(_.compact(that.devices.map(function (model) {
                return model.get('deviceType');
            })));

            that.tags = _.uniq(_.compact(_.flatten(that.devices.map(function (model) {
                return model.get('tags');
            }))));

            that.types.unshift('Unassigned');
            that.tags.unshift('Unassigned');

            _.each([{data: that.types, type: 'deviceType'}, {data: that.tags, type: 'tags'}], function (obj) {
                _.each(obj.data, function (data) {
                    if (that.$el.find('.' + obj.type + '-items').find('li[data-id="' + data + '"]').length === 0) {
                        $template = $(_.template(that.template, {id: data, title: data, type: obj.type}));
                        that.$el.find('.' + obj.type + '-items').append($template);
                    }
                });
            });
        },

        select: function (type, id) {
            var that = this,
                collection,
                index;

            if (that.$el.find('.' + type + '-items').is(':hidden')) {
                that.$el.find('.filter-items').hide();
                that.$el.find('.' + type + '-items').fadeIn('fast');
                that.$el.find('.filter-wrapper').fadeIn('fast');
            }

            if (type !== that.type) {
                that.$el.find('.filter-wrapper').find('.menu-items').animate({top: '0px'}, 'fast');
            }

            if (type === 'favourites') {
                that.$el.find('.filter-items').fadeOut('fast');
                that.$el.find('.filter-wrapper').fadeOut('fast');
                that.setSelected();
            } else if (type === 'rooms') {
                if (Boolean(that.locations.findWhere({id: parseInt(id)})) && id !== 'Unassigned' && that.devices.findWhere({location: parseInt(id)})) {
                    that.devices.each(function (model) {
                        if (model.get('location') === parseInt(id)) {
                            model.set({show: true});
                        } else {
                            model.set({show: false});
                        }
                    });
                } else {
                    that.devices.each(function (model) {
                        model.set({show: true});
                    });
                }

                that.devices.set(that.devices.models, {selected: false});

                collection = that.devices.where({show: true});
                index = 0;
                collection[index].set({selected: true});
                that.setSelected();
            } else if (type === 'deviceType') {
                if (that.types.indexOf(id) !== -1 && id !== 'Unassigned') {
                    that.devices.each(function (model) {
                        if (model.get('deviceType') === id) {
                            model.set({show: true});
                        } else {
                            model.set({show: false});
                        }
                    });
                } else {
                    that.devices.each(function (model) {
                        model.set({show: true});
                    });
                }

                that.devices.set(that.devices.models, {selected: false});

                collection = that.devices.where({show: true});
                index = 0;
                collection[index].set({selected: true});
                that.setSelected();
            } else if (type === 'tags') {
                if (that.tags.indexOf(id) !== -1 && id !== 'Unassigned') {
                    that.devices.each(function (model) {
                        if (model.get('tags').indexOf(id) !== -1) {
                            model.set({show: true});
                        } else {
                            model.set({show: false});
                        }
                    });
                } else {
                    that.devices.set(that.devices.models, {show: true});
                }
                that.setSelected();
            }

            that.type = type;
            that.setMenu(id, type);
        },
        setMenu: function (id, type) {
            var that = this,
                $choose = that.$el.find('.choose-wrapper'),
                $filters = that.$el.find('.filter-wrapper'),
                height = $choose.find('li:first').outerHeight(),
                index = 0;

            that.clear();

            if (id === null) { // $choose
                index = $choose.find('li').index($choose.find('li[data-type="' + type + '"]'));
                index = index === -1 ? 0 : index;
                $choose.find('.menu-items').animate({top: index * -1 * height + 'px'}, 'fast');
                $choose.addClass('active-menu');
            } else {
                index = $filters.find('.' + type + '-items').find('li').index($filters.find('li[data-id="' + id + '"]'));
                index = index === -1 ? 0 : index;
                $filters.find('.menu-items').animate({top: index * -1 * height + 'px'}, 'fast');
                $filters.addClass('active-menu');
            }
        },
        setSelected: function () {
            var that = this;
            if (that.devices.length > 0) {
                if (!that.devices.findWhere({selected: true, show: true})) {
                    that.devices.set(that.devices.models, {selected: false});
                }
                that.devices.at(0);
            }
        },
        clear: function () {
            var that = this,
                $choose = that.$el.find('.choose-wrapper'),
                $filters = that.$el.find('.filter-wrapper');

            $choose.removeClass('active-menu');
            $filters.removeClass('active-menu');
            $('.scenes-wrapper').removeClass('active-menu');
        }
    });

})();