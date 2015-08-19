import React from 'react/addons';
import _ from 'underscore';
import $ from 'jquery';
import I18n from '../../i18n/i18n.js';
import Modal from '../common/modal.jsx';
import Dropdown from '../common/dropdown.jsx';
import HoldItem from './hold_item.jsx';
import Autocomplete from '../common/autocomplete.jsx';
import Datepicker from '../common/datepicker.jsx';
import Notifications from '../common/notifications.jsx';
import app from '../../app.jsx';
import 'bootstrap-sass/assets/javascripts/bootstrap/affix.js';
import classNames from 'classnames';

export default React.createClass({
  displayName: 'HoldsList',

  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function () {
    return {
      bulkPickupLocation: null,
      bulkExpiryDate: null,
      modal: null,
      selectAll: false,
      selectedHold: null, // hold model being acted on. setting this puts the component into singular mode vs bulk mode
      cancelledHold: null, // index of hold that is being cancelled. used to insert success message into proper position in list
      selected: [], // ids of holds being acted on
      showActions: false,
      sortOrder: 'title',
      notify: null,
      alert: [],
      alertDetails: []
    };
  },

  componentDidMount: function () {
    var component, header;
    if (this.props.subset === 'pending') {
      component = $(React.findDOMNode(this.refs.affix));
      header = $(React.findDOMNode(this.refs.header));
      component.css({'width': header.width()});
      component.affix({
        offset: {
          top: component.offset().top
        }
      }).on('affix.bs.affix', function () {
        header.css({'height': header.height()});
      }).on('affix-top.bs.affix', function () {
        header.css({'height': 'auto'});
      });
    }
  },

  selectAll: function (event) {
    var selected = event.target.checked;
    this.setState({
      'selected': selected ? this.filteredHolds().map(function (hold) {
        return hold.id;
      }) : [],
      'selectAll': selected
    });
  },

  toggleSelected: function (id) {
    var selected = _.contains(this.state.selected, id) ? _.without(this.state.selected, id) : this.state.selected.concat(id);
    this.setState({
      'selected': selected,
      'selectAll': selected.length >= this.filteredHolds().length
    });
  },

  selectedHolds: function () {
    return this.state.selectedHold ?
      [this.state.selectedHold] :
      this.props.holds.selected(this.state.selected);
  },

  filteredHolds: function () {
    return this.props.holds.filtered(this.props.subset);
  },

  onSort: function (e) {
    this.setState({
      sortOrder: e.target.value,
      cancelledHold: null
    });
  },

  sortedHolds: function () {
    var sortOrder = this.state.sortOrder, date;
    return _.sortBy(this.filteredHolds(), function (hold) {
      if (sortOrder === 'expiration') {
        date = hold.get('expiration');
        return date ? date : Infinity;
      } else if (sortOrder === 'title') {
        return hold.get('item').sortableTitle;
      } else if (sortOrder === 'author') {
        return hold.get('item').author;
      } else if (sortOrder === 'position') {
        return hold.get('queuePosition');
      } else if (sortOrder === 'status') {
        return !hold.isActive();
      }
    });
  },

  toggleActions: function () {
    this.setState({'showActions': this.state.showActions ? false : true});
  },

  /* takes a collection of objects, an array of actedOn IDs and returns 2 arrays of success IDs and failure messages */
  collateErrors: function (params) {
    var res = {successes: params.actedOn || [], failures: []};
    _.each(params.results, function (hold) {
      if (params.actedOn && _.contains(params.actedOn, hold.id) && !hold.errors) {
        res.successes.push(hold.id);
      } else if ((!params.actedOn || _.contains(params.actedOn, hold.id)) && hold.errors) {
        res.failures.push(hold.item.title + ': ' + hold.errors.join(', '));
        res.successes = _.difference(res.successes, hold.id);
      }
    });
    res.successes = _.uniq(res.successes);
    return res;
  },

  clearErrors: function () {
    this.setState({
      notify: null,
      alert: [],
      alertDetails: []
    });
    this.props.holds.each(function (hold) {
      hold.unset('errors');
    });
  },

  hasNotification: function () {
    return (_.size(this.state.alert) || _.size(this.state.notify)) > 0;
  },

  fromPickupLocation: function () {
    var selected = this.state.selectedHold || this.props.holds.findWhere({id: this.state.selected[0]});
    return selected ? selected.get('pickupLocation') : {};
  },

  setPickupLocation: function (location) {
    this.setState({bulkPickupLocation: location});
  },

  setExpiryDate: function (date) {
    this.setState({bulkExpiryDate: date});
  },

  /* takes a set of singular and bulk actions as functions and performs the appropriate one, optionally takes successMessage and errorMessage */
  holdActions: function (options) {
    var component = this,
      successMessage = 'holds.' + (options.successMessage || 'success_message'),
      errorMessage = 'holds.' + (options.errorMessage || 'error_message');

    if (this.state.selectedHold && options.singular) {
      return options.singular.call(this, this.state.selectedHold).done(function () {
        if(!options.silent) { component.setState({notify: I18n.t(successMessage + '.this', options.context)}); }
      }).fail(function (errors) {
        if(!options.silent) { component.setState({alert: errors || I18n.t(errorMessage + '.this', options.context)}); }
      });
    } else if (options.bulk) {
      return options.bulk.call(this, this.state.selected).done(function (holds) {
        var results = component.collateErrors({actedOn: component.state.selected, results: holds});
        component.setState({
          notify: results.successes.length ? I18n.t(successMessage, _.defaults({count: results.successes.length}, options.context)) : null,
          alert: results.failures.length ? I18n.t(errorMessage, _.defaults({count: results.failures.length}, options.context)) : null,
          alertDetails: results.failures,
          selected: _.intersection(component.state.selected, _.pluck(holds, 'id'))
        });
      }).fail(function (message) {
        component.setState({alert: I18n.t('general_failure') + (_.isString(message) ? ': ' + message : '')});
      });
    }
  },

  cancelHolds: function () {
    var component = this;
    this.holdActions({
      singular: function (hold) {
        component.setState({
          cancelledHold: _.indexOf(component.sortedHolds(), component.state.selectedHold)
        });
        return hold.cancel();
      },
      bulk: function (ids) {
        return component.props.holds.cancel(ids);
      },
      successMessage: 'cancelled'
    }).fail(function () {
      component.setState({cancelledHold: null});
    });
    this.modalClose();
  },

  changePickupLocation: function () {
    var branch = app.json.branches[this.state.bulkPickupLocation];
    if (branch) {
      this.holdActions({
        singular: function (hold) {
          return hold.changePickupLocation(this.state.bulkPickupLocation);
        },
        bulk: function (ids) {
          return this.props.holds.changePickupLocation(ids, this.state.bulkPickupLocation);
        },
        successMessage: 'branch_change',
        context: {branch: branch.name}
      });
    } else {
      this.setState({alert: 'No branch selected'});
    }
    this.modalClose();
  },

  changeExpiryDate: function () {
    this.holdActions({
      singular: function (hold) {
        return hold.changeExpiryDate(this.state.bulkExpiryDate);
      },
      bulk: function (ids) {
        return this.props.holds.changeExpiryDate(ids, this.state.bulkExpiryDate);
      },
      successMessage: 'expiry_date'
    });
    this.modalClose();
  },

  toggleStatus: function (status) {
    this.changeStatus(status);
    this.modalClose();
  },

  changeStatus: function (status) {
    if (status === 'activate' || status === 'deactivate') {
      this.holdActions({
        silent: true,
        singular: function () {
          return this.state.selectedHold[status]();
        },
        bulk: function (ids) {
          return this.props.holds[status](ids);
        },
        successMessage: status === 'activate' ? 'activated' : 'deactivated'
      });
    }
  },

  initiateAction: function (action, hold) {
    this.clearErrors();
    this.setState({
      selectedHold: hold,
      cancelledHold: null
    }, function () {
      if (action === 'activate' || action === 'deactivate') {
        this.changeStatus(action);
      } else {
        this.modalOpen(action);
      }
    });
  },

  initiateBulkAction: function (action) {
    this.clearErrors();
    this.setState({
      selectedHold: null,
      cancelledHold: null
    });
    this.modalOpen(action);
  },

  modalOpen: function (target) {
    if (this.state.modal === null) {
      this.setState({modal: target});
      this.refs[target].open();
    }
  },

  modalClose: function () {
    if (this.state.modal !== null) {
      this.setState({modal: null, bulkPickupLocation: null});
      this.refs[this.state.modal].close();
    }
  },

  render: function () {
    var expiryDates = _.uniq(this.selectedHolds(), function (hold) {
        return hold.formatDate('expiration', 'long');
      }),
      pickupLocations = _.uniq(this.selectedHolds(), function (hold) {
        return hold.get('pickupLocation').name;
      }),
      homeBranch = null,
      holdsToolbar = '',
      lists = {
        ready: 'Ready for Pickup',
        transit: 'In Transit',
        pending: 'Still on Hold'
      };

    var branches = _.reduce(app.json.branches, function (memo, branch, code) {
      memo[code] = branch.name;
      return memo;
    }, {});

    var holdsList = _.map(this.sortedHolds(), function (hold, i) {
      return (
        <li data-id={hold.id} key={hold.id}>
          <HoldItem
            hold={hold} subset={this.props.subset}
            notify={this.state.selectedHold === hold ? this.state.notify : null}
            alert={this.state.selectedHold === hold ? this.state.alert : null}
            editable={this.state.showActions || this.state.selected.length > 0}
            selected={_.contains(this.state.selected, hold.id)}
            onSelect={this.toggleSelected}
            onAction={this.initiateAction}
            onDismiss={this.clearErrors}
            index={i} key={hold.id}/>
        </li>
      );
    }, this);

    // insert cancelled message into list at correct spot
    if (this.state.cancelledHold !== null) {
      holdsList.splice(this.state.cancelledHold, 0, (
        <li>
          <Notifications notify={this.state.notify} dismissable={true} onDismiss={this.clearErrors}/>
        </li>
      ));
    }

    if (this.props.subset === 'pending') {
      holdsToolbar = (
        <div className="page-header-affix" ref="header">
          <h2
            className="holds-title hidden-mobile">{(lists[this.props.subset] || this.props.subset) + ' (' + this.filteredHolds().length + ')'}</h2>

          <div className="page-header affix-top" ref="affix">
            <a href="/" className="page-back hidden-desktop">
              <h1 className="page-title">{this.props.subset ? I18n.t('holds.' + this.props.subset) : 'Holds'}
                ({this.filteredHolds().length})</h1>
            </a>

            <div className="page-toolbar">
              <div className="toolbar">
                <div className={classNames({ 'toolbar-select': true, 'hidden-mobile': !this.state.showActions })}>
                  <div className="checkbox">
                    <input type="checkbox" id={'select-all-' + this.props.subset} className="sr-only"
                           checked={this.state.selectAll} onChange={this.selectAll}/>
                    <label htmlFor={'select-all-' + this.props.subset} className="checkbox-display">Select all</label>
                  </div>
                </div>
                <div className="toolbar-edit hidden">
                  <button className="btn btn-text"
                          onClick={this.toggleActions}>{this.state.showActions ? 'Done' : 'Edit'}</button>
                </div>
                <div className="toolbar-sort">
                  <span className="sort-label hidden-mobile">Sort by </span>
                  <Dropdown value={this.state.sortOrder} onChange={this.onSort}>
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="position">Position</option>
                    <option value="status">Active/Inactive</option>
                    <option value="expiration">Expiry Date</option>
                  </Dropdown>
                </div>
              </div>
              <nav
                className={classNames({ tabs: true, hidden: !this.state.showActions && this.state.selected.length === 0 })}>
                <ul className="menu menu-horizontal tabs-menu">
                  <li>
                    <button className="menu-item icon icon-cancel"
                            onClick={_.partial(this.initiateBulkAction, 'cancel')}>Cancel holds
                    </button>
                  </li>
                  <li>
                    <button className="menu-item icon icon-location"
                            onClick={_.partial(this.initiateBulkAction, 'location')}>Pickup location
                    </button>
                  </li>
                  <li>
                    <button className="menu-item icon icon-calendar"
                            onClick={_.partial(this.initiateBulkAction, 'expiry')}>Expiry dates
                    </button>
                  </li>
                  <li>
                    <button className="menu-item icon icon-active" onClick={_.partial(this.toggleStatus, 'activate')}>
                      Make Active
                    </button>
                  </li>
                  <li>
                    <button className="menu-item icon icon-inactive"
                            onClick={_.partial(this.toggleStatus, 'deactivate')}>Make Inactive
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      );
    } else {
      holdsToolbar = (
        <div className="page-header">
          <a href="/" className="page-back hidden-desktop">
            <h1 className="page-title">{this.props.subset ? I18n.t('holds.' + this.props.subset) : 'Holds'}
              ({this.filteredHolds().length})</h1>
          </a>

          <h2
            className="holds-title hidden-mobile">{(lists[this.props.subset] || this.props.subset) + ' (' + this.filteredHolds().length + ')'}</h2>
        </div>
      );
    }

    if (this.filteredHolds().length === 0 && !this.hasNotification()) {
      return (
        <div className={'hidden-desktop'} key={this.props.key}>
          {holdsToolbar}
          <div className={'empty empty-page empty-holds-' + this.props.subset}>
            <p>Lorem ipsum</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className={'holds holds-' + this.props.subset} key={this.props.key}>

          {holdsToolbar}
          <Notifications
            notify={this.state.selectedHold ? null : this.state.notify}
            alert={this.state.selectedHold ? null : this.state.alert}
            dismissable={true}
            onDismiss={this.clearErrors}
            alertDetails={this.state.selectedHold ? null : this.state.alertDetails}/>


          <ul className="panels">
            {holdsList}
          </ul>

          <Modal ref="cancel" title="Cancel Holds" confirm="Yes, cancel hold" cancel="Don't cancel"
                 onConfirm={this.cancelHolds} onCancel={this.modalClose}>
            <p>Are you sure you want to cancel the
              following {this.selectedHolds().length > 1 ? (this.selectedHolds().length + ' holds') : ' hold'}?</p>
            <ul>
              {_.map(this.selectedHolds(), function (hold) {
                return <li key={hold.id}>{hold.get('item').title}</li>;
              }, this)}
            </ul>
          </Modal>

          <Modal ref="location" classes="location-modal" title="Change Pickup Location"
                 confirm="Change pickup location" cancel="Don't change" onConfirm={this.changePickupLocation}
                 onCancel={this.modalClose}>
            <p className="branch-label">Your current pickup location:</p>
            {
              (pickupLocations.length > 1) ?
                <div className="branch home-branch">
                  <h4 className="branch-name">Multiple pickup locations for selected holds</h4>
                </div> :
                <div className="branch home-branch">
                  <h4 className="branch-name">{this.fromPickupLocation().description}</h4>

                  <p className="branch-address">{this.fromPickupLocation().address}</p>
                </div>
            }
            <p className="autocomplete-label">Choose new pickup location:</p>
            <Autocomplete className="autocomplete" initialValue={this.state.bulkPickupLocation}
                          onOptionSelected={this.setPickupLocation} options={branches} noMatch="No matching branch"/>
          </Modal>

          <Modal ref="expiry" title="Change Hold Expiry Date" confirm="Save expiry date" cancel="Don't change"
                 onConfirm={this.changeExpiryDate} onCancel={this.modalClose}>
            <Datepicker label="Automatically cancel hold if not received by:"
                        placeholder={expiryDates.length === 1 ? expiryDates[0].formatDate('expiration', 'long') : 'Multiple dates selected. Choose a new date.'}
                        setExpiryDate={this.setExpiryDate} id="expiry-date"/>
          </Modal>

          <Modal ref="status" classes="status-modal" title="Change Status" onCancel={this.modalClose}>
            <div className="status-actions">
              <button className="btn btn-primary" onClick={_.partial(this.toggleStatus, 'activate')}>Make active
              </button>
              <button className="btn btn-primary" onClick={_.partial(this.toggleStatus, 'deactivate')}>Make inactive
              </button>
            </div>
          </Modal>
        </div>
      );
    }
  }
});
