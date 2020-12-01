var Pool = require('generic-pool').Pool,
    os = require('os'),
    xtend = require('xtend');

var N_CPUS = os.cpus().length,
    defaultOptions = { size: 256, sync: false },
    defaultMapOptions = { };

module.exports = function(mapnik) {
    return {
        fromString: function(xml, initOptions, mapOptions) {
            var options = xtend({}, defaultOptions, initOptions);
            mapOptions = mapOptions || {};
            return Pool({
                create: options.sync ? createSync : create,
                destroy: destroy,
                max: N_CPUS
            });
            function create(callback) {
                var map = new mapnik.Map(options.size, options.size);
                map.fromString(xml, mapOptions, loaded);
                function loaded(err) {
                    if (err) return callback(err);
                    if (options.bufferSize) {
                        map.bufferSize = options.bufferSize;
                    }
                    return callback(err, map);
                }
            }
            function createSync(callback) {
                var map = new mapnik.Map(options.size, options.size);
                try {
                  map.fromStringSync(xml, mapOptions);
                }
                catch (err) {
                  return callback(err);
                }
                if (options.bufferSize) {
                    map.bufferSize = options.bufferSize;
                }
                return callback(null, map);
            }
            function destroy(map) {
                delete map;
            }
        }
    };
};

module.exports.Pool = Pool;
