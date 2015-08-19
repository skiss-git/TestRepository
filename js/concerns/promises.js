import _ from 'underscore';
import $ from 'jquery';

export default {
  saveAsPromise: function (attributes, options) {
    return this.wrapInPromise(_.bind(this.save, this, attributes, options));
  },

  destroyAsPromise: function (options) {
    return this.wrapInPromise(_.bind(this.destroy, this, options));
  },

  wrapInPromise: function (boundMethodReturningJqxhr) {
    var deferred = $.Deferred(); // eslint-disable-line new-cap
    var jqXHR = boundMethodReturningJqxhr();
    if (jqXHR && jqXHR.done) {
      jqXHR.done(function (data) {
        deferred.resolve(data);
      }).fail(function (xhr) {
        deferred.reject(xhr.responseJSON && xhr.responseJSON.errors || xhr.responseText);
      });
    } else {
      deferred.reject();
    }
    return deferred.promise();
  }
};
