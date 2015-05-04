'use strict';

var app = require('ampersand-app'),
    View = require('ampersand-view'),
    footerTemplate = require('../../templates/footer.hbs'),
    FooterView = View.extend({
        template: footerTemplate,
        initialize: function() {
            var self = this;

            _.bindAll(self, 'render');

            self.model.bind('change:serverTime', self.render);
        },
        render: function() {
            var self = this,
                date = self.model.get('serverTime'),
                monthNames = [
                    'January', 'February', 'March',
                    'April', 'May', 'June', 'July',
                    'August', 'September', 'October',
                    'November', 'December'
                ],
                day = self.addZero(date.getDate()),
                monthIndex = date.getMonth(),
                year = self.addZero(date.getFullYear()),
                hours = self.addZero(date.getHours()),
                minutes = self.addZero(date.getMinutes());

            self.serverTime = [day, monthNames[monthIndex], year].join(' ') + ' ' + [hours, minutes].join(':');
            self.renderWithTemplate(self);

            return self;
        },
        addZero: function(num) {
            return num < 10 ? '0' + num : num;
        }
    });

module.exports = FooterView;