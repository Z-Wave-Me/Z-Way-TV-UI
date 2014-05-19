(function () {
    "use strict";

    window.App = {};

    _.extend(window.App, {
        Constants: {
            API_BASE: '/ZAutomation/api/v1'
        },
        currentScene: null,
        scenes: {
            devices: {},
            rooms: {}
        },
        views: {
            devices: {},
            rooms: {}
        },
        models: {},
        collections: {},
        isShown: true,
        initialize: function () {
            var that = this,
                query = that.getQueryParams(document.location.search);

            that.apiPort = query.hasOwnProperty('port') ? query.port : window.location.port !== "" ? window.location.port : 8083;
            that.apiHost = query.hasOwnProperty('host') ? query.host : window.location.hostname;

            that.$wrap = $('.wrap');

            that.preFilterAjax();

            // init
            that.devices = new that.collections.devices();
            that.devicesView = new that.views.devices({collection: that.devices});

            $$legend.show();
            that.setEvents();

            // start navigation
            $$nav.on();

            // fetch collections
            that.devices.fetch();
        },
        setEvents: function () {
            var that = this,
                $bg = $('.bg'),
                $sceneWrapper = $('.scenes-wrapper'),
                selected,
                index;

            // click on menu item
            $('.menu').on('nav_focus', '.menu-item', function (e) {
                var scene = e.currentTarget.getAttribute('data-type');
                that.showContent(scene);
            });

            $sceneWrapper.on('nav_key', function (e) {
                selected = that.devices.findWhere({selected: true});
                index = selected ? that.devices.indexOf(selected) : 1;



                if (e.keyName === 'down' || e.keyName === 'right' || e.keyName === 'up') {

                    if (e.keyName === 'down' || e.keyName === 'up') {
                        if (e.keyName === 'up') {
                            index -= 1;
                        } else if (e.keyName === 'down') {
                            index += 1;
                        }

                        if (index < 1) {
                            index = that.devices.length - 1;
                        } else if (index > that.devices.length -1) {
                            index = 1;
                        }
                    }

                    that.devices.each(function (model) {
                        model.set({selected: false});
                    });

                    that.devices.at(index).set({selected: true});
                } else if (e.keyName === 'enter') {
                    that.devices.findWhere({selected: true}).trigger('enter');
                }
            });

            $(document.body).on({
                // on keyboard 'd' by default
                'nav_key:blue': _.bind(this.toggleView, this),

                // remote events
                'nav_key:stop': function () {
                    Player.stop();
                },
                'nav_key:pause': function () {
                    Player.togglePause();
                },
                'nav_key:exit': function () {
                    SB.exit();
                }
            });

            // toggling background when player start/stop
            Player.on('ready', function () {
                $bg.hide();
                $$log('player ready');
            });
            Player.on('stop', function () {
                $bg.show();
                $$log('player stop');
            });
        },
        toggleView: function () {
            if (this.isShown) {
                this.$wrap.hide();
                $$legend.hide();
            } else {
                this.$wrap.show();
                $$legend.show();
            }
            this.isShown = !this.isShown;
        },
        showContent: function (scene) {
            var that = this;

            if (that.views.hasOwnProperty('roomsView')) {
                if (scene === 'rooms') {
                    that.roomsView.show();
                } else {
                    that.roomsView.hide();
                }
            }

            that.devicesView.show(scene);
        },
        preFilterAjax: function () {
            var that = this,
                url;

            $.ajaxPrefilter(function (options) {
                // Your server goes below
                options = options || {};
                url = 'http://' + that.apiHost + ':' + that.apiPort + that.Constants.API_BASE + options.url;

                options.crossDomain = {
                    crossDomain: true
                };
                options.url = url;
            });
        },
        getQueryParams: function (qs) {
            qs = qs.split("+").join(" ");

            var params = {}, tokens,
                re = /[?&]?([^=]+)=([^&]*)/g;

            while (tokens = re.exec(qs)) {
                params[decodeURIComponent(tokens[1])]
                    = decodeURIComponent(tokens[2]);
            }

            return params;
        },
    });

    // main app initialize when smartbox ready
    SB(_.bind(window.App.initialize, window.App));
})();