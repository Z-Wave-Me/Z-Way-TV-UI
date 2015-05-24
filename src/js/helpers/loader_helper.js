'use strict';

var app = require('ampersand-app'),
    imageLoaded = false,
    Loader;

Loader = function() {
    var self = this;

    self.$sceneContainer = $('.jsSceneWrapper');
    self.$logo = $('.jsLogo');
    self.srcLogo = '/build/assets/logo_active.svg';

    return this;
};

Loader.prototype = {
    deactivate: function() {
        var self = this,
            image = new Image();

        if (!imageLoaded) {
            image.onload = function() {
                self.$logo.addClass('mActive');
                imageLoaded = true;
            };

            image.src = self.srcLogo;
        } else {
            self.$logo.addClass('mActive');
        }

        self.$sceneContainer.removeClass('mLoader');
        $$nav.on();
    },
    activate: function() {
        var self = this;

        self.$logo.removeClass('mActive');
        self.$sceneContainer.addClass('mLoader');
        $$nav.off();
    }
};

module.exports = Loader;