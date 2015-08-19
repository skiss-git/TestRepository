import Backbone from 'backbone';
import _ from 'underscore';
import app from './app.jsx';

export default Backbone.Router.extend({
  routes: _.reduce(
    [
      '',
      'holds',
      'holds/ready',
      'holds/pending',
      'holds/transit',
      'checkouts',
      'charges',
      'settings'
    ], function (routes, page) {
      routes[page] = function () {
        app.setPage(page);
      };
      return routes;
    }, {})
});
