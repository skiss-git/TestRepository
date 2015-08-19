import React from 'react/addons';
import app from '../../app.jsx';
import $ from 'jquery';
import moment from 'moment';
import 'bootstrap-datepicker/dist/js/bootstrap-datepicker.js';

export default React.createClass({
  displayName: 'Datepicker',
  componentDidMount: function () {
    var component = this;
    if (app.viewport === 'desktop') {
      $(React.findDOMNode(this.refs.divDatepicker)).datepicker({
        autoclose: true,
        format: 'D d M yyyy',
        startDate: '+1d',
        endDate: '+2y'
      }).on('changeDate', function (event) {
        component.props.setExpiryDate(event.date);
      });
    } else {
      // TODO: could use modernizr to confirm support???
      $(React.findDOMNode(this.refs.inputDatepicker)).attr('type', 'date');
      $(React.findDOMNode(this.refs.inputDatepicker)).on('blur', function (event) {
        component.props.setExpiryDate(moment(event.timeStamp).format('ddd D MMM YYYY'));
      });
    }
  },

  render: function () {
    return (
      <div className="form-group datepicker-form">
        <label className="form-label" htmlFor={'datepicker-' + this.props.id}>{this.props.label}</label>

        <div className="input-append date" ref="divDatepicker">
          <input type="text" ref="inputDatepicker" id={'datepicker-' + this.props.id}
                 className="form-control datepicker-input" placeholder={this.props.placeholder}/>
          <button className="btn btn-primary datepicker-btn add-on" ref="buttonDatepicker">Date</button>
        </div>
      </div>
    );
  }

});
