import React from 'react/addons';
import $ from 'jquery';
import _ from 'underscore';
import 'bootstrap-sass/assets/javascripts/bootstrap/transition.js';
import 'bootstrap-sass/assets/javascripts/bootstrap/modal.js';

var ModalButton = React.createClass({
  displayName: 'ModalButton',
  render: function () {
    return <button className="btn" role="button" {...this.props}>{this.props.children}</button>;
  }
});
export {ModalButton};

export default React.createClass({
  displayName: 'Modal',

    getDefaultProps: function () {
      return {
        onCancel: function () {
          _.bind(this.close, this);
        }
      };
    },

    getInitialState: function () {
      return {
        isVisible: false
      };
    },

    componentDidMount: function () {
      var component = this,
        $this = $(React.findDOMNode(this));
      $this.modal({show: false});
      $this.on('hidden.bs.modal', function () {
        component.props.onCancel();
      });
    },

    close: function () {
      this.setState({'isVislble': false});
      $(React.findDOMNode(this)).modal('hide');
    },

    open: function () {
      this.setState({'isVisible': true});
      $(React.findDOMNode(this)).modal('show');
    },

    render: function () {

      var modalConfirm = null,
        modalCancel = null;

      if (this.props.confirm) {
        modalConfirm = (
          <ModalButton className={'btn btn-secondary' + (this.props.disabled ? ' disabled' : '')}
                       onClick={this.handleConfirm}>{this.props.confirm}</ModalButton>
        );
      }

      if (this.props.cancel) {
        modalCancel = (
          <ModalButton className={'btn btn-base' + (this.props.disabled ? ' disabled' : '')}
                       onClick={this.handleCancel}>{this.props.cancel}</ModalButton>
        );
      }

      if (this.state.isVisible === true) {
        return (
          <div className={'modal fade ' + (this.props.classes || '')}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">
                    {this.props.title}
                  </h4>
                  <button className="close" onClick={this.handleCancel}>&times;</button>
                </div>
                <div className="modal-body">
                  {this.props.children}
                </div>
                <div className="modal-footer">
                  {modalCancel}
                  {modalConfirm}
                </div>
              </div>
            </div>
          </div>
        );
      }

      return <div className="modal fade"></div>;
    },

    handleCancel: function () {
      if (this.props.onCancel) {
        this.props.onCancel();
      }
    },

    handleConfirm: function () {
      if (this.props.onConfirm) {
        this.props.onConfirm();
      }
    }

  });
