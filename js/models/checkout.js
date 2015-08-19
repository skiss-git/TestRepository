import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'underscore';
import Dates from '../concerns/dates.js';
import Promises from '../concerns/promises.js';
import app from '../app.jsx';

var Checkout = Backbone.Model.extend({
  initialize: function () {
    this.parseDates();
    this.on('change', this.parseDates);
    this.on('error', function (errors) {
      this.errors = errors;
      this.trigger('change');
    });
  },

  renewable: function () {
    return this.get('renewalsRemaining') > 0;
  },

  fresh: function () {
    return this.isToday('checkoutDate');
  },

  renewed: function () {
    return this.isToday('lastRenewedDate');
  },

  generic: function () {
    var call, holding = this.get('holding');
    if (holding !== undefined) {
      call = holding.callNumber.trim();
    }
    return call === null ? false : call.substr(0, 7) === 'GENERIC';
  },

  renew: function () {
    var checkout = this;

    return this.wrapInPromise(function () {
      return $.post(checkout.url() + '/renewal');
    }).done(function (data) {
      checkout.set(data);
      app.charges.fetch();
    });
  }
});

_.extend(Checkout.prototype, Dates, Promises);

export default Checkout;
