'use strict';

window.$ = require('jQuery');
window._ = require('lodash', {expose: 'underscore'});
window.Handlebars = require('handlebars');
window.jQuery = window.$;

require('smartbox').call(window, $, _);

var DevicesCollection = require('./collections/devices_collection'),
	LocationsCollection = require('./collections/locations_collection'),
	ProfilesCollection = require('./collections/profiles_collection'),
	AppState = require('./appState'),
	FilterView = require('./views/columns/filterTypes_view'),
	FilterItemsView = require('./views/columns/filterItems_view'),
	app = require('ampersand-app');

app.extend({
	views: {},
	init: function() {
		var self = this,
			collections = {
				devices: new DevicesCollection(),
				locations: new LocationsCollection(),
				profiles: new ProfilesCollection()
			};

		// customizing ajax
		self.preFilterAjax();

		// define application state
		self.state = new AppState({
			column: 0,
			filterType: 'all',
			filterId: '',
			deviceId: '',
			filters: ['all', 'rooms', 'types', 'tags'],
			filterItems: [],
			collections: collections
		});

		// prerender application views
		self.views = {
			filters: new FilterView({
				el: $('.jsFilters').get(0),
				model: self.state
			}),
			filtersItems: new FilterItemsView({
				el: $('.jsFilterItems').get(0),
				model: self.state
			})
		};

		// set event navigations
		self.setNavigationEvents();

		// fetching
		collections.devices.fetch();
		collections.locations.fetch();
		collections.profiles.fetch();

		// start navigation
		$$nav.on();
	},
	setNavigationEvents: function() {
		var self = this,
			$sceneWrapper = $('.jsSceneWrapper');

		$sceneWrapper.find('.bColumn.nav-item').on('nav_key', function(event) {
			var currentColumn = self.state.get('column');

			if (event.keyName === 'left' && currentColumn > 0) {
				self.state.set('column', currentColumn - 1);
			} else if (event.keyName === 'right' && currentColumn < 3) {
				self.state.set('column', currentColumn + 1);
			} else if (event.keyName === 'up' || event.keyName === 'down') {
				if (currentColumn === 0) { // first column
					self.setFilterType(event);
				} else if (currentColumn === 1) { // second column
					self.setFilterId(event);
				}
			}
		});
	},
	setFilterType: function(event) {
		var self = this,
			filters = self.state.get('filters'),
			currentFilterType = self.state.get('filterType'),
			currentFilterTypeIndex = filters.indexOf(currentFilterType),
			featureFilterTypeIndex = 0;

		if (event.keyName === 'up' && currentFilterTypeIndex === 0) {
			featureFilterTypeIndex = filters.length - 1;
		} else if (event.keyName === 'up' && currentFilterTypeIndex !== 0) {
			featureFilterTypeIndex = currentFilterTypeIndex -1;
		} else if (event.keyName === 'down' && currentFilterTypeIndex !== filters.length - 1) {
			featureFilterTypeIndex = currentFilterTypeIndex + 1;
		} else if (event.keyName === 'down' && currentFilterTypeIndex === filters.length - 1) {
			featureFilterTypeIndex = 0;
		}

		self.state.set('filterType', filters[featureFilterTypeIndex]);
	},
	setFilterId: function(event) {
		var self = this,
			items = self.state.get('filterItems'),
			currentFilterId = self.state.get('filterId'),
			currentFilterIdIndex = items.indexOf(currentFilterId),
			featureFilterIdIndex = 0;

		if (event.keyName === 'up' && currentFilterIdIndex === 0) {
			featureFilterIdIndex = items.length - 1;
		} else if (event.keyName === 'up' && currentFilterIdIndex !== 0) {
			featureFilterIdIndex = currentFilterIdIndex -1;
		} else if (event.keyName === 'down' && currentFilterIdIndex !== items.length - 1) {
			featureFilterIdIndex = currentFilterIdIndex + 1;
		} else if (event.keyName === 'down' && currentFilterIdIndex === items.length - 1) {
			featureFilterIdIndex = 0;
		}

		self.state.set('filterId', items[featureFilterIdIndex]);
	},
	preFilterAjax: function() {
		var self = this,
			query = self.getQueryParams(document.location.search),
			port = query.hasOwnProperty('port') ? query.port : window.location.port !== '' ? window.location.port : 8083,
			host = query.hasOwnProperty('host') ? query.host : window.location.hostname;

		port = 8583;
		host = 'mskoff.z-wave.me';

		$.ajaxPrefilter(function(options) {
			// Your server goes below
			options = options || {};

			options.crossDomain = {
				crossDomain: true
			};
			options.url = '//' + host + ':' + port + '/ZAutomation/api/v1' + options.url;
		});
	},
	getQueryParams: function(qs) {
		qs = qs.split('+').join(' ');

		var params = {}, tokens,
			re = /[?&]?([^=]+)=([^&]*)/g;

		while (tokens = re.exec(qs)) {
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}

		return params;
	}
});

// main app initialize when smartbox ready
SB(_.bind(app.init, app));