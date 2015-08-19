import React from 'react/addons';
import app from '../../app.jsx';

export default React.createClass({
  displayName: 'Collapse',
  getInitialState: function () {
    return {
      collapsed: true
    };
  },

  render: function () {
    return (
      <div className="meta-collapse">
        <button className="btn-link meta-expand hidden-desktop" data-toggle="collapse"
                data-target={'#panel-meta-' + this.props.id}
                onClick={this.collapse}>{this.state.collapsed ? 'Show more details' : 'Hide details'}</button>
        <ul className={'list-embedded collapse' + (app.viewport === 'mobile' ? '' : ' in')}
            id={'panel-meta-' + this.props.id}>
          {this.props.children}
        </ul>
      </div>
    );
  },

  collapse: function () {
    // $(this.getDOMNode()).collapse();
    this.setState({
      collapsed: this.state.collapsed ? false : true
    });
  }

});
