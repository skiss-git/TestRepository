import I18n from '../../i18n/i18n.js';
import React from 'react/addons';
import $ from 'jquery';
import _ from 'underscore';
import Notifications from '../common/notifications.jsx';
import Dropdown from '../common/dropdown.jsx';
import Modal from '../common/modal.jsx';
import CheckoutItem from './checkout_item.jsx';
import 'bootstrap-sass/assets/javascripts/bootstrap/affix.js';
import classNames from 'classnames';
import Checkouts from '../../collections/checkouts.js';

export default React.createClass({
  displayName: 'CheckoutList',

  propTypes: {
    checkouts: React.PropTypes.instanceOf(Checkouts)
  },

  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function () {
    return {
      selectAll: false,
      selected: [],
      selectedCheckout: null,
      showActions: false,
      sortOrder: 'dueDate'
    };
  },

  componentWillMount: function () {
    var component = this;

    this.setState({transitioning: true});
    this.props.checkouts.ensurePopulated(function () {
      component.setState({transitioning: false});
      component.resort();
    });
  },

  componentDidMount: function () {
    this.initializeHeader(); // TODO: Fix so it doesn't run when loading indicator is shown, or always show header!!!
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  },

  componentWillReceiveProps: function () {
    this.initializeHeader();
  },

  initializeHeader: function () {
    var component, header;
    if (this.refs) {
      component = $(React.findDOMNode(this.refs.affix));
      header = $(React.findDOMNode(this.refs.header));
      component.css({'width': header.width()});
      component.affix({
        offset: {
          top: component.offset() ? component.offset().top : 0
        }
      }).on('affix.bs.affix', function () {
        header.css({'height': component.height()});
      }).on('affix-top.bs.affix', function () {
        header.css({'height': 'auto'});
      });
    }
  },

  onSort: function (e) {
    this.setState({sortOrder: e.target.value}, function () {
      this.resort();
    });
  },

  resort: function () {
    this.setState({
      sortedCheckouts: this.sortedCheckouts()
    });
  },

  sortedCheckouts: function () {
    var sortOrder = this.state.sortOrder;
    return this.props.checkouts.sortBy(function (checkout) {
      if (sortOrder === 'dueDate') {
        var date = checkout.get('dueDate');
        return date ? date : Infinity;
      } else if (sortOrder === 'title') {
        return checkout.get('item').sortableTitle;
      } else if (sortOrder === 'author') {
        return checkout.get('item').author;
      } else if (sortOrder === 'format') {
        return checkout.get('item').format.type;
      }
    });
  },

  selectAll: function (event) {
    var selected = event.target.checked;
    this.setState({
      'selectAll': selected,
      'selected': selected ? this.props.checkouts.map(function (checkout) {
        return checkout.id;
      }) : []
    });
  },

  toggleSelected: function (id) {
    var selected = _.contains(this.state.selected, id) ? _.without(this.state.selected, id) : this.state.selected.concat(id);
    this.setState({
      'selectAll': (selected.length >= this.props.checkouts.length),
      'selected': selected
    });
  },

  selectedCheckouts: function () {
    return this.state.selectedCheckout ?
      [this.state.selectedCheckout] :
      this.props.checkouts.selected(this.state.selected);
  },

  renewCheckouts: function () {
    var component = this,
      actedOn = component.state.selected;

    this.clearErrors();
    this.props.checkouts.renew(this.state.selected).done(function (checkouts) {
      var results = component.collateErrors({actedOn: actedOn, results: checkouts});
      component.setState({
        notify: results.successes.length ? I18n.t('checkouts.success_message', {count: results.successes.length}) : null,
        alert: results.failures.length ? I18n.t('checkouts.error_message', {count: results.failures.length}) : null,
        alertDetails: results.failures
      });
    }).fail(function (message) {
      component.setState({alert: I18n.t('general_failure') + (_.isString(message) ? ': ' + message : '')});
    });
  },

  toggleActions: function () {
    this.setState({
      'showActions': this.state.showActions ? false : true,
      'selectAll': this.state.showActions ? false : this.state.selectAll,
      'selected': this.state.showActions ? [] : this.state.selected
    });
  },

  /* takes a collection of objects, an array of actedOn IDs and returns 2 arrays of success IDs and failure messages */
  collateErrors: function (params) {
    var res = {successes: [], failures: []};
    _.each(params.results, function (checkout) {
      if (params.actedOn && _.contains(params.actedOn, checkout.id) && !checkout.errors) {
        res.successes.push(checkout.id);
      } else if ((!params.actedOn || _.contains(params.actedOn, checkout.id)) && checkout.errors) {
        res.failures.push(checkout.item.title + ': ' + checkout.errors.join(', '));
      }
    });
    return res;
  },

  clearErrors: function () {
    this.setState({
      notify: null,
      alert: [],
      alertDetails: []
    });
    this.props.checkouts.each(function (checkout) {
      checkout.unset('errors');
    });
  },

  render: function () {
    var checkouts = this.props.checkouts,
      checkoutList = null,
      pageHeader = null,
      modalWindows = null;

    if (this.state.transitioning) {
      return (
        <div className="preload-backdrop">
          <p className="preload-body">Loading checkouts...</p>
          <i className="icon icon-preload"></i>
        </div>
      );
    }

    if (checkouts.length > 0) {
      pageHeader = (
        <div className="page-header-affix" ref="header">
          <header className="page-header affix-top" ref="affix">
            <a className="page-back hidden-desktop" href="/">
              <h1 className="page-title">Checkouts ({checkouts.length})</h1>
            </a>

            <div className="page-toolbar">
              <div className="toolbar">
                <div className={classNames({ 'toolbar-select': true, 'hidden-mobile': !this.state.showActions })}>
                  <div className="checkbox">
                    <input checked={this.state.selectAll} className="sr-only"
                           id="item-select-all" onChange={this.selectAll} type="checkbox" />
                    <label className="checkbox-display" htmlFor="item-select-all">Select all</label>
                  </div>
                </div>
                <div className="toolbar-edit hidden">
                  <button className="btn btn-text"
                          onClick={this.toggleActions}>{this.state.showActions ? 'Done' : 'Edit'}</button>
                </div>
                <div className="toolbar-sort">
                  <span className="sort-label hidden-mobile">Sort by </span>
                  <Dropdown onChange={this.onSort} value={this.state.sortOrder}>
                    <option value="dueDate">Due Date</option>
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="format">Format</option>
                  </Dropdown>
                </div>
              </div>
              <nav
                className={classNames({ tabs: true, 'checkout-tabs': true, 'hidden-mobile': true, 'hidden': !this.state.showActions && this.state.selected.length === 0 })}>
                <ul className="menu menu-horizontal tabs-menu">
                  <li>
                    <button className="menu-item" onClick={this.renewCheckouts} value="renew">Renew checkouts</button>
                  </li>
                </ul>
              </nav>
            </div>
          </header>
        </div>
      );
      checkoutList = (
        <ul className="panels checkouts">
          {_.map(this.state.sortedCheckouts, function (checkout) {
            return (<li data-id={checkout.id} key={checkout.id}>
              <CheckoutItem checkout={checkout} editable={this.state.showActions || this.state.selected.length > 0}
                            onSelect={this.toggleSelected} selected={_.contains(this.state.selected, checkout.id)} />
            </li>);
          }, this)}
        </ul>
      );
      modalWindows = (
        <Modal confirm="OK" onCancel={this.modalClose}
               onConfirm={this.renewCheckouts} ref="renew" title="Renew Checkouts">
          <p>Are you sure you want to renew the
            following {this.selectedCheckouts().length} {this.selectedCheckouts().length === 1 ? 'checkout' : 'checkouts'}?</p>
          <ul>
            {_.map(this.selectedCheckouts(), function (checkout, i) {
              return <li key={i}>{checkout.get('item').title}</li>;
            }, this)}
          </ul>
        </Modal>
      );
    } else {
      pageHeader = <div />;
      checkoutList = <div className="empty checkouts-empty"></div>;
      modalWindows = <div />;
    }

    return (
      <div className="page checkouts-page">
        <section className="page-content">
          {pageHeader}
          <Notifications alert={this.state.alert} alertDetails={this.state.alertDetails} dismissable={true}
                         notify={this.state.notify} onDismiss={this.clearErrors}/>
          {checkoutList}
          {modalWindows}
        </section>
      </div>
    );

  }
});
