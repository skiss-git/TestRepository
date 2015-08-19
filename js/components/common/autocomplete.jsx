import React from 'react/addons';
import $ from 'jquery';
import _ from 'underscore';

export default React.createClass({
  displayName: 'Autocomplete',

  propTypes: {
    options: React.PropTypes.object,
    initialValue: React.PropTypes.string,
    noMatch: React.PropTypes.string,
    onKeyUp: React.PropTypes.func,
    onOptionSelected: React.PropTypes.func,
    id: React.PropTypes.string,
    className: React.PropTypes.string,
    style: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      options: [],
      value: '',
      onKeyUp: function () {
      },
      onOptionSelected: function () {
      }
    };
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue,
      open: false,
      matches: null
    };
  },

  componentDidMount: function () {
    this.checkSize();
  },

  checkSize: function () {
    var el = $(React.findDOMNode(this));
    this.setState({
      position: {
        left: el.position().left,
        top: el.position().top + el.outerHeight()
      },
      width: el.find('input').outerWidth()
    });
  },

  change: function (e) {
    this.checkSize();
    var matches = {};
    _.each(this.props.options, function (option, key) {
      if (option.match(new RegExp(e.target.value, 'i'))) {
        matches[key] = option;
      }
    });

    this.setState({
      value: e.target.value,
      matches: matches,
      open: e.target.value.length > 0,
      selectedIndex: _.isEmpty(matches) ? null : 0
    });
  },

  keyDown: function (e) {
    // Esc
    if (e.keyCode === 27) {
      this.setState({open: false});
      return false;
    }
    // Enter
    if (e.keyCode === 13 || e.keyCode === 9) {
      if (this.state.open && this.state.selectedIndex !== undefined && !_.isEmpty(this.state.matches)) {
        var value = _.keys(this.state.matches)[this.state.selectedIndex];

        this.selectOption(value);
        return false;
      }
    }
    // Down
    if (e.keyCode === 40) {
      this.selectIndex(this.state.selectedIndex + 1);
      return false;
    }
    // Up
    if (e.keyCode === 38) {
      this.selectIndex(this.state.selectedIndex - 1);
      return false;
    }
    return true;
  },

  selectIndex: function (index) {
    this.setState({selectedIndex: Math.min(_.size(this.state.matches) - 1, Math.max(0, index))});
  },

  selectOption: function (option) {
    this.setState({
      value: this.props.options[option],
      open: false
    });

    this.props.onOptionSelected(option);
  },

  render: function () {
    return (
      <div className={this.props.className + (_.isEmpty(this.state.matches) && this.state.value ? ' none' : '')}>
        <input
          value={this.state.value}
          onKeyDown={this.keyDown}
          onChange={this.change}
          id={this.props.id}
          type="text"
          style={this.props.style}
          placeholder="Branch name (e.g. North York Central Library)"/>
        {
          this.state.open ?
            <AutocompleteList
              list={this.state.matches}
              value={this.state.value}
              position={this.state.position}
              width={this.state.width}
              noMatch={this.props.noMatch}
              selectedIndex={this.state.selectedIndex}
              onOptionSelected={this.selectOption}
              onOptionHilited={this.selectIndex}/>
            : null
        }
      </div>
    );
  }

});


var AutocompleteList = React.createClass({
  displayName: 'AutocompleteList',
  handleClick: function (option) {
    var component = this;
    return function () {
      component.props.onOptionSelected(option);
    };
  },

  handleHover: function (index) {
    var component = this;
    return function () {
      component.props.onOptionHilited(index);
    };
  },

  render: function () {
    if (this.props.list === null) {
      return false;
    }

    var style = {
      position: 'absolute',
      zIndex: 1,
      left: this.props.position.left,
      top: this.props.position.top,
      width: this.props.width
    };

    if (_.isEmpty(this.props.list)) {
      return <ul className="autocomplete-results" style={style}>
        <li className="autocomplete-result">{this.props.noMatch}</li>
      </ul>;
    } else {
      var re = new RegExp('(' + this.props.value + ')', 'gi');
      return (
        <ul className="autocomplete-results" style={style}>
          {_.map(_.keys(this.props.list), function (option, i) {
            return (
              <li key={i}
                  onClick={this.handleClick(option)}
                  onMouseOver={this.handleHover(i)}
                  className={'autocomplete-result' + (i === this.props.selectedIndex ? ' selected' : '')}>

                {_.map(this.props.list[option].split(re), function (s) {
                  return s.match(re) ? <span className="hilite">{s.match(re)[0]}</span> : s;
                })}

              </li>
            );
          }, this)}
        </ul>
      );
    }
  }
});
export {AutocompleteList};
