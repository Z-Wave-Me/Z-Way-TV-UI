'use strict';

var View = require('ampersand-view'),
    app = require('ampersand-app'),
    decimalPanelTemplate = require('../../../templates/panels/decimal.hbs'),
    DecimalPanelView = View.extend({
        template: decimalPanelTemplate,
        autoRender: true,
        range: _.range(10, 100, 10).reverse(),
        initialize: function() {
            var self = this;

            _.bindAll(self, 'render', 'onChange');

            self.model.bind('change:metrics', self.onChange);

            self._command = _.debounce(function() {
                self.model.command('exact', 'command', {level: self.model.get('metrics').level});
            }, 300);
        },
        render: function(saveControl) {
            var self = this,
                level = self.model.get('metrics').level,
                min = self.model.get('metrics').min || 0,
                max = self.model.get('metrics').max || 100,
                length = max - min;

            self.currentLevel = ((level - min) / length) * 100;
            self.saveControl = saveControl;
            self.renderWithTemplate(self);

            return self;
        },
        onListenKeyEvent: function(event) {
            var self = this,
                step = 3,
                metrics = self.model.get('metrics'),
                level = metrics.level,
                oldLevel = level,
                min = metrics.min || 0,
                max = metrics.max || 100;

            if (event.keyName === 'up') {
                level = level + step > max ? max : level + step;
            } else if (event.keyName === 'down') {
                level = level - step < min ? min : level - step;
            }

            metrics.level = level;


            if (oldLevel !== level) {
                // TODO add dirty check in ampersand model
                self.model.set('metrics', metrics);
                self.model.trigger('change:metrics');
                self._command();
            }
        },
        onChange: function() {
            var self = this,
                saveControl = false;

            if (app.state.get('column') === 3) {
                saveControl = true;
            }

            self.render(saveControl);

        }
    });

module.exports = DecimalPanelView;