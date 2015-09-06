# react-transform-debug-inspector
React inspector tranformation function for [babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform)

(this feels like more of a demo than a real thing for now, but anyway)

## Install

```
$ npm i -D react-transform-debug-inspector
```

Update your `.babelrc`:
```json
  "plugins": ["react-transform"],
  "extra": {
    "react-transform": [{
      "target": "react-transform-debug-inspector"
    }]
  }
```

If you need advanced settings, add path to config module:
```json
  "extra": {
    "react-transform": [{
      "target": "react-transform-debug-inspector",
      "imports": ["./debug/inspectorConfig"]
    }]
  }
```

Config example:
```js
// import styles for json tree
import 'style!css!react-transform-debug-inspector/debug-inspector.css';

import { DevTools, LogMonitor } from 'redux-devtools/lib/react';

function getMyPanel(component) {
  // instead of plain object or literal, you can pass any component - like redux DevTools
  if (component.context.store) {
    return (
      <DevTools store={component.context.store} monitor={LogMonitor} />
    );
  }
}

let _enabled = false;

export default {
  // add your custom panels ('props', 'state', 'context' by default)
  getPanels: defaultPanels => [{
    name: 'myPanel',
    getData: getMyPanel
  }, ...defaultPanels],

  // enable or disable inspector with key binding or whatever
  enabledTrigger: enable => {
    window.addEventListener('keydown', e => {
      if (e.keyCode === 220) {
        _enabled = !_enabled;
        enable(_enabled);
      }
    });
    
    // another example: enable(location.search.indexOf('debug') !== -1)

    enable(_enabled);
  },
  
  // filter components that don't need inspector
  showPin: component => true
}
```
