(function () {
    "use strict";

    window.App = {};

    _.extend(window.App, {
        Constants: {
            API_BASE: 'http://mskoff.z-wave.me:10483/ZAutomation/api/v1'
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
            var that = this;

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
            var self = this,
                $bg = $('.bg');

            // click on menu item
            $('.menu').on('nav_focus', '.menu-item', function (e) {
                var scene = e.currentTarget.getAttribute('data-type');
                self.showContent(scene);
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

            $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                // Your server goes below
                options = options || {};
                url = that.Constants.API_BASE + options.url;

                options.crossDomain = {
                    crossDomain: true
                };
                options.url = url;
            });
        }
    });

    // main app initialize when smartbox ready
    SB(_.bind(window.App.initialize, window.App));
})();