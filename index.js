const fs = require('fs');
const os = require('os');
const path = require('path');
const pools = require('generic-pool');

const N_CPUS = os.cpus().length;
const defaultOptions = { size: 256 };
const defaultMapOptions = {};

pools.Pool.prototype.stop = function() {
    while (this._waitingClientsQueue.length) {
        const client = this._waitingClientsQueue.dequeue();
        client.reject(new Error('pool has been stopped'));
    }
    return this.drain().then(() => {
        return this.clear();
    });
};

class Factory {

    constructor(mapnik, style, options, mapOptions) {
        this.mapnik = mapnik;
        this.style = style;
        this.options = Object.freeze(
            Object.assign({}, defaultOptions, options));
        this.mapOptions = Object.freeze(
            Object.assign({}, defaultMapOptions, mapOptions));
    }

    create() {
        const map = new this.mapnik.Map(this.options.size, this.options.size);
        const setBufferSizeOnMap = function(map) {
            if (this.options.bufferSize) {
                map.bufferSize = this.options.bufferSize;
            }
            return Promise.resolve(map);
        }.bind(this);

        if (typeof this.style == 'string') {
            return new Promise((resolve, reject) => {
                map.fromString(this.style, this.mapOptions, (err, map) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(map);
                    }
                });
            })
            .then(setBufferSizeOnMap);
        }

        return new Promise((resolve, reject) => {
            let stylePath = path.resolve(this.style.dir, this.style.name + this.style.ext);
            map.load(stylePath, this.mapOptions, (err, map) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(map);
                }
            });
        })
        .then(setBufferSizeOnMap);
    }

    destroy(map) {
        return new Promise((resolve, reject) => {
            try {
                map.clear();
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }
}

function onCreateError(err) {
    function message() {
        console.log('error creating Mapnik map: ' + err);
    }
    this.stop().then(message, message);
};

module.exports = function(mapnik) {

    function createPool(style, initOptions, mapOptions) {
        const factory = new Factory(mapnik, style, initOptions, mapOptions);
        return pools.createPool(factory, { max: N_CPUS })
            .on('factoryCreateError', onCreateError);
    };

    return {
        fromStylePath: function(stylePath, initOptions, mapOptions) {
            mapOptions = mapOptions || {};
            stylePath = path.parse(path.resolve(stylePath));
            if (!mapOptions.base) {
                mapOptions.base = stylePath.dir;
            }
            return createPool(stylePath, initOptions, mapOptions);
        },
        fromStyleXML: function fromStyleXML(xml, initOptions, mapOptions) {
            return createPool(xml, initOptions, mapOptions);
        }
    };
};

module.exports.genericPool = pools;
