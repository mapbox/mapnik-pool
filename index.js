var Pool = require('generic-pool').Pool,
    mapnik = require('mapnik'),
    os = require('os'),
    xtend = require('xtend');

var N_CPUS = os.cpus().length,
    defaultOptions = { size: 256 },
    defaultMapOptions = { strict: true };

module.exports.fromString = function(xml, initOptions, mapOptions) {

    var options = xtend({}, initOptions, defaultOptions);
    mapOptions = mapOptions || defaultMapOptions;

    return Pool({
        create: create,
        destroy: destroy,
        max: N_CPUS
    });

    function create(callback) {
        var map = new mapnik.Map(options.size, options.size);
        map.fromString(xml, options, loaded);
        function loaded(err) {
            if (err) return callback(err);
            if (options.bufferSize) {
                map.bufferSize = options.bufferSize;
            }
            return callback(err, map);
        }
    }
    function destroy(map) {
        delete map;
    }
};
