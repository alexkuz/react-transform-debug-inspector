import React from 'react';
import DebugInspector from './DebugInspector';

let _debugInspector;
let _debugPopupWrapper;

let _enabled = false;

function init(config) {
  if (_debugInspector) {
    return;
  }

  _debugPopupWrapper = document.createElement('div');
  document.body.appendChild(_debugPopupWrapper);

  _debugInspector = React.render(
    <DebugInspector getPanels={config.getPanels} />,
    _debugPopupWrapper
  );
}

function deinit() {
  if (_debugPopupWrapper) {
    React.unmountComponentAtNode(_debugPopupWrapper);
    document.body.removeChild(_debugPopupWrapper);
    _debugPopupWrapper = null;
  }
  _debugInspector = null;
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
    _debugInspector.addComponent(this, rect);
  }

  function leave(e) {
    if (!_enabled || !config.showPin(this)) return;
    if (e.toElement === _debugInspector.getPinElement()) {
      return;
    }
    _debugInspector.removeComponent(this);
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
