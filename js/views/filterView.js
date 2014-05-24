(function () {
    "use strict";

    window.App.views.filters = Backbone.View.extend({

        el: '.filter-wrapper',
        template: '<li data-id="<%= id %>" data-type="<%= type %>" class="menu-item nav-item"><%= title %></li>',

        initialize: function () {
            _.bindAll(this, 'render', 'renderRoom', 'renderOther', 'select');
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
            }

            if (type === 'favourites') {
                that.$el.find('.filter-items').fadeOut('fast');
                console.log('favourites');
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
                index = collection.length > 1 ? Math.ceil(collection.length / 2) : 0;
                collection[index].set({selected: true});
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
                index = collection.length > 1 ? Math.ceil(collection.length / 2) : 0;
                collection[index].set({selected: true});
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
            }
        }
    });

})();