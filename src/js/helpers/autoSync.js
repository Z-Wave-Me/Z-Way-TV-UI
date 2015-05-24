'use strict';

var app = require('ampersand-app'),
    AutoSync;

AutoSync = function() {
    var self = this;

    self.intervals = {};
    self.defaultTimeout = 2000;

    self.syncers = {
        devices: {
            collection: 'devices'
        }
    };

    return this;
};

AutoSync.prototype = {
    activate: function() {
        var self = this;

        Object.keys(self.syncers).forEach(function(key) {
            var collectionName = self.syncers[key].collection,
                timeout = self.syncers[key].timeout || self.defaultTimeout;

            self.intervals[key] = setInterval(function() {
                app.collections[collectionName].fetch({remove: false});
            }, timeout);
        });
    },
    deactivate: function() {
        var self = this;

        Object.keys(self.intervals).forEach(function(key) {
            clearInterval(self.intervals[key]);
        });
    }
};

module.exports = AutoSync;