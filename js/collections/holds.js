import Backbone from 'backbone';
import Hold from '../models/hold.js';
import moment from 'moment';
import $ from 'jquery';

export default Backbone.Collection.extend({
  displayName: 'Holds',
  model: Hold,
  url: '/yabeta/holds',

  initialize: function (models) {
    this._populated = models && models.length;
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
    return this.filter(function (hold) {
      return ids.indexOf(hold.id) >= 0;
    });
  },

  filtered: function (type) {
    return this.filter(function (hold) {
      return !type || hold.type() === type;
    });
  },

  pickupSoon: function () {
    return this.filter(function (hold) {
      return moment(hold.attributes.readyDateExpiration).diff(moment(), 'days') < 3;
    });
  },

  cancel: function (ids) {
    var holds = this;
    return $.post(this.url + '/cancellations.json', {ids: ids}).done(function (data) {
      holds.set(data);
    });
  },

  activate: function (ids) {
    var holds = this;
    return $.post(this.url + '/activations.json', {ids: ids}).done(function (data) {
      holds.set(data);
    });
  },

  deactivate: function (ids) {
    var holds = this;
    return $.post(this.url + '/deactivations.json', {ids: ids}).done(function (data) {
      holds.set(data);
    });
  },

  changePickupLocation: function (ids, location) {
    var holds = this;
    return $.post(this.url + '/locations.json', {ids: ids, pickup_location: location}).done(function (data) { // eslint-disable-line camelcase
      holds.set(data);
    });
  },

  changeExpiryDate: function (ids, date) {
    var holds = this;
    return $.post(this.url + '/expiry_dates.json', {ids: ids, expiry_date: date}).done(function (data) { // eslint-disable-line camelcase
      holds.set(data);
    });
  }
});
