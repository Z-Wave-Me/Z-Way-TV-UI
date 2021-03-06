'use strict';

var AmpersandState = require('ampersand-state'),
	AmpersandApplicationState = AmpersandState.extend({
		props: {
			column: 'number',
			filterType: 'string',
			filterId: 'string',
			deviceId: 'string',
			filters: 'array',
			filterItems: 'array',
			deviceItems: 'array',
			collections: 'object',
			serverTime: 'object',
			activeDeviceType: 'array',
			includePanels: 'object',
			baseUrl: 'string',
			host: 'string',
			port: 'string',
			loading: 'boolean'
		}
	});

module.exports = AmpersandApplicationState;