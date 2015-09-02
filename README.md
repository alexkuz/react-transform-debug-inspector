# react-transform-debug-inspector
React inspector tranformation function for [babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform)

(this feels like more of a demo than a real thing for now, but anyway)

## Install

```
$ npm i -D react-transform-debug-inspector
```

Update your `.babelrc`:
```json
  "plugins": ["babel-plugin-react-transform"],
  "extra": {
    "babel-plugin-react-transform": [{
      "target": "react-transform-debug-inspector"
    }]
  }
```

If you need advanced settings, add path to config module:
```json
  "extra": {
    "babel-plugin-react-transform": [{
      "target": "react-transform-debug-inspector",
      "imports": ["./debug/inspectorConfig"]
    }]
  }
```

Config example:
```js
// import styles for json tree
import 'style!css!react-object-inspector/react-object-inspector.css';

function getMyPanel(component) {
  // custom components are allowed
  return <h1>This is a {component.constructor.name}</h1>;
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
      if (e.keyCode === 49 && e.metaKey) {
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
