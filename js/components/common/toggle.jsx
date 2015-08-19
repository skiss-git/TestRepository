import React from 'react/addons';

export default React.createClass({

    getDefaultProps: function () {
      return {checked: false};
    },

    render: function () {
      return (
        <div className="toggle">
          <input type="checkbox" id={'toggle_checked_' + this.props.id} className="sr-only"
                 checked={this.props.checked ? true : false} disabled={this.props.disabled ? 'disabled' : ''}
                 onChange={this.toggle}/>
          <label className="toggle-display" htmlFor={'toggle_checked_' + this.props.id}>
            {(this.props.checked ? 'Active' : 'Inactive')}
          </label>
        </div>
      );
    },

    toggle: function () {
      this.props.onChange(!this.props.checked);
    }

  });
