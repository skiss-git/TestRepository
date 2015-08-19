import I18n from '../../i18n/i18n.js';
import React from 'react/addons';
import $ from 'jquery';
import _ from 'underscore';
import Checkout from '../../models/checkout.js';

export default React.createClass({
  displayName: 'CheckoutItem',
  propTypes: {
    checkout: React.PropTypes.instanceOf(Checkout),
    editable: React.PropTypes.bool,
    errors: React.PropTypes.arrayOf(React.PropTypes.string),
    onSelect: React.PropTypes.func.isRequired,
    selected: React.PropTypes.bool
  },

  getInitialState: function () {
    return {
      notify: null,
      errors: []
    };
  },

  onSelect: function () {
    this.props.onSelect(this.props.checkout.id);
  },

  clearErrors: function () {
    this.setState({
      notify: null,
      errors: []
    });
    this.props.checkout.unset('errors');
  },

  renewItem: function () {
    var component = this;
    this.setState({errors: []});
    this.props.checkout.renew().done(function () {
      component.setState({notify: I18n.t('checkouts.success_message.this')}, null);
    }).fail(function (errors) {
      component.setState({errors: errors}, null);
    });
  },

  removeIfTransparent: function (e) {
    if (e.target && $(e.target).hasClass('item-image')) {
      $(e.target).removeClass('item-image');
      if ($(e.target).width() === 1) {
        $(e.target).detach();
      } else {
        $(e.target).addClass('item-image');
      }
    }
  },

  render: function () {
    var checkout = this.props.checkout.attributes,
      daysUntilOverdue = this.props.checkout.timeUntil('dueDate'),
      status = null,
      titleBreakpoint = (checkout.item.title).indexOf(' ', 50),
      mobileTitle = titleBreakpoint > 0 ? (checkout.item.title).substring(0, titleBreakpoint) : checkout.item.title,
      desktopTitle = titleBreakpoint > 0 ? (checkout.item.title).substring(titleBreakpoint) : null,
      details, renewalAction;

    if (checkout.overdue) {
      status = (
        <div className="panel-status">
          <div className="status status-danger">
            <div className="status-message">Overdue</div>
          </div>
        </div>
      );
    } else if (daysUntilOverdue < 3) {
      status = (
        <div className="panel-status">
          <div className="status status-base">
            <div className="status-message">Due Soon</div>
          </div>
        </div>
      );
    }

    if (_.size(this.state.notify)) {
      renewalAction = (
        <div className="meta-alert alert-success">
          <p className="alert-title success-message">Renew Successful</p>
        </div>
      );
    } else if (_.size(this.state.errors)) {
      renewalAction = (
        <div className="meta-alert alert-failure">
          <p className="alert-title failure-message">Renew Failed</p>

          <p className="alert-message">{this.state.errors}</p>
        </div>
      );
    } else if (!this.props.checkout.renewable()) {
      renewalAction = (
        <div className="meta-alert alert">
          <p className="alert-title">All Renewals Used</p>
        </div>
      );
    } else if (this.props.checkout.fresh()) {
      renewalAction = (
        <div className="meta-alert alert">
          <p className="alert-title">You cannot renew an item on the day it was checked out</p>
        </div>
      );
    } else if (this.props.checkout.renewed()) {
      renewalAction = (
        <div className="meta-alert alert">
          <p className="alert-title">You've already renewed this item today</p>
        </div>
      );
    } else if (!this.props.editable) {
      renewalAction = <button className="btn btn-secondary meta-action" onClick={this.renewItem}>Renew</button>;
    }

    if (!this.props.checkout.generic()) {
      details = <a href={checkout.item.url}>View item details</a>;
    }

    return (
      <div className="checkout" data-id={checkout.id} key={checkout.id}>
        <div className={'panel checkout-panel' + (this.props.checkout.timeUntil('dueDate') < 3 ? ' has-status' : '')}>
          <div className="panel-content">
            <div className={'item is-editable' + (this.props.editable ? ' is-editable' : '')}>
              <div className="item-checkbox checkbox">
                <input checked={this.props.selected} className="sr-only" id={'item_' + checkout.id}
                       onChange={this.onSelect} type="checkbox" />
                <label className="checkbox-display item-header" htmlFor={'item_' + checkout.id}>
                  <img alt="" className="item-image" onLoad={this.removeIfTransparent} src={checkout.item.cover.url}/>

                  <h3 className="item-title">{[mobileTitle, desktopTitle ?
                    <span key={checkout.id + '-title'}><span className="hidden-desktop">...</span><span className="hidden-mobile">{' ' + desktopTitle}</span></span> : null]}</h3>
                </label>

                <div className="item-body">
                  <p className="item-author">{checkout.item.author}</p>

                  <p className="item-type">{checkout.item.format.type}</p>

                  <p className="item-barcode">Barcode: {checkout.holding.barcode}</p>
                  {details}
                </div>
              </div>
            </div>
          </div>
          <div className="panel-meta">
            {status}
            <div className="meta">
              <ul className="meta-list list-embedded">
                <li className="hidden-desktop">Due <strong>{this.props.checkout.formatDate('dueDate', 'short')}</strong>
                </li>
                <li className="hidden-mobile">Due
                  <strong>{this.props.checkout.timeSince('dueDate', false)}</strong>{' (' + this.props.checkout.formatDate('dueDate', 'short') + ')'}
                </li>
                {checkout.overdueInfo ?
                  <li>Fines: <span className="text-danger">{I18n.toCurrency(checkout.overdueInfo.amount)}</span>
                  </li> : null}
                <li>Times renewed: {checkout.renewals}</li>
              </ul>
              {renewalAction}
            </div>
          </div>
        </div>
      </div>
    );
  }
});
