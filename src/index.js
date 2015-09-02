import React from 'react';
import ObjectInspector from 'react-object-inspector';

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
        pinPos: { left: -1000, top: -1000 },
        component: null
      };

      this.state = {
        components: [nullComponent],
        isShown: false,
        shownComponent: nullComponent
      };
    }

    render() {
      const { pinPos } = this.state.components[0];
      const pinStyle = {
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

      const wrapperStyle = {
        position: 'absolute',
        zIndex: '999999999',
        top: 0,
        left: 0,
        width: this.state.isShown ? '100%' : 0,
        pointerEvents: 'none'
      };

      const inspectStyle = {
        position: 'fixed',
        top: 0,
        left: this.state.isShown ? 0 : - window.innerWidth / 3,
        bottom: 0,
        width: '30%',
        backgroundColor: '#FAFAFA',
        pointerEvents: 'auto',
        overflowY: 'auto',
        boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
        padding: '10px',
        transition: 'left 0.15s ease-out'
      };

      const closeStyle = {
        position: 'absolute',
        top: '15px',
        right: '15px',
        cursor: 'pointer'
      };

      return (
        <div style={wrapperStyle}>
          <div style={inspectStyle}>
            <div style={closeStyle} onClick={this.handleCloseClick}>
              ×
            </div>
            {this.state.isShown && this.renderPanels()}
          </div>
          <div style={pinStyle}
               onClick={this.handlePinClick}
               ref='pin' />
        </div>
      );
    }

    renderPanels() {
      const { getPanels } = this.props;
      const panels = getPanels([
        { name: 'props', getData: (c) => c.props },
        { name: 'state', getData: (c) => c.state },
        { name: 'context', getData: (c) => c.context },
      ]);
      const component = this.state.shownComponent.component;

      function getDataElement(panel) {
        const data = panel.getData(component);
        const isElement = React.isValidElement(data);

        return isElement ? data : <ObjectInspector data={data} />
      }

      return (
        <div>
          {panels.map((panel, idx) =>
            <div key={panel.name + idx}>
              <h6>{panel.name}</h6>
              {getDataElement(panel)}
            </div>
          )}
        </div>
      );
    }

    addComponent(component, pinPos) {
      this.setState({ components: [{
        component,
        pinPos
      }, ...this.state.components] });
    }

    removeComponent(component) {
      this.setState({ components: this.state.components.filter(c => c.component !== component) });
    }

    handleCloseClick = () => {
      this.setState({ isShown: false });
    }

    handlePinClick = () => {
      this.setState({
        isShown: !this.state.isShown || this.state.components[0] !== this.state.shownComponent,
        shownComponent: this.state.components[0]
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
    _debugPopupHost.addComponent(this, {
      left: rect.right + window.scrollX - 24,
      top: rect.top + window.scrollY + 8
    });
  }

  function leave(e) {
    if (!_enabled || !config.showPin(this)) return;
    if (e.toElement === _debugPopupHost.getPinElement()) {
      return;
    }
    _debugPopupHost.removeComponent(this);
  }

  function bindMouseEvents(componentClass) {
    if (componentClass.__debugInspectorBound__) return;
    componentClass.__debugInspectorBound__ = true;

    const _didMount =  componentClass.prototype.componentDidMount;
    componentClass.prototype.componentDidMount = function() {
      if (_didMount) {
        _didMount.call(this);
      }

      if (!this.boundEnter) {
        this.boundEnter = enter.bind(this);
        this.boundLeave = leave.bind(this);
      }

      var el = React.findDOMNode(this);
      el.addEventListener('mouseenter', this.boundEnter);
      el.addEventListener('mouseleave', this.boundLeave);
    }

    const _willUnmount = componentClass.prototype.componentWillUnmount;
    componentClass.prototype.componentWillUnmount = function() {
      if (_willUnmount) {
        _willUnmount.call(this);
      }

      var el = React.findDOMNode(this);
      el.removeEventListener('mouseenter', this.boundEnter);
      el.removeEventListener('mouseleave', this.boundLeave);
    }
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

  return componentClass => {
    bindMouseEvents(componentClass);

    return componentClass;
  }
}
