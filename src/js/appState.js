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
			serverTime: 'object'
		}
	});

module.exports = AmpersandApplicationState;