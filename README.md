![mapnik-pool](https://cloud.githubusercontent.com/assets/83384/4493143/fe155e76-4a46-11e4-81db-61f319910acb.png)

[![Build Status](https://travis-ci.org/mapbox/mapnik-pool.svg?branch=master)](https://travis-ci.org/mapbox/mapnik-pool)
[![Coverage Status](https://coveralls.io/repos/mapbox/mapnik-pool/badge.svg?branch=master&service=github)](https://coveralls.io/github/mapbox/mapnik-pool?branch=master)

# mapnik-pool

If you want to use `node-mapnik` in an app with concurrency, you'll want to use
a map pool. By design Mapnik Maps are not meant to be shared between threads because datasources hold state. This [may change in the future](https://github.com/mapnik/mapnik/issues/2521) but for now using a single map instance with async node-mapnik rendering functions may your app. Also using several map instances will give you a significant speedup. `mapnik-pool` manages a `generic-pool` of `mapnik.Map` instances so you don't have to.

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
});
```

## api

### `fromString(str, initOptions, mapOptions)`

* `str`: a Mapnik XML string
* `initOptions`: options for initialization. Currently, `size` for map, `bufferSize`. Default `{ size: 256 }`
* `mapOptions`: options for the `fromString` method.
