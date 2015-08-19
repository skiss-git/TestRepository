import $ from 'jquery';
import Backbone from 'backbone';
import React from 'react/addons';
import Spinner from 'spin.js';
import Router from './routes.js';
import YourAccount from './components/root.jsx';
import Holds from './collections/holds.js';
import Checkouts from './collections/checkouts.js';
import Charges from './collections/charges.js';
import User from './models/user.js';
import 'bootstrap-sass/assets/javascripts/bootstrap/affix.js';

var app = {

  debug: true,
  viewport: 'desktop',

  config: {
    dateFormats: {
      short: 'ddd D MMM',
      long: 'D MMM YYYY'
    }
  },

  init: function () {


    // set breakpoints to the same as bootstrap media queries
    app.setViewport();

    $(window).on('resize', function () {
      app.setViewport();
    });

    app.json = app.json || {};

    // init backbone models
    app.holds = new Holds(app.json.holds);
    app.checkouts = new Checkouts(app.json.checkouts);
    app.charges = new Charges(app.json.charges);
    app.currentUser = new User(app.json.currentUser);
    app.currentUser.holds = app.holds;
    app.currentUser.checkouts = app.checkouts;
    app.currentUser.charges = app.charges;

    if ($('div.react-root').length > 0) {
      // mount root React component
      app.rootComponent = React.render(<YourAccount
          currentUser={app.currentUser} holds={app.holds}
          checkouts={app.checkouts} charges={app.charges}/>,
        $('div.react-root')[0]);
    }

    $('.navbar-main-toggle').on('click', function () {
      $(this).toggleClass('collapsed');
      $('.site-container').toggleClass('js-collapse');
      $('.navbar-main').toggleClass('js-collapse');
    });

    this.spinner = new Spinner({
      lines: 15, // The number of lines to draw
      length: 15, // The length of each line
      width: 5, // The line thickness
      radius: 20, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#333', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: true, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '250px', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    });

    $(document).on('pjax:send', function () {
      $('.site-transition').animate({opacity: 0});
      app.spinner.spin(document.getElementById('pjax_container'));
    });

    $(document).on('pjax:complete', function (state, response) {
      if (!response || (response.status !== 302 && response.status !== 401 && response.status !== 406 && response.status !== 500)) {
        $('.site-transition').animate({opacity: 1});
        app.spinner.stop();
      }
    });

    $(document).on('pjax:timeout', function (e) {
      e.preventDefault();
    });

    app.router = new Router();

    // init history
    Backbone.history.start({pushState: true, root: '/yabeta'});

    // intercept links that backbone will handle
    $(document).on('click', 'a[href^="/"]', function (e) {
      var href = $(this).attr('href').substr(1);
      if (app.router.routes[href]) {
        e.preventDefault();
        app.router.navigate(href, {trigger: true});
      }
    });
    
    // disable all buttons after click
    // $('body').on('click', 'button', function() {
    //     $(this).attr('disabled', true);
    // });
  },

  // pass backbone page changes into react
  setPage: function (page, callback) {
    app.rootComponent.setState({page: page}, callback);
  },

  setViewport: function () {
    var responsiveViewport = $(window).width(),
      screenSmall = 768,
      screenMedium = 992,
      screenLarge = 1200;
    if (responsiveViewport <= screenSmall) {
      app.viewport = 'mobile';
    } else if (responsiveViewport <= screenMedium) {
      app.viewport = 'mobile';
    } else if (responsiveViewport <= screenLarge) {
      app.viewport = 'desktop';
    }
  },

  initPage: function () {
    var prefixTestList = ['', '-webkit-', '-ms-', '-moz-', '-o-'],
      stickyTestElement, hasSticky = false;
    if (app.viewport === 'mobile' || app.viewport === 'tablet') {
      // browser test for position: sticky
      stickyTestElement = document.createElement('div');
      for (var i = 0, l = prefixTestList.length; i < l; i++) {
        stickyTestElement.style.position = prefixTestList[i] + 'sticky';
        if (stickyTestElement.style.position !== '') {
          hasSticky = true;
          break;
        }
      }
      // apply affix if position: sticky is unavailable
      if (hasSticky) {
        $('#page-header-fixed').parent().addClass('sticky');
        $('#account-header-fixed').parent().addClass('sticky');
      } else {
        setTimeout(function () {
          $('#page-header-fixed, #account-header-fixed').affix({
            offset: {
              top: function () {
                return (this.top = $('.global-alerts').height() + $('.site-header').height());
              }
            }
          });
        }, 100);
      }
      // set parent height to height of fixed menu
      $('#page-header-fixed').parent().height($('#page-header-fixed').height());
      $('#account-header-fixed').parent().height($('#account-header-fixed').height());
    } else {
      // set width to an inline style element
      $('.page-navbar-fixed').width($('.page-navbar-fixed').width());
      // set height to an inline style element
      // $('.page-header').each(function() {
      //   $(this).height($(this).height());
      // });
      // fix the item navbar to the top of the page
    }

    // close status messages, resize header
    $('.alert').bind('close.bs.alert', function () {
      var $this = $(this),
        $header = $this.closest('.page-header'),
        height = 0;
      if ($header) {
        height = $header.outerHeight() - $this.outerHeight(true);
        if ($this.siblings().length) {
          height += 5;
        }
        $header.height(height);
      }
    });

    // cookie global alert dismissals
    $('.global-alert').bind('closed.bs.alert', function () {
      if ($(this).data('id')) {
        $.cookie('global-alert-' + $(this).data('id'), true, {expires: 2});
      }
    });
  },

  addGestures: function () {
  },

  setActivePage: function (url) {
    // set the active page
    $('.site-menu a.active').removeClass('active');
    $('.site-menu a[href="' + url + '"]').addClass('active');
  },

  setPageTitle: function (title) {
    $('title').text('Toronto Public Library - ' + title);
  }

};
export default app;
