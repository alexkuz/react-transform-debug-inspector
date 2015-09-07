import React, { Component, PropTypes } from 'react';
import ObjectInspector from '@alexkuz/react-object-inspector';
import radium from 'radium';

@radium
export default class DebugInspectorPanel extends Component {
  constructor(props) {
    super(props);
    this.state = { collapsed: false };
  }

  static propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.any
  }

  render() {
    const { name, data } = this.props;

    const panelStyle = {
      userSelect: 'none'
    }

    const contentStyle = {
      transition: 'max-height 0.15s ease-out',
      maxHeight: this.state.collapsed ? 0 : '100vh',
      userSelect: 'initial',
      overflow: 'auto'
    };

    const arrowStyle = [{
      transition: 'transform 0.15s ease-out',
      borderTop: '6px solid #333333',
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      display: 'inline-block',
      marginRight: '5px',
      marginBottom: '2px'
    }, this.state.collapsed && {
      transform: 'rotate(-90deg)'
    }];

    const headerStyle = {
      margin: '15px',
      cursor: 'pointer'
    };

    return (
      <div style={panelStyle}>
        <h6 style={headerStyle}
            onClick={this.toggleCollapsed}>
          <div style={arrowStyle} />
          {name}
        </h6>
        <div style={contentStyle}>
          {!React.isValidElement(data) ?
            <ObjectInspector className='RT-debug-inspector'
                             data={data} /> :
            data
          }
        </div>
      </div>
    );
  }

  toggleCollapsed = () => {
    this.setState({ collapsed: !this.state.collapsed });
  }
}
