import React from 'react';
import ObjectInspector from '@alexkuz/react-object-inspector';
import Dock from 'react-dock';

let _debugPopupHost;
let _debugPopupWrapper;

let _enabled = false;

function init(config) {
  if (_debugPopupHost) {
    return;
  }

  class DebugPopupHost extends React.Component {
    constructor(props) {
      super(props);
      const nullComponent = {
        pinRect: { left: -10000, right: -10000, top: -1000 },
        component: null
      };

      this.state = {
        components: [nullComponent],
        isVisible: false,
        shownComponent: nullComponent,
        position: 'left'
      };
    }

    render() {
      const { position, components: [{ pinRect }] } = this.state;

      const pinStyle = {
        position: 'absolute',
        backgroundColor: '#FFFF33',
        width: '16px',
        height: '16px',
        left: (position === 'left' ?
          (pinRect.right + window.scrollX - 24) + 'px' :
          (pinRect.left + window.scrollX + 8) + 'px'
        ),
        top: (pinRect.top + window.scrollY + 8) + 'px',
        borderRadius: '100px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        pointerEvents: 'auto',
        cursor: 'pointer'
      };

      const wrapperStyle = {
        position: 'absolute',
        zIndex: '999999999',
        top: 0,
        left: 0,
        width: 0,
        height: 0
      };

      const bittonsStyle = {
        position: 'absolute',
        top: '15px',
        right: '15px',
        cursor: 'pointer',
        lineHeight: '15px'
      };

      return (
        <div style={wrapperStyle}>
          <Dock isVisible={this.state.isVisible}
                position={this.state.position}
                onVisibleChanged={isVisible => this.setState({ isVisible })}
                dimMode='none'>
            <div style={bittonsStyle}>
              <span onClick={this.handleLeftClick}>
                {'\u21E4'}
              </span>
              <span onClick={this.handleRightClick} style={{ marginLeft: '10px' }}>
                {'\u21E5'}
              </span>
              <span onClick={this.handleCloseClick} style={{ marginLeft: '10px' }}>
                ×
              </span>
            </div>
            {this.state.isVisible && this.renderPanels()}
          </Dock>
          <div style={pinStyle}
               onClick={this.handlePinClick}
               ref='pin' />
        </div>
      );
    }

    renderPanels() {
      const { getPanels } = this.props;
      const component = this.state.shownComponent.component;

      const panels = getPanels([
        { name: 'props', data: component.props },
        { name: 'state', data: component.state },
        { name: 'context', data: component.context },
      ], component);

      function getDataElement(panel) {
        const data = panel.data;
        const isElement = React.isValidElement(data);

        return isElement ? data : <ObjectInspector className='RT-debug-inspector' data={data} />
      }

      return (
        <div>
          {panels.map((panel, idx) =>
            <div key={panel.name + idx}>
              <h6 style={{ padding: '0 10px' }}>{panel.name}</h6>
              {getDataElement(panel)}
            </div>
          )}
        </div>
      );
    }

    addComponent(component, rect) {
      this.setState({ components: [{
        component,
        pinRect: rect
      }, ...this.state.components] });
    }

    removeComponent(component) {
      this.setState({ components: this.state.components.filter(c => c.component !== component) });
    }

    handleCloseClick = () => {
      this.setState({ isVisible: false });
    }

    handleLeftClick = () => {
      this.setState({ position: 'left' });
    }

    handleRightClick = () => {
      this.setState({ position: 'right' });
    }

    handlePinClick = () => {
      const { isVisible, components: [topComponent], shownComponent } = this.state;
      this.setState({
        isVisible: !isVisible || topComponent !== shownComponent,
        shownComponent: topComponent
      });
    }

    getPinElement() {
      return React.findDOMNode(this.refs.pin);
    }
  }

  _debugPopupWrapper = document.createElement('div');
  document.body.appendChild(_debugPopupWrapper);

  _debugPopupHost = React.render(
    <DebugPopupHost getPanels={config.getPanels} />,
    _debugPopupWrapper
  );
}

function deinit() {
  if (_debugPopupWrapper) {
    React.unmountComponentAtNode(_debugPopupWrapper);
    document.body.removeChild(_debugPopupWrapper);
    _debugPopupWrapper = null;
  }
  _debugPopupHost = null;
}

let triggerCalled = false;

export default function(options) {
  const config = Object.assign({
    enabledTrigger: cb => cb(true),
    getPanels: panels => panels,
    showPin: () => true
  }, options.imports[0]);

  function enter(e) {
    if (!_enabled || !config.showPin(this)) return;
    var rect = e.target.getBoundingClientRect();
    _debugPopupHost.addComponent(this, rect);
  }

  function leave(e) {
    if (!_enabled || !config.showPin(this)) return;
    if (e.toElement === _debugPopupHost.getPinElement()) {
      return;
    }
    _debugPopupHost.removeComponent(this);
  }

  function wrapClass(componentClass) {
    function WrappedClass() {
      componentClass.apply(this, arguments);

      this.handleMouseEnter = e => {
        enter.call(this, e);
      }

      this.handleMouseLeave = e => {
        leave.call(this, e);
      }
    }

    WrappedClass.prototype = Object.create(componentClass.prototype);
    WrappedClass.prototype.constructor = componentClass;
    WrappedClass.displayName = componentClass.displayName ||
      componentClass.prototype.constructor.name;

    Object.getOwnPropertyNames(componentClass)
      .filter(n => ['length', 'name', 'prototype'].indexOf(n) === -1)
      .forEach(n => WrappedClass[n] = componentClass[n]);

    WrappedClass.prototype.componentDidMount = function() {
      if (componentClass.prototype.componentDidMount) {
        componentClass.prototype.componentDidMount.call(this);
      }

      var el = React.findDOMNode(this);
      el.addEventListener('mouseenter', this.handleMouseEnter);
      el.addEventListener('mouseleave', this.handleMouseLeave);
    }

    WrappedClass.prototype.componentWillUnmount = function() {
      if (componentClass.prototype.componentWillUnmount) {
        componentClass.prototype.componentWillUnmount.call(this);
      }

      var el = React.findDOMNode(this);
      el.removeEventListener('mouseenter', this.handleMouseEnter);
      el.removeEventListener('mouseleave', this.handleMouseLeave);
    }

    return WrappedClass;
  }

  if (!triggerCalled) {
    config.enabledTrigger(enabled => {
      _enabled = enabled;
      if (enabled) {
        init(config);
      } else {
        deinit();
      }
    });
    triggerCalled = true;
  }

  return componentClass => wrapClass(componentClass);
}
