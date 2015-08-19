import React from 'react/addons';
import BackboneCollection from '../mixins/backbone_collection.js';
import TopNav from './common/top_nav.jsx';
import HoldsPage from './holds/holds_page.jsx';
import CheckoutList from './checkouts/checkout_list.jsx';
import ChargesList from './charges/charges_list.jsx';
import Summary from './summary.jsx';
import Settings from './settings.jsx';

export default React.createClass({

  displayName: 'YourAccount',

  mixins: [BackboneCollection],

  componentWillMount: function () {
    this.subscribeTo(this.props.currentUser);
    this.subscribeTo(this.props.holds);
    this.subscribeTo(this.props.checkouts);
    this.subscribeTo(this.props.charges);
  },

  getInitialState: function () {
    return {
      page: ''
    };
  },

  pageComponent: function () {
    var currentUser = this.props.currentUser;

    if (this.state.page === '') {
      return <Summary currentUser={currentUser} holds={this.props.holds} checkouts={this.props.checkouts}/>;
    }
    if (this.state.page.substr(0, 5) === 'holds') {
      return (<HoldsPage ref="holds" currentUser={currentUser} holds={this.props.holds}
                        subset={this.state.page.substr(6)}/>);
    }
    if (this.state.page === 'checkouts') {
      return <CheckoutList checkouts={this.props.checkouts}/>;
    }
    if (this.state.page === 'charges') {
      return <ChargesList currentUser={currentUser} charges={this.props.charges}/>;
    }
    if (this.state.page === 'settings') {
      return <Settings currentUser={currentUser}/>;
    }
  },

  render: function () {

    var currentUser = this.props.currentUser;

    return (
      <div>
        <div className="site-account hidden-mobile">
          <TopNav currentUser={currentUser} page={this.state.page}/>
        </div>
        <main className="site-content" role="main">
          {this.pageComponent()}
        </main>
      </div>
    );
  }
});
