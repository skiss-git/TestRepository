import React from 'react/addons';
import _ from 'underscore';

export default React.createClass({
  displayName: 'Notifications',

  getInitialState: function () {
    return {
      detailsRevealed: false
    };
  },

  getDefaultProps: function () {
    return {
      notify: '',
      alert: '',
      alertDetails: ''
    };
  },

  shouldDisplay: function () {
    return _.size(this.props.alert) || _.size(this.props.notify);
  },

  render: function () {

    var notify, alert, alertDetails;

    if (_.size(this.props.alertDetails)) {
      alertDetails = (
        <div className="failures">
          <button onClick={this.toggleDetails} className="btn-link">More Info</button>
          {this.state.detailsRevealed ?
            <ul className="failure-list">{_.map(this.props.alertDetails, function (message) {
              return <li>{message}</li>;
            })}</ul>
            :
            null
          }
        </div>
      );
    }

    if (_.size(this.props.notify)) {
      notify = (
        <div className="alert-success">
          {(_.isArray(this.props.notify) && this.props.notify.length > 1) ?
            <ul className="list-embedded success-message">{_.map(this.props.notify, function (message) {
              return <li>{message}</li>;
            })}</ul>
            :
            <p className="success-message">{this.props.notify}</p>
          }
        </div>
      );
    }

    if (_.size(this.props.alert)) {
      alert = (
        <div className="alert-failure">
          {(_.isArray(this.props.alert) && this.props.alert.length > 1) ?
            <ul className="list-embedded failure-message">{_.map(this.props.alert, function (message) {
              return <li>{message}</li>;
            })}</ul>
            :
            <p className="failure-message">{this.props.alert}</p>
          }
          {alertDetails}
        </div>
      );
    }

    if (this.shouldDisplay()) {
      return (
        <div className="alert">
          { this.props.dismissable ? <button className="close" onClick={this.props.onDismiss}>X</button> : null }
          {notify}
          {alert}
        </div>
      );
    } else {
      return <div/>;
    }
  },

  toggleDetails: function () {
    this.setState({detailsRevealed: !this.state.detailsRevealed});
  }
});
