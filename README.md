# mapnik-pool

If you want to use `node-mapnik` in an app with concurrency, you'll want to use
a map pool. Concurrently using a single map instance can crash your app,
and several map instances will give you a significant speedup. `mapnik-pool`
manages a `generic-pool` of `mapnik.Map` instances so you don't have to.

## example

```js
var mapnikPool = require('mapnik-pool'),
    fs = require('fs');

var pool = mapnikPool.fromString(fs.readFileSync('mymap.xml', 'utf8'));

pool.acquire(function(err, map) {
    // pooled map
});
```

## api

### `fromString(str, initOptions, mapOptions)`

* `str`: a mapnik XML string
* `initOptions`: options for initialization. Currently, `size` for map, `bufferSize`. Default `{ size: 256 }`
* `mapOptions`: options for the `fromString` method. Default: `{ strict: true }`.
