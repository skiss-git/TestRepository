import React from 'react/addons';
import _ from 'underscore';
import Toggle from '../common/toggle.jsx';

export default React.createClass({
  displayName: 'HoldStatus',

  render: function () {
    var hold = this.props.hold.attributes,
      status = null;

    if (this.props.hold.type() === 'pending') {
      if (hold.queuePosition) {
        status = (
          <div className={'status ' + (this.props.hold.isActive() ? 'status-active' : 'status-base')}>
            <p className="position"><strong
              className="position-queue">Position {hold.queuePosition + ' of ' + hold.queueLength}</strong><span
              className="position-copies">{' (' + hold.item.circulatingCopies + ' copies)'}</span></p>
          </div>
        );
      } else {
        status = (
          <div className={'status ' + (this.props.hold.isActive() ? 'status-active' : 'status-base')}>
            <p className="position"><strong className="position-queue">On Order</strong><span
              className="position-copies">{' (' + hold.item.circulatingCopies + ' copies)'}</span></p>

            <div className="status-toggle hidden-mobile">
              <Toggle
                checked={this.props.hold.isActive()}
                disabled={this.props.editable}
                id={hold.id}
                onChange={_.partial(this.props.onAction, this.props.hold.isActive() ? 'deactivate' : 'activate', this.props.hold)}
                />
            </div>
          </div>
        );
      }
    } else if (this.props.hold.pickupSoon()) {
      status = (
        <div className="status status-danger">
          <div className="status-message">Pickup Soon</div>
        </div>
      );
    }
    return (status ? <div className="panel-status">{status}</div> : <div className="panel-status no-status"></div>);
  },

  toggleActive: function (active) {
    this.props.hold[active ? 'activate' : 'deactivate']();
  }

});
