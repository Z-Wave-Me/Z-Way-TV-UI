'use strict';

var app = require('ampersand-app'),
    View = require('ampersand-view'),
    filtersTemplate = require('../templates/filters.hbs'),
    FiltersView = View.extend({
        template: filtersTemplate,
        model: app.state
    });

module.exports = FiltersView;