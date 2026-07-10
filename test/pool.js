const
    path = require('path'),
    test = require('tape').test,
    mapnik = require('mapnik'),
    genericPool = require('generic-pool');

mapnik.register_default_input_plugins();

var mapnikPool = require('../')(mapnik),
    fs = require('fs');

test('mapnik-pool exposes generic-pool', function(t) {
    t.equal(genericPool, require('../').genericPool);
    t.end();
});

test('from style xml', function(t) {
    const pool = mapnikPool.fromStyleXML(
            fs.readFileSync(__dirname + '/data/map.xml', 'utf8'),
            { bufferSize: 256 }, { base: __dirname + '/data' });

    pool.acquire().then(map => {
        t.pass('acquires a map');
        t.equal(map.bufferSize, 256, 'sets a buffer size');
        t.equal(map.width, 256, 'sets map size');
        t.equal(map.height, 256, 'sets map size');
        return map;
    })
    .then(map => {
        return pool.release(map)
    })
    .then(() => {
        return pool.drain();
    })
    .then(() => {
        return pool.clear();
    })
    .then(() => {
        t.end();
    }, (err) => {
        t.fail(err);
    });
});

test('from style file', function(t) {
    const pool = mapnikPool.fromStylePath(__dirname + '/data/map.xml',
        { size: 128, bufferSize: 64 });

    pool.acquire().then(map => {
        t.pass('acquires a map');
        t.equal(map.bufferSize, 64, 'sets a buffer size');
        t.equal(map.width, 128, 'sets map size');
        t.equal(map.height, 128, 'sets map size');
        return map;
    })
    .then(map => {
        return pool.release(map)
    })
    .then(() => {
        return pool.drain();
    })
    .then(() => {
        return pool.clear();
    })
    .then(() => {
        t.end()
    }, err => {
        t.fail(err)
    });
});

test('uses user style base dir with style file', function(t) {
    const pool = mapnikPool.fromStylePath(
        __dirname + '/data/map.xml', {}, { base: '/invalid/base' })
        .on('factoryCreateError', function(err) {
            t.ok(err instanceof Error, 'expected error');
            t.ok(/\/invalid\/base\//.test(err.message), 'failed because of bad style base dir');
        });

    pool.acquire().then(() => {
        t.fail('acquired invalid map');
    }, err => {
        t.ok(err, 'expected error')
        t.end();
    });
});

test('initOptions', function(t) {
    const pool = mapnikPool.fromStylePath(
        __dirname + '/data/map.xml', { size: 1024 });

    pool.acquire(map => {
        t.equal(map.width, 1024, 'use initOptions to set map width');
        t.equal(map.height, 1024, 'use initOptions to set map height');
        return map;
    })
    .then(map => {
        return pool.release(map);
    })
    .then(() => {
        return pool.drain();
    })
    .then(() => {
        return pool.clear();
    })
    .then(() => {
        t.end()
    }, err => {
        t.fail(err)
    });
});

test('invalid style xml', function(t) {
    const pool = mapnikPool.fromStyleXML('invalid map', { bufferSize: 256 });

    pool.acquire()
    .then(map => {
        t.equal(map, undefined);
        t.fail('acquired invalid map');
    })
    .catch(err => {
        t.ok(err instanceof Error, 'expected error: ' + err.message);
        t.end();
    });
});

test('invalid style file', function(t) {
    const pool = mapnikPool.fromStylePath('invalid/map.xml', { bufferSize: 256 });

    pool.acquire()
    .then(map => {
        t.equal(map, undefined);
        t.fail('acquired invalid map');
    })
    .catch(err => {
        t.ok(err instanceof Error, 'expected error: ' + err.message);
        t.end();
    });
});

test('rejects destroy promise when error occurs', function(t) {
    const pool = mapnikPool
    .fromStylePath(path.resolve(__dirname, 'data/map.xml'))
    .on('factoryDestroyError', function(err) {
        t.equal(err, 'test clear error', 'destroy rejected with expected error');
        t.end();
    });

    pool.acquire()
    .then(map => {
        map.clear = function() {
            throw 'test clear error'
        };
        return pool.destroy(map);
    });
});
