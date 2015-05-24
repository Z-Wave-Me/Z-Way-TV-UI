'use strict';

var View = require('ampersand-view'),
    footerTemplate = require('../../templates/footer.hbs'),
    FooterView = View.extend({
        template: footerTemplate,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'render');

            self.model.bind('change:serverTime', self.render);
        },
        render: function() {
            var self = this;

            self.renderWithTemplate(self);

            return self;
        },
        addZero: function(num) {
            return num < 10 ? '0' + num : num;
        }
    });

module.exports = FooterView;