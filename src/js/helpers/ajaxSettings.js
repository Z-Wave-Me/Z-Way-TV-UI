'use strict';

module.exports = {
    _sync: function (method, model, options) {
        var methodMap = { 'create': 'POST', 'update': 'PUT', 'delete': 'DELETE', 'read': 'GET' },
            type = methodMap[method],
            params,
            getValue;

        function urlError() {
            console.log("!!! URL NOT SET!");
        }

        getValue = function (object, prop) {
            if (!(object && object[prop])) {
                return;
            }
            return _.isFunction(object[prop]) ? object[prop]() : object[prop];
        };

        // Default options, unless specified.
        options = options || {};

        // Default JSON-request options.
        params = {type: type, dataType: 'json'};

        // Ensure that we have a URL.
        if (!options.url) {
            params.url = getValue(model, 'url') || urlError();
        }

        // Ensure that we have the appropriate request data.
        if (!options.data && model && (method === 'create' || method === 'update')) {
            params.data = JSON.stringify(model.toJSON());
        }

        params.contentType = 'application/json';

        // For older servers, emulate JSON by encoding the request into an HTML-form.
        if (Backbone.emulateJSON) {
            params.contentType = 'application/x-www-form-urlencoded';
            params.data = params.data ? {model: params.data} : {};
        }

        // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
        // And an `X-HTTP-Method-Override` header.
        if (Backbone.emulateHTTP) {
            if (type === 'PUT' || type === 'DELETE') {
                if (Backbone.emulateJSON) {
                    params.data._method = type;
                }
                params.type = 'POST';
                params.beforeSend = function (xhr) {
                    xhr.setRequestHeader('X-HTTP-Method-Override', type);
                };
            }
        }

        // Don't process data on a non-GET request.
        if (params.type !== 'GET' && !Backbone.emulateJSON) {
            params.processData = false;
        }

        if (method.toLowerCase() === 'delete' || params.type === 'DELETE') {
            options.data = JSON.stringify(' ');
        }

        // Make the request, allowing the user to override any Ajax options.
        return $.ajax(_.extend(params, options));
    },
    ajaxConfig: function () {
        var self = this;

        return {
            headers: {
                'Content-Type': 'application/json'
            },
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        };
    },
    sync: function (method, model, options) {
        var self = this;

        options = options || {};
        if (self.updateTime !== undefined) {
            options.data = {since: self.updateTime};
        }
        options.url = model.methodToURL[method.toLowerCase()];
        self._sync.apply(self, arguments);
    },
    url: function () {
        return !this.id ? '' : '/' + this.id;
    }
};