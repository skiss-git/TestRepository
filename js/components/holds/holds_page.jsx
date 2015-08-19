import React from 'react/addons';
import _ from 'underscore';
import HoldsList from './holds_list.jsx';

export default React.createClass({
  displayName: 'HoldsPage',

    mixins: [React.addons.LinkedStateMixin],

    componentDidMount: function () {
      // scroll to top of page
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    },

    componentWillMount: function () {
      var component = this;
      this.setState({transitioning: true});
      this.props.holds.ensurePopulated(function () {
        component.setState({transitioning: false});
      });
    },

    render: function () {

      var holds = this.props.holds,
        holdsLists = [],
        lists = ['ready', 'transit', 'pending'];

      if (this.state.transitioning) {
        return (
          <div className="preload-backdrop">
            <p className="preload-body">Loading holds...</p>
            <i className="icon icon-preload"></i>
          </div>
        );
      }

      if (!this.props.subset) {
        _.each(lists, function (type, id) {
          holdsLists.push(
            <HoldsList ref={'holds_' + type} holds={holds} subset={type} key={id}/>
          );
        });
      } else {
        holdsLists.push(
          <HoldsList ref="" holds={holds} subset={this.props.subset} key={0}/>
        );
      }

      return (
        <div className="page holds-page">
          <div className="page-content">
            {holdsLists}
          </div>
        </div>
      );
    }
  });
