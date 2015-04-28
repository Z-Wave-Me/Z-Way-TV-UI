'use strict';

var AmpersandState = require('ampersand-state'),
	AmpersandApplicationState = AmpersandState.extend({
		props: {
			column: 'number',
			filterType: 'string',
			filterId: 'string',
			deviceId: 'string',
			filters: 'array'
		}
	});

module.exports = AmpersandApplicationState;