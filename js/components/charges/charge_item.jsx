import I18n from '../../i18n/i18n.js';
import React from 'react/addons';
import BackboneCollection from '../../mixins/backbone_collection.js';

export default React.createClass({
  displayName: 'ChargeItem',
  mixins: [React.addons.LinkedStateMixin, BackboneCollection],

  render: function () {
    var charge = this.props.charge.attributes,
      chargeItem = null;
    //title = this.props.charge.get('item') ? (charge.item.title).replace(/.{70}\S*\s+/g, "$&@").split(/\s+@/) : '';

    if (charge.item) {
      chargeItem = (
        <div className="item charge-item">
          <div className="item-header">
            <img src={charge.item.cover.url} alt="" className="item-image" onLoad={this.removeIfTransparent}/>
            <h4 className="item-title">{charge.item.title}</h4>
          </div>
          <div className="item-body">
            {charge.item.author ? <p className="item-author">{charge.item.author}</p> : null}
            <p className="item-type">{charge.item.format.type}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="charge">
        <div className={'panel charge-panel'}>
          <div className="panel-content">
            <div className="charge-header">
              <h3 className="charge-title">{charge.chargeInfo.description}</h3>

              <p className="charge-date">Date billed: {this.props.charge.formatDate('billDate', 'long')}</p>
            </div>
            {chargeItem}
          </div>
          <div className="panel-meta">
            Amount: <strong>{I18n.toCurrency(charge.chargeInfo.amount)}</strong>
          </div>
        </div>
      </div>
    );
  }

});
