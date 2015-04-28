'use strict';

window.$ = require('jQuery');
window._ = require('lodash', {expose: 'underscore'});
window.jQuery = window.$;

require('smartbox').call(window, $, _);

var DevicesCollection = require('./collections/devices_collection'),
	LocationsCollection = require('./collections/locations_collection'),
	ProfilesCollection = require('./collections/profiles_collection'),
	AppState = require('./appState'),
	FilterView = require('./views/columns/filterTypes_view'),
	app = require('ampersand-app');

app.extend({
	init: function() {
		var self = this;

		// customizing ajax
		self.preFilterAjax();

		// predefining collections
		self.devices = new DevicesCollection();
		self.locations = new LocationsCollection();
		self.profiles = new ProfilesCollection();

		// define application state
		self.state = new AppState({
			column: 0,
			filterType: '',
			filterId: '',
			deviceId: '',
			filters: ['favourites', 'rooms', 'types', 'tags', 'all'],
			filterItems: []
		});

		// prerender application views
		self.filterView = new FilterView({
			el: $('.jsFilters').get(0),
			model: self.state
		});

		// set event navigations
		self.setNavigationEvents();

		// fetching
		self.devices.fetch();
		self.locations.fetch();
		self.profiles.fetch();

		// start navigation
		$$nav.on();
	},
	setNavigationEvents: function() {
		var self = this,
			$sceneWrapper = $('.jsSceneWrapper');

		$sceneWrapper.find('.bColumn.nav-item').on('nav_key', function(event) {
			var filters = self.state.get('filters'),
				currentColumn = self.state.get('column'),
				currentFilterType = self.state.get('filterType'),
				currentFilterTypeIndex = filters.indexOf(currentFilterType),
				featureFilterTypeIndex = 0;

			if (event.keyName === 'left' && currentColumn > 0) {
				self.state.set('column', currentColumn - 1);
			} else if (event.keyName === 'right' && currentColumn < 3) {
				self.state.set('column', currentColumn + 1);
			} else if (event.keyName === 'up' || event.keyName === 'down') {
				if (currentColumn === 0) {
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
				}
			}
		});
	},
	preFilterAjax: function() {
		var self = this,
			query = self.getQueryParams(document.location.search),
			port = query.hasOwnProperty('port') ? query.port : window.location.port !== '' ? window.location.port : 8583,
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
		qs = qs.split("+").join(" ");

		var params = {}, tokens,
			re = /[?&]?([^=]+)=([^&]*)/g;

		while (tokens = re.exec(qs)) {
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}

		return params;
	}
});

//// main app initialize when smartbox ready
SB(_.bind(app.init, app));