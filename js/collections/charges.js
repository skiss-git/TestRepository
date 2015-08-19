import Backbone from 'backbone';
import Charge from '../models/charge.js';

export default Backbone.Collection.extend({
  displayName: 'Charges',
  model: Charge,
  url: '/yabeta/charges',

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

  payable: function () {
    return this.reduce(function (sum, charge) {
      return sum + parseFloat(charge.get('chargeInfo').amount);
    }, 0);
  }

});
