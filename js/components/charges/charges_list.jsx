import I18n from '../../i18n/i18n.js';
import React from 'react/addons';
import BackboneCollection from '../../mixins/backbone_collection.js';
import ChargeItem from './charge_item.jsx';

export default React.createClass({
  displayName: 'ChargesList',
  mixins: [React.addons.LinkedStateMixin, BackboneCollection],

  componentDidMount: function () {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },

  getCollection: function () {
    return this.props.charges;
  },

  componentWillMount: function () {
    this.props.charges.ensurePopulated();
  },

  render: function () {
    return (
      <div className="page charges-page">
        <header className="page-header hidden-desktop">
          <a href="/" className="page-back">
            <h1
              className="page-title">{'Charges (' + I18n.toCurrency(this.props.currentUser.estimatedCharges()) + ')'}</h1>
          </a>
        </header>
        <div className="page-content charges">
          <div className="panel charges-summary-panel">
            <div className="panel-content">
              <div className="table-row">
                <div className="table-header">
                  <div>Charges payable now:</div>
                  <img src="/images/charges/credit-card.png" alt="" className="credit-card"/></div>
                <div className="table-content">
                  <div>{I18n.toCurrency(this.props.currentUser.payableCharges())}</div>
                  <a href="#" className="btn btn-secondary">Pay Now</a></div>
              </div>
            </div>
            <div className="panel-content">
              <div className="table-row">
                <div className="table-header">Charges payable on return/renewal of overdue items:</div>
                <div className="table-content">{I18n.toCurrency(this.props.currentUser.pendingCharges())}</div>
              </div>
            </div>
            <div className="panel-content">
              <div className="table-row">
                <div className="table-header">Total charges:</div>
                <div className="table-content">{I18n.toCurrency(this.props.currentUser.estimatedCharges())}</div>
              </div>
            </div>
          </div>
          <ul className="panels">
            {this.props.charges.map(function (charge, i) {
              return <li data-id={charge.id} key={charge.id}>
                <ChargeItem charge={charge} index={i} key={charge.id}/>
              </li>;
            }, this)}
          </ul>
        </div>
        <div className="card card-primary charges-about">
          <div className="card-header">
            <h4 className="card-title">About Charges</h4>
          </div>
          <div className="card-content">
            <ul>
              <li>Overdue charges can only be paid when the item is returned or renewed.</li>
              <li>More than $10 in charges? Your account will be sent to a collection agency, and be charged an
                administration fee.
              </li>
            </ul>
            <a href="#">More information</a>
          </div>
        </div>
      </div>

    );
  }
});
