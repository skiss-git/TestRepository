import moment from 'moment';
import _ from 'underscore';
import app from '../app.jsx';

export default {
  parseDates: function () {
    var iso8601Pattern = /^[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9](T[0-9][0-9](:[0-9][0-9](:[0-9][0-9])(\.[0-9][0-9][0-9]?)?)?)?([\-+][0-9][0-9]:[0-9][0-9])?$/,
      ymdPattern = /^[0-9][0-9][0-9][0-9]\/[0-1][0-9]\/[0-3][0-9]$/,
      changes = {};
    _.each(this.attributes, function (value, key) {
      if (_.isString(value) && (iso8601Pattern.test(value) || ymdPattern.test(value))) {
        changes[key] = new Date(value);
      }
    }, this);
    this.set(changes);
  },

  formatDate: function (date, format) {
    if (this.get(date) !== undefined) {
      date = this.get(date);
    }
    if (app.config.dateFormats[format]) {
      format = app.config.dateFormats[format];
    }

    return date === null ? '' : moment(date).format(format);
  },

  daysRemaining: function (date) {
    if (this.get(date) !== undefined) {
      date = this.get(date);
    }

    return date === null ? '' : moment(date).diff(moment(), 'days');
  },

  timeSince: function (date) {
    if (this.get(date) !== undefined) {
      date = this.get(date);
    }

    return date === null ? '' : moment().startOf('day').to(date);
  },

  timeUntil: function (date) {
    if (this.get(date) !== undefined) {
      date = this.get(date);
    }

    return date === null ? '' : Math.ceil(moment(date).diff(moment(), 'days', true));
  },

  isToday: function (date) {
    if (this.get(date) !== undefined) {
      date = this.get(date);
    }

    return date === null ? false : moment(date).diff(moment(), 'days') === 0;

  }
};
