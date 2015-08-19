import Backbone from 'backbone';
import Checkout from '../models/checkout.js';
import moment from 'moment';
import $ from 'jquery';
import app from '../app.jsx';

export default Backbone.Collection.extend({
  displayName: 'Checkouts',
  model: Checkout,
  url: '/yabeta/checkouts',

  initialize: function (models) {
    this._populated = models && models.length > 1;
    this.on('sync reset', function () {
      this._populated = true;
    });
  },

  ensurePopulated: function (callback) {
    if (!this._populated) {
      this.fetch({success: callback});
    } else if (callback) {
      callback();
    }
  },

  selected: function (ids) {
    return this.filter(function (checkout) {
      return ids.indexOf(checkout.id) > -1;
    });
  },

  overdue: function () {
    return this.filter(function (checkout) {
      return moment(checkout.attributes.dueDate).diff(moment(), 'days') < 0;
    });
  },

  dueSoon: function () {
    return this.filter(function (checkout) {
      var diff = moment(checkout.attributes.dueDate).diff(moment(), 'days');
      return diff >= 0 && diff < 3;
    });
  },

  renew: function (ids) {
    var checkouts = this;
    return $.post(this.url + '/renewals.json', {ids: ids}).done(function (data) {
      checkouts.set(data);
      app.charges.fetch();
    });
  }
});
