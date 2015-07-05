'use strict';

window.$ = require('jquery');
window.$.support.cors = true; // override for DuneHD
window._ = require('lodash', {expose: 'underscore'});
window.jQuery = window.$;


require('./helpers/handlebars_helper').call(this);
require('smartbox').call(window, $, _);

var DevicesCollection = require('./collections/devices_collection'),
    LocationsCollection = require('./collections/locations_collection'),
    ProfilesCollection = require('./collections/profiles_collection'),
    AppState = require('./appState'),
    FilterView = require('./views/columns/filterTypes_view'),
    FilterItemsView = require('./views/columns/filterItems_view'),
    DevicesView = require('./views/columns/filterDevices_view'),
    PanelDevicesView = require('./views/columns/panelDevices_view'),
    FooterView = require('./views/footer'),
    LoaderHelper = require('./helpers/loader_helper'),
    AutoSyncHelper = require('./helpers/autoSync'),
    LegendHelper = require('./helpers/legend'),
    app = require('ampersand-app');

window.app = app;

app.extend({
    views: {},
    init: function() {
        var self = this,
            collections = {
                devices: new DevicesCollection(),
                locations: new LocationsCollection(),
                profiles: new ProfilesCollection()
            };

        // define application state
        self.state = new AppState({
            column: 0,
            filterType: 'all',
            filterId: '',
            deviceId: '',
            filters: ['all', 'rooms', 'types', 'tags'],
            filterItems: [],
            collections: collections,
            activeDeviceType: ['doorlock', 'switchBinary', 'toggleButton', 'switchMultilevel', 'thermostat'],
            includePanels: {
                switchMultilevel: 'decimal',
                thermostat: 'decimal'
            }
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
            }),
            devices: new DevicesView({
                el: $('.jsDevices').get(0),
                model: self.state,
                collection: collections.devices
            }),
            panelDevices: new PanelDevicesView({
                el: $('.jsDevicePanel').get(0),
                model: self.state,
                collection: collections.devices
            }),
            footer: new FooterView({
                el: $('.jsFooter').get(0),
                model: self.state
            })
        };

        // attach helpers
        self.loader = new LoaderHelper();
        self.syncer = new AutoSyncHelper();
        self.legend = new LegendHelper();

        // set event navigations
        self.setNavigationEvents();

        // customizing ajax
        self.preSettings();

        // add listeners
        self.state.on('change:loading', function(model, loading) {
            self.loader[loading ? 'activate' : 'deactivate']();
        });

        // fetching
        collections.devices.fetch({
            success: function() {
                // start navigation
                collections.locations.fetch();
                collections.profiles.fetch();
                self.state.trigger('change:filterType');
                self.state.set('loading', false);
                self.syncer.activate();
            }
        });

        self.collections = collections;

        // activate loading
        self.state.set('loading', true);

        // check Opera Presto 12.00 and fix flex layout (for Dune HD)
        if (navigator.userAgent.match(/Presto\/2.10/)) {
            var headtg = document.getElementsByTagName('head')[0];
            var linktg = document.createElement('link');
            linktg.type = 'text/css';
            linktg.rel = 'stylesheet';
            linktg.href = 'build/css/opera_fix.css';
            linktg.title = 'opera_fix';
            headtg.appendChild(linktg);
        } 
    },
    setNavigationEvents: function() {
        var self = this,
            $sceneWrapper = $('.jsSceneWrapper');

        $sceneWrapper.find('.bColumn.nav-item').on('nav_key', function(event) {
            var currentColumn = self.state.get('column'),
                currentId = self.state.get('deviceId'),
                device = self.collections.devices.get(currentId),
                currentFilterType = self.state.get('filterType'),
                currentFilterItems = self.state.get('filterItems'),
                currentDeviceItems = self.state.get('deviceItems'),
                deviceType = device ? device.get('deviceType') : null,
                isIncludePanel = deviceType ? self.state.get('includePanels').hasOwnProperty(deviceType) : null,
                maxColumns = isIncludePanel ? 3 : 2;

            if (event.keyName === 'left' && currentColumn > 0) {
                if (self.state.get('filterItems').length === 0 && currentColumn === 2) {
                    currentColumn -= 2;
                } else {
                    currentColumn -= 1;
                }

                self.state.set('column', currentColumn);
            } else if (event.keyName === 'right' && currentColumn <= maxColumns) {
                if (self.collections.devices.length !== 0) {
                    if (currentColumn === 0 && currentFilterType === 'all' && currentDeviceItems.length > 0) { // if all
                        currentColumn += 2;
                    } else if (currentColumn === 0 && currentFilterType !== 'all' && currentFilterItems.length > 0) {
                        currentColumn += 1;
                    } else if (currentColumn === 1 && currentDeviceItems.length > 0) {
                        currentColumn += 1;
                    } else if (currentColumn === 2 && isIncludePanel) {
                        currentColumn += 1;
                    }

                    self.state.set('column', currentColumn);
                }
            } else if (event.keyName === 'up' || event.keyName === 'down') {
                // TODO: combine methods in one
                if (currentColumn === 0) { // first column (filterType)
                    self.setFilterType(event);
                } else if (currentColumn === 1) { // second column(filterId)
                    self.setFilterId(event);
                } else if (currentColumn === 2) { // third column(devices)
                    self.setDeviceId(event);
                } else if (currentColumn === 3) {
                    if (self.views.panelDevices.panel) {
                        self.views.panelDevices.panel.onListenKeyEvent(event);
                    }
                }
            } else if (event.keyName === 'enter' && currentColumn === 2) {
                self.views.devices.onListenKeyEvent(event.keyName);
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
            featureFilterTypeIndex = currentFilterTypeIndex - 1;
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
            featureFilterIdIndex = currentFilterIdIndex - 1;
        } else if (event.keyName === 'down' && currentFilterIdIndex !== items.length - 1) {
            featureFilterIdIndex = currentFilterIdIndex + 1;
        } else if (event.keyName === 'down' && currentFilterIdIndex === items.length - 1) {
            featureFilterIdIndex = 0;
        }

        self.state.set('filterId', items[featureFilterIdIndex]);
    },
    setDeviceId: function(event) {
        var self = this,
            devices = self.state.get('deviceItems'),
            currentDeviceId = self.state.get('deviceId'),
            currentDeviceIdIndex = devices.indexOf(currentDeviceId),
            featureDeviceIdIndex = 0;

        if (event.keyName === 'up' && currentDeviceIdIndex === 0) {
            featureDeviceIdIndex = devices.length - 1;
        } else if (event.keyName === 'up' && currentDeviceIdIndex !== 0) {
            featureDeviceIdIndex = currentDeviceIdIndex - 1;
        } else if (event.keyName === 'down' && currentDeviceIdIndex !== devices.length - 1) {
            featureDeviceIdIndex = currentDeviceIdIndex + 1;
        } else if (event.keyName === 'down' && currentDeviceIdIndex === devices.length - 1) {
            featureDeviceIdIndex = 0;
        }

        self.state.set('deviceId', devices[featureDeviceIdIndex]);
    },
    preSettings: function() {
        var self = this,
            query = self.getQueryParams(document.location.search),
            port = query.hasOwnProperty('port') ? query.port : window.location.port !== '' ? window.location.port : 8083,
            host = query.hasOwnProperty('host') ? query.host : window.location.hostname,
            baseUrl = '//' + host + ':' + port + '/ZAutomation/api/v1';

        $.ajaxPrefilter(function(options) {
            // Your server goes below
            options = options || {};

            options.crossDomain = {
                crossDomain: true
            };
            options.url = baseUrl + options.url;
        });

        self.state.set({
            host: host,
            port: port,
            baseUrl: baseUrl
        });

        if (query.mouse === 'enable') {
            $('body').removeClass('mDisable');
        }
    },
    getQueryParams: function(qs) {
        qs = qs.split('+').join(' ');

        var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    }
});

// main app initialize when smartbox ready
SB(_.bind(app.init, app));