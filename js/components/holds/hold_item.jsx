import $ from 'jquery';
import React from 'react/addons';
import _ from 'underscore';
import HoldStatus from './hold_status.jsx';
import Toggle from '../common/toggle.jsx';
import Notifications from '../common/notifications.jsx';
import classNames from 'classnames';

export default React.createClass({
  displayName: 'HoldItem',

  propTypes: {
    alert: React.PropTypes.arrayOf(React.PropTypes.string)
  },

  getInitialState: function () {
    return {
      alert: [],
      isCollapsed: false
    };
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

  onCollapse: function () {
    this.setState({'isCollapsed': (this.state.isCollapsed ? false : true)}, null);
  },

  onSelect: function () {
    this.props.onSelect(this.props.hold.id);
  },

  render: function () {
    var hold = this.props.hold.attributes,
      expiryDate = null,
      daysRemaining = this.props.hold.daysRemaining('readyDateExpiration'),
      titleBreakpoint = (hold.item.title).indexOf(' ', 50),
      mobileTitle = titleBreakpoint > 0 ? (hold.item.title).substring(0, titleBreakpoint) : hold.item.title,
      desktopTitle = titleBreakpoint > 0 ? (hold.item.title).substring(titleBreakpoint) : null;

    var panelClasses = classNames({
      panel: true,
      'hold-panel': true,
      'has-position': hold.queuePosition,
      'has-status': !hold.queuePosition && this.props.hold.timeUntil('readyDateExpiration') && this.props.hold.timeUntil('readyDateExpiration') < 10,
      'has-countdown': daysRemaining
    });

    if (hold.readyDateExpiration) {
      expiryDate = <li>Expires <strong>{this.props.hold.formatDate('readyDateExpiration', 'short')}</strong></li>;
    } else if (hold.expiration) {
      expiryDate = <li>Expires: <strong>{
        this.props.editable ?
          this.props.hold.formatDate('expiration', 'long') :
          <button className="btn-link" role="button"
                  onClick={_.partial(this.props.onAction, 'expiry', this.props.hold)}>{this.props.hold.formatDate('expiration', 'long')}</button>
      }</strong></li>;
    }

    // Ready (Ready for Pickup)
    if (this.props.hold.type() === 'ready') {
      return (
        <div className="hold ready-hold">
          <Notifications notify={this.props.notify} alert={this.props.alert} dismissable={true}
                         onDismiss={this.props.onDismiss}/>

          <div className={panelClasses}>
            <div className="panel-content">
              <div className="item">
                <div className="checkbox-display item-header">
                  <img src={hold.item.cover.url} alt="" className="item-image" onLoad={this.removeIfTransparent}/>

                  <h3 className="item-title">{[mobileTitle, desktopTitle ?
                    <span key={hold.id + '-title'}><span className="hidden-desktop">...</span><span
                      className="hidden-mobile">{' ' + desktopTitle}</span></span> : null]}
                    </h3>
                </div>
                <div className="item-body">
                  {hold.item.author ? <p className="item-author">{hold.item.author}</p> : null}
                  <p className="item-type">{hold.item.format.type}</p>
                  <a href={hold.item.url}>View item details</a>
                </div>
              </div>
            </div>
            <div className="panel-meta">
              <div className="panel-status">
                <div className="status status-danger">
                  <strong>{daysRemaining === 0 ? 'Last day to pick up' : daysRemaining > 1 ? daysRemaining + ' days left' : daysRemaining + ' day left'}</strong>
                </div>
              </div>
              <div className={classNames({ meta: true, 'is-editable': this.props.editable })}>
                <ul className="meta-list list-embedded">
                  <li>Pick up at: <strong><a className="btn-link"
                                             href={hold.pickupLocation.url}>{hold.pickupLocation.description}</a></strong>
                  </li>
                  {expiryDate}
                </ul>
                {this.props.editable ? null : <button className="btn-link meta-cancel"
                                                      onClick={_.partial(this.props.onAction, 'cancel', this.props.hold)}>
                  Cancel hold</button>}
              </div>
            </div>
          </div>
        </div>
      );
    }
    // Pending (Transit)
    else if (this.props.hold.type() === 'transit') {
      return (
        <div className="hold transit-hold">
          <Notifications notify={this.props.notify} alert={this.props.alert} dismissable={true}
                         onDismiss={this.props.onDismiss}/>

          <div className={panelClasses}>
            <div className="panel-content">
              <div className="item">
                <div className="checkbox-display item-header">
                  <img src={hold.item.cover.url} alt="" className="item-image" onLoad={this.removeIfTransparent}/>

                  <h3 className="item-title">{[mobileTitle, desktopTitle ?
                    <span><span className="hidden-desktop">...</span><span
                      className="hidden-mobile">{' ' + desktopTitle}</span></span> : null]}</h3>
                </div>
                <div className="item-body">
                  {hold.item.author ? <p className="item-author">{hold.item.author}</p> : null}
                  <p className="item-type">{hold.item.format.type}</p>
                  <a href={hold.item.url}>View item details</a>
                </div>
              </div>
            </div>
            <div className="panel-meta">
              <div className="panel-status">
                <div className="status">
                  <strong>In Transit</strong>
                </div>
              </div>
              <div className={'meta' + (this.props.editable ? ' is-editable' : '')}>
                <ul className="meta-list list-embedded">
                  <li>Pick up at: <strong><a className="btn-link"
                                             href={hold.pickupLocation.url}>{hold.pickupLocation.description}</a></strong>
                  </li>
                  {expiryDate}
                </ul>
                <button className="btn-link meta-cancel" value="cancel"
                        onClick={_.partial(this.props.onAction, 'cancel', this.props.hold)}>Cancel hold
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="hold pending-hold">
        <Notifications notify={this.props.notify} alert={this.props.alert} dismissable={true}
                       onDismiss={this.props.onDismiss}/>

        <div className={panelClasses}>
          <div className="panel-content">
            <div className={'item is-editable' + (this.props.editable ? ' is-editable' : '')}>
              <div className="item-checkbox checkbox">
                <input type="checkbox" id={'item_' + hold.id} className="sr-only" checked={this.props.selected}
                       onChange={this.onSelect}/>
                <label htmlFor={'item_' + hold.id} className="checkbox-display item-header">
                  <img src={hold.item.cover.url} alt="" className="item-image" onLoad={this.removeIfTransparent}/>

                  <h3 className="item-title">{[mobileTitle, desktopTitle ?
                    <span><span className="hidden-desktop">...</span><span
                      className="hidden-mobile">{' ' + desktopTitle}</span></span> : null]}</h3>
                </label>
              </div>
              <div className="item-body">
                {hold.item.author ? <p className="item-author">{hold.item.author}</p> : null}
                <p className="item-type">{hold.item.format.type}</p>
                <a href={hold.item.url}>View item details</a>
              </div>
            </div>
          </div>
          <div className="panel-meta">
            <HoldStatus hold={this.props.hold} onAction={this.props.onAction} editable={this.props.editable}/>

            <div className={classNames({ meta: true, 'is-editable': this.props.editable })}>
              <ul className="meta-list list-embedded">
                <li>Pick up at: <strong>{this.props.editable ? hold.pickupLocation.description :
                  <a className="btn-link" role="button"
                     onClick={_.partial(this.props.onAction, 'location', this.props.hold)}>{hold.pickupLocation.description}</a>}</strong>
                </li>
                {expiryDate}
                <li>Hold Status: <strong>{this.props.editable ? hold.pickupLocation.description :
                  <a className="btn-link" role="button"
                     onClick={_.partial(this.props.onAction, (this.props.hold.isActive() ? 'deactivate' : 'activate'), this.props.hold)}>{(this.props.hold.isActive() ? 'Active' : 'Inactive')}</a>}</strong>
                </li>
              </ul>
              {this.props.editable ? null : <button className="btn-link meta-cancel"
                                                    onClick={_.partial(this.props.onAction, 'cancel', this.props.hold)}>
                Cancel hold</button>}
            </div>
          </div>
        </div>
      </div>
    );

  }
});
