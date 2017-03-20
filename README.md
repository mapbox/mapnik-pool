![mapnik-pool](https://cloud.githubusercontent.com/assets/83384/4493143/fe155e76-4a46-11e4-81db-61f319910acb.png)

[![Build Status](https://travis-ci.org/mapbox/mapnik-pool.svg?branch=master)](https://travis-ci.org/mapbox/mapnik-pool)
[![Coverage Status](https://coveralls.io/repos/mapbox/mapnik-pool/badge.svg?branch=master&service=github)](https://coveralls.io/github/mapbox/mapnik-pool?branch=master)

# mapnik-pool

If you want to use `node-mapnik` to render tiles in an async fashion for highest performance, you've come to the right place: you need a map pool. This is because you must ensure that when you call `map.render` no other threads are using that `map` instance. When you call an async function like `map.render` Node.js is creating a thread behind the scene.

## install

    npm install --save mapnik-pool

## dependency structure

`mapnik-pool` is a [peerDependency](http://domenic.me/2013/02/08/peer-dependencies/)
of `node-mapnik`: you bring your own Mapnik version, as long as its `~1.0.0`.

## example

```js
var mapnik = require('mapnik'),
    mapnikPool = require('mapnik-pool')(mapnik),
    fs = require('fs');

var pool = mapnikPool.fromString(fs.readFileSync('mymap.xml', 'utf8'));

pool.acquire(function(err, map) {
    // pooled map
    pool.release(map);
});
```

```js
var mapnik = require('mapnik'),
    mapnikPool = require('mapnik-pool')(mapnik),
    fs = require('fs');

var datasource = new mapnik.Datasource(...);
var layer = new mapnik.Layer(...);
layer.datasource = datasource;

var pool = mapnikPool.fromLayers([layer], { size: 256, srs: '...' });

pool.acquire(function(err, map) {
    // pooled map
    pool.release(map);
});
```

## api

### `fromString(str, initOptions, mapOptions)`

* `str`: a Mapnik XML string
* `initOptions`: options for initialization. Currently, `size` for map, `bufferSize`. Default `{ size: 256 }`
* `mapOptions`: options for the `fromString` method.

### `fromLayers(arr, initOptions, mapOptions)`

* `arr`: an array of Mapnik layers
* `initOptions`: options for initialization. Currently, `srs`, `size` for map, `bufferSize`. Default `{ size: 256 }`
