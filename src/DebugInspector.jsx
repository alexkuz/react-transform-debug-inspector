import React, { Component } from 'react';
import Dock from 'react-dock';
import DebugInspectorPanel from './DebugInspectorPanel';
import radium from 'radium';

@radium
export default class DebugInspector extends Component {
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
      lineHeight: '12px',
      fontSize: '16px'
    };

    return (
      <div style={wrapperStyle}>
        <Dock isVisible={this.state.isVisible}
              position={this.state.position}
              onVisibleChanged={isVisible => this.setState({ isVisible })}
              dimMode='none'>
          <div style={bittonsStyle}>
            {this.state.position === 'right' &&
              <span onClick={this.handleLeftClick}>
                {'\u21E4'}
              </span>
            }
            {this.state.position === 'left' &&
              <span onClick={this.handleRightClick}>
                {'\u21E5'}
              </span>
            }
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

    return (
      <div>
        {panels.map((panel, idx) =>
          <DebugInspectorPanel key={panel.name + idx}
                               name={panel.name}
                               data={panel.data} />
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
