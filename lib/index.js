'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactObjectInspector = require('react-object-inspector');

var _reactObjectInspector2 = _interopRequireDefault(_reactObjectInspector);

require('style!css!react-object-inspector/react-object-inspector.css');

var _debugPopupHost = undefined;
var _debugPopupWrapper = undefined;

var _enabled = false;

function init(config) {
  if (_debugPopupHost) {
    return;
  }

  var DebugPopupHost = (function (_React$Component) {
    _inherits(DebugPopupHost, _React$Component);

    function DebugPopupHost(props) {
      var _this = this;

      _classCallCheck(this, DebugPopupHost);

      _get(Object.getPrototypeOf(DebugPopupHost.prototype), 'constructor', this).call(this, props);

      this.handleCloseClick = function () {
        _this.setState({ isShown: false });
      };

      this.handlePinClick = function () {
        _this.setState({
          isShown: !_this.state.isShown || _this.state.components[0] !== _this.state.shownComponent,
          shownComponent: _this.state.components[0]
        });
      };

      var nullComponent = {
        pinPos: { left: -1000, top: -1000 },
        component: null
      };

      this.state = {
        components: [nullComponent],
        isShown: false,
        shownComponent: nullComponent
      };
    }

    _createClass(DebugPopupHost, [{
      key: 'render',
      value: function render() {
        var pinPos = this.state.components[0].pinPos;

        var pinStyle = {
          position: 'absolute',
          backgroundColor: '#FFFF33',
          width: '16px',
          height: '16px',
          left: pinPos.left + 'px',
          top: pinPos.top + 'px',
          borderRadius: '100px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          pointerEvents: 'auto',
          cursor: 'pointer'
        };

        var wrapperStyle = {
          position: 'absolute',
          zIndex: '999999999',
          top: 0,
          left: 0,
          width: this.state.isShown ? '100%' : 0,
          pointerEvents: 'none'
        };

        var inspectStyle = {
          position: 'fixed',
          top: 0,
          left: this.state.isShown ? 0 : -window.innerWidth / 3,
          bottom: 0,
          width: '30%',
          backgroundColor: '#FAFAFA',
          pointerEvents: 'auto',
          overflowY: 'auto',
          boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
          padding: '10px',
          transition: 'left 0.15s ease-out'
        };

        var closeStyle = {
          position: 'absolute',
          top: '15px',
          right: '15px',
          cursor: 'pointer'
        };

        return _react2['default'].createElement(
          'div',
          { style: wrapperStyle },
          _react2['default'].createElement(
            'div',
            { style: inspectStyle },
            _react2['default'].createElement(
              'div',
              { style: closeStyle, onClick: this.handleCloseClick },
              '×'
            ),
            this.state.isShown && this.renderPanels()
          ),
          _react2['default'].createElement('div', { style: pinStyle,
            onClick: this.handlePinClick,
            ref: 'pin' })
        );
      }
    }, {
      key: 'renderPanels',
      value: function renderPanels() {
        var _this2 = this;

        var getPanels = this.props.getPanels;

        var panels = getPanels([{ name: 'props', getData: function getData(c) {
            return c.props;
          } }, { name: 'state', getData: function getData(c) {
            return c.state;
          } }, { name: 'context', getData: function getData(c) {
            return c.context;
          } }]);

        return _react2['default'].createElement(
          'div',
          null,
          panels.map(function (panel, idx) {
            return _react2['default'].createElement(
              'div',
              { key: panel.name + idx },
              _react2['default'].createElement(
                'h6',
                null,
                panel.name
              ),
              _react2['default'].createElement(_reactObjectInspector2['default'], { data: panel.getData(_this2.state.shownComponent.component) })
            );
          })
        );
      }
    }, {
      key: 'addComponent',
      value: function addComponent(component, pinPos) {
        this.setState({ components: [{
            component: component,
            pinPos: pinPos
          }].concat(_toConsumableArray(this.state.components)) });
      }
    }, {
      key: 'removeComponent',
      value: function removeComponent(component) {
        this.setState({ components: this.state.components.filter(function (c) {
            return c.component !== component;
          }) });
      }
    }, {
      key: 'getPinElement',
      value: function getPinElement() {
        return _react2['default'].findDOMNode(this.refs.pin);
      }
    }], [{
      key: 'defaultProps',
      value: {
        getPanels: function getPanels(panels) {
          return panels;
        }
      },
      enumerable: true
    }]);

    return DebugPopupHost;
  })(_react2['default'].Component);

  _debugPopupWrapper = document.createElement('div');
  document.body.appendChild(_debugPopupWrapper);

  _debugPopupHost = _react2['default'].render(_react2['default'].createElement(DebugPopupHost, { getPanels: config.getPanels }), _debugPopupWrapper);
}

function deinit() {
  if (_debugPopupWrapper) {
    _react2['default'].unmountComponentAtNode(_debugPopupWrapper);
    document.body.removeChild(_debugPopupWrapper);
    _debugPopupWrapper = null;
  }
  _debugPopupHost = null;
}

var triggerCalled = false;

exports['default'] = function (options) {
  var config = options.imports[0];

  var enabledTrigger = config.enabledTrigger || function (cb) {
    return cb(true);
  };

  function enter(e) {
    if (!_enabled) return;
    var rect = e.target.getBoundingClientRect();
    _debugPopupHost.addComponent(this, {
      left: rect.right + window.scrollX - 24,
      top: rect.top + window.scrollY + 8
    });
  }

  function leave(e) {
    if (!_enabled) return;
    if (e.toElement === _debugPopupHost.getPinElement()) {
      return;
    }
    _debugPopupHost.removeComponent(this);
  }

  function bindMouseEvents(componentClass) {
    if (componentClass.__debugInspectorBound__) return;
    componentClass.__debugInspectorBound__ = true;

    var _didMount = componentClass.prototype.componentDidMount;
    componentClass.prototype.componentDidMount = function () {
      if (_didMount) {
        _didMount.call(this);
      }

      if (!this.boundEnter) {
        this.boundEnter = enter.bind(this);
        this.boundLeave = leave.bind(this);
      }

      var el = _react2['default'].findDOMNode(this);
      el.addEventListener('mouseenter', this.boundEnter);
      el.addEventListener('mouseleave', this.boundLeave);
    };

    var _willUnmount = componentClass.prototype.componentWillUnmount;
    componentClass.prototype.componentWillUnmount = function () {
      if (_willUnmount) {
        _willUnmount.call(this);
      }

      var el = _react2['default'].findDOMNode(this);
      el.removeEventListener('mouseenter', this.boundEnter);
      el.removeEventListener('mouseleave', this.boundLeave);
    };
  }

  if (!triggerCalled) {
    enabledTrigger(function (enabled) {
      _enabled = enabled;
      if (enabled) {
        init(config);
      } else {
        deinit();
      }
    });
    triggerCalled = true;
  }

  return function (componentClass) {
    bindMouseEvents(componentClass);

    return componentClass;
  };
};

module.exports = exports['default'];