'use strict';

var Handlebars = require('hbsfy/runtime');

module.exports = function() {
    Handlebars.registerHelper('compare', function(v1, operator, v2, options) {

        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });

    Handlebars.registerHelper('getIcon', function(item) {
        var deviceType = item.get('deviceType'),
            metrics = item.get('metrics'),
            iconName = metrics.icon;

        if (deviceType === 'thermostat') {
            iconName = 'thermostat';
        } else if (deviceType === 'doorlock') {
            iconName = 'door';
        } else if (deviceType === 'switchMultilevel') {
            iconName = 'light';
        } else if (deviceType === 'sensorMultilevel') {
            if (deviceType !== 'energy') {
                iconName = 'meter';
            }
        } else if (deviceType === 'battery') {
            if (metrics.level <= 2) {
                iconName = 'battery_empty';
            } else if (metrics.level <= 33 && metrics.level >= 3) {
                iconName = 'battery_low';
            } else if (metrics.level < 80 && metrics.level >= 34) {
                iconName = 'battery_medium';
            } else {
                iconName = 'battery_full';
            }
        } else if (deviceType === 'toggleButton') {
            iconName = 'toggle';
        }

        return 's s-' + iconName;
    });
};