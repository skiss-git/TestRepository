import React from 'react/addons';
import _ from 'underscore';
import I18n from '../i18n/i18n.js';
import Modal from './common/modal.jsx';
import Autocomplete from './common/autocomplete.jsx';
import moment from 'moment';
import app from '../app.jsx';

export default React.createClass({
  displayName: 'Summary',

  componentDidMount: function () {
    // scroll to top of page
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  },

  getInitialState: function () {
    return {
      modal: null
    };
  },

  modalOpen: function (event) {
    if (this.state.modal === null) {
      this.setState({modal: event.target.value});
      this.refs[event.target.value].open();
    }
  },

  modalClose: function () {
    if (this.state.modal !== null) {
      this.setState({modal: null});
      this.refs[this.state.modal].close();
    }
  },

  setHomeBranch: function (branch) {
    this.setState({homeBranch: branch});
  },

  editBranch: function () {
    var component = this;
    this.props.currentUser.updateBranch(this.state.homeBranch).done(function () {
      component.setState({notify: 'Home branch updated.'});
    }).fail(function (message) {
      component.setState({alert: message});
    });
    this.modalClose();
  },

  render: function () {
    var currentUser = this.props.currentUser.attributes,
      branchHours = [],
      weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      checkouts = null,
      holds = null;

    var branches = _.reduce(app.json.branches, function (memo, branch, code) {
      memo[code] = branch.name;
      return memo;
    }, {});

    currentUser.homeBranch.hours.forEach(function (day, id) {
      branchHours[id] = (
        <tr key={id} className={(moment().day() - 1 === id ? 'today' : '')}>
          <td>{weekDays[id]}</td>
          <td>{day.substr(5)}</td>
        </tr>
      );
    });

    if (this.props.currentUser.numberOfCheckouts() > 0) {
      checkouts = (
        <li>
          <a href="/checkouts"
             className={'menu-item' + (this.props.currentUser.numberOfOverdueCheckouts() > 0 ? ' has-overdue' : '')}>
            <h4 className="menu-item-title">Checkouts ({this.props.currentUser.numberOfCheckouts()})</h4>
            <ul className="menu-item-content sub-menu checkouts-sub-menu">
              <li className={this.props.currentUser.numberOfOverdueCheckouts() > 0 ? 'text-danger' : ''}>
                <span className="sub-menu-title">Overdue</span>
                <span className="sub-menu-content">{this.props.currentUser.numberOfOverdueCheckouts()}</span>
              </li>
              <li>
                <span className="sub-menu-title">Due Soon</span>
                <span className="sub-menu-content">{this.props.currentUser.numberOfDueSoonCheckouts()}</span>
              </li>
            </ul>
          </a>
        </li>
      );
    } else {
      checkouts = (
        <li>
          <div className="menu-item">
            <h4 className="menu-item-title">Checkouts ({this.props.currentUser.numberOfCheckouts()})</h4>

            <div className="empty empty-checkouts">
              <div className="empty-content">
                <p>You dont have any items checked out.</p>

                <p><a href="#">Search the website</a> to find something you might like, or visit <a
                  href={currentUser.homeBranch.url}>your local branch</a>.</p>
              </div>
            </div>
          </div>
        </li>
      );
    }

    if (this.props.currentUser.numberOfHolds() > 0) {
      holds = (
        <li>
          <div className="hidden-desktop">
            <h4 className="menu-item-title">Holds ({this.props.currentUser.numberOfHolds()})</h4>
            <ul className="menu-item-content sub-menu holds-sub-menu">
              <li>
                <a href="/holds/ready" className="menu-item">
                  <h4 className="sub-menu-title">Ready for Pickup</h4>
                  <span className="sub-menu-content">{this.props.currentUser.numberOfAvailableHolds()}</span>
                </a>
              </li>
              <li>
                <a href="/holds/transit" className="menu-item">
                  <h4 className="sub-menu-title">In Transit</h4>
                  <span className="sub-menu-content">{this.props.currentUser.numberOfInTransitHolds()}</span>
                </a>
              </li>
              <li>
                <a href="/holds/pending" className="menu-item">
                  <h4 className="sub-menu-title">Still on Hold</h4>
                  <span className="sub-menu-content">{this.props.currentUser.numberOfPendingHolds()}</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="hidden-mobile">
            <a href="/holds"
               className={'menu-item' + (this.props.currentUser.numberOfPickupSoonHolds() > 0 ? ' has-overdue' : '')}>
              <h4 className="menu-item-title">Holds ({this.props.currentUser.numberOfHolds()})</h4>
              <ul className="menu-item-content sub-menu">
                <li>
                  <span className="sub-menu-title">Ready for Pickup</span>
                  <span className="sub-menu-content">{this.props.currentUser.numberOfAvailableHolds()}</span>
                </li>
                <li>
                  <span className="sub-menu-title">In Transit</span>
                  <span className="sub-menu-content">{this.props.currentUser.numberOfInTransitHolds()}</span>
                </li>
                <li>
                  <span className="sub-menu-title">Still on Hold</span>
                  <span className="sub-menu-content">{this.props.currentUser.numberOfPendingHolds()}</span>
                </li>
              </ul>
            </a>
          </div>
        </li>
      );
    } else {
      holds = (
        <li>
          <div className="menu-item">
            <h4 className="menu-item-title">Holds ({this.props.currentUser.numberOfHolds()})</h4>

            <div className="empty empty-holds">
              <div className="empty-content">
                <p>You don't have any items on hold.</p>

                <p><a href="#">Search the website</a> to find something you might like.</p>
              </div>
            </div>
          </div>
        </li>
      );
    }

    return (
      <div className="page summary-page">
        <div className="page-content">
          <header className="page-header hidden-desktop">
            <h1 className="page-title">Account Summary</h1>
          </header>
          <ul className="menu summary-menu">
            {checkouts}
            {holds}
            {
              this.props.currentUser.estimatedCharges() > 0 ?
                <li>
                  <a href={this.props.currentUser.estimatedCharges() ? '/charges' : '#'}
                     className={'menu-item' + (this.props.currentUser.estimatedCharges() ? '' : ' disabled')}>
                    <h4 className="menu-item-title">Charges</h4>
                    <ul className="menu-item-content sub-menu charges-sub-menu">
                      <li>
                        Payable now
                        <div
                          className="text-danger float-right">{I18n.toCurrency(this.props.currentUser.payableCharges())}</div>
                        {
                          this.props.currentUser.payableCharges() ?
                            <div className="charges-payment">
                              <button className="btn btn-secondary payment-btn">Pay now</button>
                              <br />
                              <img src="/images/charges/credit-card.png" alt="" className="payment-cards"/>
                              <span className="payment-fee">($0.50 fee)</span>
                            </div> : null
                        }
                      </li>
                      <li>
                        <div className="sub-menu-title">Charges for overdue items you still have checked out</div>
                        <div
                          className="text-danger float-right">{I18n.toCurrency(this.props.currentUser.pendingCharges())}</div>
                      </li>
                      <li>
                        <div className="sub-menu-title"><strong>Total charges</strong></div>
                        <div
                          className="text-danger float-right">{I18n.toCurrency(this.props.currentUser.estimatedCharges())}</div>
                      </li>
                    </ul>
                  </a>
                </li>
                :
                <li>
                  <div className="menu-item">
                    <h4 className="menu-item-title">Charges</h4>

                    <div className="empty empty-charges">
                      <div className="empty-content">
                        <p>You dont have any charges. Donors added 12,000 new items to the Library's catalogues last
                          year.</p>

                        <p><a href="#">Help us add more</a>.</p>
                      </div>
                    </div>
                  </div>
                </li>
            }
          </ul>
          <div className="summary-content">
            <div className="card card-primary branch-card">
              <div className="card-header">
                Your Home Branch
                <p className="help">Your default hold pickup location.
                  <button className="btn-text" onClick={this.modalOpen} value="branch">Change home branch</button>
                </p>
              </div>
              <div className="card-content">
                <div className="branch home-branch">
                  <h4 className="branch-name"><a
                    href={currentUser.homeBranch.url}>{currentUser.homeBranch.description}</a></h4>

                  <p className="branch-address">Telephone: {currentUser.homeBranch.phone}</p>
                  <table className="table branch-hours-table">
                    <tr>
                      <th>Day</th>
                      <th>Opening - Closing</th>
                    </tr>
                    {branchHours}
                  </table>
                </div>
              </div>
            </div>
            <div className="card card-primary">
              <div className="card-header">
                Library Card Expiry Date
                <p className="help">Library cards must be renewed once a year by presenting ID in person at any
                  branch. <a href="http://www.torontopubliclibrary.ca/using-the-library/help/expired-cards.jsp">More
                    information</a></p>
              </div>
              <div className="card-content">
                {this.props.currentUser.getCardExpiry('long')}
              </div>
            </div>
          </div>

          <Modal ref="branch" classes="branch-modal" title="Edit Home Branch" confirm="Change home branch"
                 cancel="Don't change" onConfirm={this.editBranch} onCancel={this.modalClose}>
            <p className="branch-label">Your current home branch:</p>

            <div className="branch home-branch">
              <h4 className="branch-name">{currentUser.homeBranch.description}</h4>

              <p className="branch-address">{currentUser.homeBranch.address}</p>
            </div>
            <p className="autocomplete-label">Start typing a library branch name:</p>
            <Autocomplete className="autocomplete" initialValue="" onOptionSelected={this.setHomeBranch}
                          options={branches} noMatch="No matching branch"/>
          </Modal>

        </div>
      </div>
    );
  }
});
