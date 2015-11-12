var Pool = require('generic-pool').Pool,
    os = require('os'),
    xtend = require('xtend');

var N_CPUS = os.cpus().length,
    defaultOptions = { size: 256 },
    defaultMapOptions = { };

module.exports = function(mapnik) {
    return {
        fromString: function(xml, initOptions, mapOptions) {
            var options = xtend({}, defaultOptions, initOptions);
            mapOptions = mapOptions || {};
            return Pool({
                create: create,
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
            function destroy(map) {
                delete map;
            }
        }
    };
};

module.exports.Pool = Pool;
