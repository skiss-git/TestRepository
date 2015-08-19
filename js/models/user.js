import Backbone from 'backbone';
import Dates from '../concerns/dates.js';
import Promises from '../concerns/promises.js';
import moment from 'moment';
import $ from 'jquery';
import _ from 'underscore';
import app from '../app.jsx';

var User = Backbone.Model.extend({
  initialize: function () {
    this.set('circulationSummary', this.get('circulationSummary') || {});
  },

  updateBranch: function (branch) {
    var user = this;
    return $.post('/yabeta/settings/home_branch', {home_branch: branch}).done(function (data) { // eslint-disable-line camelcase
      user.set(data);
    });
  },

  updatePreferedName: function (name) {
    var user = this;
    return $.post('/yabeta/settings/change_pref_name', {preferredName: name}).done(function (data) {
      user.set(data);
    });
  },

  changePin: function (oldPin, newPin) {
    return $.post('/yabeta/settings/change_pin', {old_pin: oldPin, pin: newPin}); // eslint-disable-line camelcase
  },

  numberOfHolds: function () {
    return this.holds && this.holds.length || this.get('circulationSummary').numberOfHolds;
  },

  numberOfAvailableHolds: function () {
    return this.holds && this.holds.filtered('ready').length || this.get('circulationSummary').numberOfAvailableHolds;
  },

  numberOfInTransitHolds: function () {
    return this.holds && this.holds.filtered('transit').length || this.get('circulationSummary').numberOfInTransitHolds;
  },

  numberOfPendingHolds: function () {
    return this.holds && this.holds.filtered('pending').length || this.get('circulationSummary').numberOfHolds - this.get('circulationSummary').numberOfInTransitHolds - this.get('circulationSummary').numberOfAvailableHolds;
  },

  numberOfPickupSoonHolds: function () {
    return this.holds && this.holds.pickupSoon().length || this.get('circulationSummary').numberOfPickupSoonHolds;
  },

  numberOfCheckouts: function () {
    return this.checkouts && this.checkouts.length || this.get('circulationSummary').numberOfCheckouts;
  },

  numberOfOverdueCheckouts: function () {
    return this.checkouts && this.checkouts.overdue().length || this.get('circulationSummary').numberOfOverdues;
  },

  numberOfDueSoonCheckouts: function () {
    return this.checkouts && this.checkouts.dueSoon().length || this.get('circulationSummary').numberOfDueSoonCheckouts;
  },

  estimatedCharges: function () {
    return this.get('circulationSummary').estimatedFines;
  },

  payableCharges: function () {
    return this.get('circulationSummary').payableFines;
  },

  pendingCharges: function () {
    return this.estimatedCharges() - this.payableCharges();
  },

  getHomeBranchCode: function () {
    if (this.get('homeBranch')) {
      return this.get('homeBranch').id;
    }
    return null;
  },

  getCardExpiry: function (format) {
    var date = this.get('membershipInfo').expirationDate;
    if (app.config.dateFormats[format]) {
      format = app.config.dateFormats[format];
    }
    return date === null ? '' : moment(date).format(format);
  }
});

_.extend(User.prototype, Dates, Promises);

export default User;
