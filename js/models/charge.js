import Backbone from 'backbone';
import _ from 'underscore';
import Dates from '../concerns/dates.js';

var Charge = Backbone.Model.extend({
    initialize: function () {
      this.parseDates();
      this.on('change', this.parseDates);
    }
  });

  _.extend(Charge.prototype, Dates);

export default Charge;
