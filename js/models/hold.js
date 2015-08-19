import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'underscore';
import Dates from '../concerns/dates.js';
import Promises from '../concerns/promises.js';
import app from '../app.jsx';

var Hold = Backbone.Model.extend({
  initialize: function () {
    this.parseDates();
    this.on('change', this.parseDates);
  },

  isActive: function () {
    return this.get('status') !== 'SUSPEND';
  },

  pickupSoon: function () {
    return this.timeUntil('readyDateExpiration') < 3;
  },

  type: function () {
    if (this.get('status') === 'READY') {
      return 'ready';
    }
    if (this.get('status') === 'IN_TRANSIT') {
      return 'transit';
    }
    return 'pending';
  },

  activate: function () {
    var hold = this;
    hold.set('status', 'PENDING'); // assume this goes thru
    return this.wrapInPromise(function () {
      return $.post(hold.url() + '/activate');
    }).done(function (data) {
      hold.set(data);
    }).fail(function () {
      hold.set('status', 'SUSPEND'); // unless it doesnt
    });
  },

  deactivate: function () {
    var hold = this;
    hold.set('status', 'SUSPEND'); // assume this goes thru
    return this.wrapInPromise(function () {
      return $.post(hold.url() + '/deactivate');
    }).done(function (data) {
      hold.set(data);
    }).fail(function () {
      hold.set('status', 'PENDING'); // unless it doesnt
    });
  },

  cancel: function () {
    return this.destroyAsPromise({wait: true});
  },

  changeExpiryDate: function (date) {
    return this.saveAsPromise({expiration: date}, {wait: true});
  },

  changePickupLocation: function (location) {
    return this.saveAsPromise({
      pickupLocation: {
        id: location,
        description: app.json.branches[location] && app.json.branches[location].name
      }
    }, {wait: true});
  }
});

_.extend(Hold.prototype, Dates, Promises);

export default Hold;
