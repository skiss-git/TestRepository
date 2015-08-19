import React from 'react/addons';
import $ from 'jquery';
import 'jquery.customSelect/jquery.customSelect.js';
import _ from 'underscore';

export default React.createClass({
  displayName: 'Dropdown',

  componentDidMount: function () {
    $(React.findDOMNode(this)).customSelect({
      customClass: 'sort'
    });
  },

  handleChange: function (e) {
    if (this.props.valueLink) {
      this.props.valueLink.requestChange(e.target.value);
    } else if (_.isFunction(this.props.onChange)) {
      this.props.onChange(e);
    }
  },

  render: function () {
    var value = this.props.valueLink ? this.props.valueLink.value : this.props.value,
      style = this.props.style ? this.props.style : 'btn sort-btn';
    return (
      <select value={value} className={style} onChange={this.handleChange}>
        {this.props.children}
      </select>
    );
  }

});
