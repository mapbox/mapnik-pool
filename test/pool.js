var test = require('tap').test,
    mapnik = require('mapnik'),
    Pool = require('generic-pool').Pool;

mapnik.register_default_input_plugins();

var mapnikPool = require('../')(mapnik),
    fs = require('fs');

test('mapnik-pool exposes generic-pool', function(t) {
    t.equal(Pool,require('../').Pool);
    t.end();
});

test('mapnik-pool', function(t) {
    var pool = mapnikPool.fromString(
            fs.readFileSync(__dirname + '/data/map.xml', 'utf8'),
            { bufferSize: 256 });

    pool.acquire(function(err, map) {
        t.equal(err, null, 'no error returned');
        t.pass('acquires a map');
        t.equal(map.bufferSize, 256, 'sets a buffer size');
        t.equal(map.width, 256, 'sets map size');
        t.equal(map.height, 256, 'sets map size');
        t.end();
    });
});

test('initOptions', function(t) {
    var pool = mapnikPool.fromString(
            fs.readFileSync(__dirname + '/data/map.xml', 'utf8'),
            { size: 1024 });

    pool.acquire(function(err, map) {
        t.equal(map.width, 1024, 'use initOptions to set map width');
        t.equal(map.height, 1024, 'use initOptions to set map height');
        t.end();
    });
});

test('passes errors', function(t) {
    var pool = mapnikPool.fromString('invalid map',
            { bufferSize: 256 });

    pool.acquire(function(err, map) {
        t.ok(err instanceof Error);
        t.end();
    });
});
