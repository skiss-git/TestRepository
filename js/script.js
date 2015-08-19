import Backbone from 'backbone';
import app from './app.jsx';
// TODO: Render header using JSX?
import 'bootstrap-sass/assets/javascripts/bootstrap/dropdown.js';

// hack to include .json extension and prevent chrome cache bug (https://code.google.com/p/chromium/issues/detail?id=108766)
Backbone.ajax = function () {
  if (arguments[0].url && !arguments[0].url.match(/\./)) {
    arguments[0].url += '.json';
  }
  return Backbone.$.ajax.apply(Backbone.$, arguments);
};

window.app = app;
