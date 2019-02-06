![mapnik-pool](https://cloud.githubusercontent.com/assets/83384/4493143/fe155e76-4a46-11e4-81db-61f319910acb.png)

[![Build Status](https://travis-ci.org/mapbox/mapnik-pool.svg?branch=master)](https://travis-ci.org/mapbox/mapnik-pool)
[![Coverage Status](https://coveralls.io/repos/mapbox/mapnik-pool/badge.svg?branch=master&service=github)](https://coveralls.io/github/mapbox/mapnik-pool?branch=master)

# mapnik-pool

If you want to use [`node-mapnik`](http://mapnik.org/documentation/node-mapnik) to render tiles in an async fashion for highest performance, you've come to the right place: you need a map pool. This is because you must ensure that when you call [`mapnik.Map.render`](http://mapnik.org/documentation/node-mapnik/3.6/#Map.render)
no other threads are using that `mapnik.Map` instance. When you call an async function like `mapnik.Map.render`, Node.js is creating a thread behind the scene.

## Install

    npm install --save mapnik-pool

## Dependency structure

`mapnik-pool` is a [peerDependency](http://domenic.me/2013/02/08/peer-dependencies/)
of `node-mapnik`: you bring your own Mapnik version, as long as it's `~1.0.0`.

## Example

```js
const mapnik = require('mapnik'),
      mapnikPool = require('mapnik-pool')(mapnik),
      fs = require('fs');

const pool = mapnikPool.fromStyleXML(fs.readFileSync('mymap.xml', 'utf8'), { size: 512, bufferSize: 128 }, { base: '/mapnik_resources' });
// or mapnikPool.fromStylePath('mymap.xml', { size: 512, bufferSize: 128 });

pool.acquire().then(map => {
    // pooled map
    // ...
    return map;
})
.then(map => {
    pool.release(map);
});
```

You can also apply the [`Pool.use()`](https://github.com/coopernurse/node-pool#pooluse) method to automate the step of releasing
the `mapnik.Map` instance back to the pool.

```js
const renderTask = map => {
    return new Promise((resolve, reject) => {
        // ...
        map.render(new mapnik.Image(size, size), {}, (err, img) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(img);
            }
        });
    });
};
pool.use(renderTask).then(img => {
    // do something with the render result buffer
});
```

## API

### `fromStyleXML(xml, initOptions, mapOptions)`
#### Parameters ####
* `xml`: `string` a Mapnik XML string
* `initOptions`: `object` options for initialization. Currently, `size` for map, `bufferSize`. Default `{ size: 256 }`
* `mapOptions`: `object` options for the `mapnik.Map.fromString` method.  Use the `base` key to set the base directory of the style for resolving relative resources.
#### Returns ####
[`Pool`](https://github.com/coopernurse/node-pool)

### `fromStylePath(stylePath, initOptions, mapOptions)`
This method is similar to `fromStyleXML`, but loads the style from the given file path.  If the `base` key is not present in `mapOptions`,
this method sets the `base` key to the parent directory of `stylePath`.
#### Parameters ####
* `stylePath`: `string` path to a Mapnik XML style document
* `initOptions`: `object` options for initialization. Currently, `size` for map, `bufferSize`. Default `{ size: 256 }`
* `mapOptions`: `object` options for the `mapnik.Map.fromString` method.  Use the `base` key to set the base directory of the style for resolving relative resources.
#### Returns ####
[`Pool`](https://github.com/coopernurse/node-pool)
