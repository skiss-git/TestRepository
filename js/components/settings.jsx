import React from 'react/addons';
import _ from 'underscore';
import Modal from './common/modal.jsx';
import Autocomplete from './common/autocomplete.jsx';
import Notifications from './common/notifications.jsx';

export default React.createClass({
  displayName: 'Settings',

  mixins: [React.addons.LinkedStateMixin],

  componentDidMount: function () {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  },

  getInitialState: function () {
    return {
      modal: null,
      notify: null,
      alert: null
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

  clearErrors: function () {
    this.setState({
      notify: null,
      alert: null
    });
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

  oldPinValid: function () {
    return _.size(this.state.oldPin) >= 4;
  },

  newPinValid: function () {
    return _.size(this.state.newPin) >= 4;
  },

  confirmPinValid: function () {
    return _.size(this.state.confirmPin) >= 4 && this.state.confirmPin == this.state.newPin;
  },

  changePin: function (oldPin, newPin) {
    var component = this;
    this.props.currentUser.changePin(this.state.oldPin, this.state.newPin).done(function (message) {
      component.setState({notify: 'PIN updated.'});
    }).fail(function (message) {
      component.setState({alert: message});
    });
    this.modalClose();
  },

  editName: function () {
    var component = this;

    this.props.currentUser.updatePreferedName(this.state.name).done(function (message) {
      component.setState({notify: 'Prefered Name was Updated'});
    }).fail(function (message) {
      component.setState({alert: message});
    });
    this.modalClose();
  },

  render: function () {
    var user = this.props.currentUser.attributes,
      notificationTypes = {
        'EMAIL': 'E-mail'
      };

    var branches = _.reduce(app.json.branches, function (memo, branch, code) {
      memo[code] = branch.name;
      return memo;
    }, {});

    return (
      <div className="page settings-page">
        <header className="page-header hidden-desktop">
          <a href="/" className="page-back">
            <h1 className="page-title">Settings</h1>
          </a>

          <h1 className="page-title hidden-mobile">Account Settings</h1>
        </header>
        <div className="page-content">
          <Notifications notify={this.state.notify} alert={this.state.alert} dismissable={true}
                         onDismiss={this.clearErrors}/>
          <section className="card card-primary">
            <header className="card-header">
              <h3 className="card-title">Personal Information</h3>
            </header>
            <div className="card-content">
              <div className="card-row">
                <ul className="settings">
                  <li className="setting">
                    <div className="setting-label">Name:</div>
                    <div className="setting-value">{user.personalInfo.displayName}</div>
                  </li>
                  <li className="setting">
                    <div className="setting-label">Address:</div>
                    <div className="setting-value">
                      {user.address.street}<br />
                      {user.address.city + (user.address.province ? ', ' + user.address.province : '')}<br />
                      {user.address.postalCode}
                    </div>
                  </li>
                </ul>
              </div>
              <div className="card-row">
                <ul className="settings">
                  <li className="setting">
                    <div className="setting-label">Library Card No.:</div>
                    <div className="setting-value">{user.libraryBarcode}</div>
                  </li>
                  <li className="setting">
                    <div className="setting-label">Card Expiry:</div>
                    <div className="setting-value">{this.props.currentUser.getCardExpiry('long')}</div>
                    <p className="help">Library cards must be renewed once a year by presenting ID in person at any
                      branch. <a href="http://www.torontopubliclibrary.ca/using-the-library/help/expired-cards.jsp">More
                        information</a></p>
                  </li>
                  <li className="setting">
                    <div className="setting-label">Preferred Name:</div>
                    <div className="setting-value">{user.notificationSettings.preferredName}<a href="#" role="button"
                                                                                               className="btn-text setting-edit">Edit</a>
                    </div>
                    <p className="help">Displays in your email notices and on website pages when you're signed in.</p>
                  </li>
                  <li className="setting">
                    <div className="setting-label">PIN:</div>
                    <div className="setting-value">
                      <button role="button" className="btn-text" onClick={this.modalOpen} value="pin">Change PIN
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <section className="card card-primary">
            <header className="card-header">
              <h3 className="card-title">Home Branch</h3>
            </header>
            <div className="card-content">
              <div className="settings branch-settings">
                <h4 className="branch-name">{user.homeBranch.description}
                  <button className="setting-edit btn-text" role="button" onClick={this.modalOpen} value="branch">
                    Change home branch
                  </button>
                </h4>
                <p className="branch-address">{user.homeBranch.address}</p>

                <p className="help">Your default hold pickup location.</p>
              </div>
            </div>
          </section>
          <section className="card card-primary">
            <header className="card-header">
              <h3 className="card-title">Notification Settings</h3>
            </header>
            <div className="card-content">
              <ul className="settings notification-settings">
                <li className="setting">
                  <div className="setting-label">Telephone:</div>
                  <div className="setting-value">{user.notificationSettings.telephone || 'None provided'}</div>
                </li>
                <li className="setting">
                  <div className="setting-label">E-mail:</div>
                  <div className="setting-value">{user.notificationSettings.email}</div>
                </li>
                <li className="setting">
                  <div className="setting-label">Send Notifications by:</div>
                  <div className="setting-value">
                    <p className="notification-type">{notificationTypes[user.notificationSettings.sendBy]}</p>

                    <p className={user.notificationSettings.reminders ? ' icon-checked' : ' icon-unchecked'}>Remind me
                      2 days before the item is due</p>
                    <a href="#" role="button" className="float-right">Change Notification Settings</a>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <Modal ref="name" title="Edit Preferred Name" confirm="Change preferred name" cancel="Don't change"
                 onConfirm={this.editName} onCancel={this.modalClose}>
            <div className="form-group">
              <label htmlFor="preferred-name" className="form-label">Preferred Name</label>
              <input type="text" id="preferred-name" className="form-control"/>
            </div>
          </Modal>

          <Modal ref="pin" title="Change PIN" onConfirm={this.changePin} confirm="Change PIN" cancel="Don't Change"
                 onCancel={this.modalClose}
                 disabled={!this.oldPinValid() || !this.newPinValid() || !this.confirmPinValid()}>
            <div className="form-group">
              <label htmlFor="old-pin" className="form-label">Your current PIN</label>
              <input type="password" id="old-pin" className={"form-control " + (this.oldPinValid() ? 'valid' : '')}
                     valueLink={this.linkState('oldPin')}/>
            </div>
            <div className="form-group">
              <label htmlFor="new-pin" className="form-label">Your new PIN</label>
              <input type="password" id="new-pin" className={"form-control " + (this.newPinValid() ? 'valid' : '')}
                     valueLink={this.linkState('newPin')}/>
            </div>
            <div className="form-group">
              <label htmlFor="new-pin-repeat" className="form-label">Repeat new PIN</label>
              <input type="password" id="new-pin-repeat"
                     className={"form-control " + (this.confirmPinValid() ? 'valid' : '')}
                     valueLink={this.linkState('confirmPin')}/>
            </div>
          </Modal>

          <Modal ref="branch" classes="branch-modal" title="Edit Home Branch" confirm="Change home branch"
                 cancel="Don't change" onConfirm={this.editBranch} onCancel={this.modalClose}>
            <p className="branch-label">Your current home branch:</p>

            <div className="branch home-branch">
              <h4 className="branch-name">{user.homeBranch.description}</h4>

              <p className="branch-address">{user.homeBranch.address}</p>
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
