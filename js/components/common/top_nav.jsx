import I18n from '../../i18n/i18n.js';
import React from 'react/addons';

export default React.createClass({
  displayName: 'TopNav',
  render: function () {
    var currentUser = this.props.currentUser;

    return <div className="container">
      <h2 className="account-menu-title">Account</h2>
      <nav role="navigation" id="toolbar">
        <ul className="menu menu-horizontal account-menu">
          <li><a href="/" className={'menu-item first' + (this.props.page === '' ? ' active' : '')}>Summary</a></li>
          <li>
            <a href="/checkouts" className={'menu-item' + (this.props.page === 'checkouts' ? ' active' : '')}>
              Checkouts ({ currentUser.numberOfCheckouts() })
            </a>
          </li>
          <li>
            <a href="/holds" className={'menu-item' + (this.props.page === 'holds' ? ' active' : '')}>
              Holds ({ currentUser.numberOfHolds() })
            </a>
          </li>
          <li>
            <a href="/charges" className={'menu-item' + (this.props.page === 'charges' ? ' active' : '')}>
              Charges ({ I18n.toCurrency(currentUser.estimatedCharges()) })
            </a>
          </li>
          <li className="float-right">
            <a href="/settings" className={'menu-item last' + (this.props.page === 'settings' ? ' active' : '')}>
              <i className="icon-settings"></i>Account Settings
            </a>
          </li>
        </ul>
      </nav>
    </div>;
  }
});
