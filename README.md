# requirejs-config-file

A small api to read and write your requirejs config file

## installation

```
npm install requirejs-config-file
```

## usage

```js
var ConfigFile = require('requirejs-config-file').ConfigFile;
```

<!-- example1 -->
```js
var configFile = new ConfigFile('path/to/some/requirejs-config.js'));

configFile.read(function(err, config) {
  if (err) throw 'Something went really wrong: '+err.toString();

  console.log(config); // is an object with the found config
});
```
