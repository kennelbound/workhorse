/*! workhorse v1.0.0 - 2014-11-21 
 *  License: MIT */
;workhorse = (function(){
var __m7 = function(module,exports){module.exports=exports;
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };

  //I only added this line
  module.exports = Class;
})();

;return module.exports;}({},{});
var __m6 = function(module,exports){module.exports=exports;
//     uuid.js
//
//     Modifications by Sam Alston
//     Originally copied from https://github.com/broofa/node-uuid
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function () {
    var _global = this;

    // Unique ID creation requires a high quality random # generator.  We feature
    // detect to determine the best RNG source, normalizing to a function that
    // returns 128-bits of randomness, since that's what's usually required
    var _rng;

    if (!_rng) {
        // Math.random()-based (RNG)
        //
        // If all else fails, use Math.random().  It's fast, but is of unspecified
        // quality.
        var _rnds = new Array(16);
        _rng = function () {
            for (var i = 0, r; i < 16; i++) {
                if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
                _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
            }

            return _rnds;
        };
    }

    // Buffer class to use
    var BufferClass = typeof(Buffer) == 'function' ? Buffer : Array;

    // Maps for number <-> hex string conversion
    var _byteToHex = [];
    var _hexToByte = {};
    for (var i = 0; i < 256; i++) {
        _byteToHex[i] = (i + 0x100).toString(16).substr(1);
        _hexToByte[_byteToHex[i]] = i;
    }

    // **`parse()` - Parse a UUID into it's component bytes**
    function parse(s, buf, offset) {
        var i = (buf && offset) || 0, ii = 0;

        buf = buf || [];
        s.toLowerCase().replace(/[0-9a-f]{2}/g, function (oct) {
            if (ii < 16) { // Don't overflow!
                buf[i + ii++] = _hexToByte[oct];
            }
        });

        // Zero out remaining bytes if string was short
        while (ii < 16) {
            buf[i + ii++] = 0;
        }

        return buf;
    }

    // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
    function unparse(buf, offset) {
        var i = offset || 0, bth = _byteToHex;
        return bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
    }

    // **`v1()` - Generate time-based UUID**
    //
    // Inspired by https://github.com/LiosK/UUID.js
    // and http://docs.python.org/library/uuid.html

    // random #'s we need to init node and clockseq
    var _seedBytes = _rng();

    // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
    var _nodeId = [
        _seedBytes[0] | 0x01,
        _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
    ];

    // Per 4.2.2, randomize (14 bit) clockseq
    var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

    // Previous uuid creation time
    var _lastMSecs = 0, _lastNSecs = 0;

    // See https://github.com/broofa/node-uuid for API details
    function v1(options, buf, offset) {
        var i = buf && offset || 0;
        var b = buf || [];

        options = options || {};

        var clockseq = options.clockseq !== null ? options.clockseq : _clockseq;

        // UUID timestamps are 100 nano-second units since the Gregorian epoch,
        // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
        // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
        // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
        var msecs = options.msecs !== null ? options.msecs : new Date().getTime();

        // Per 4.2.1.2, use count of uuid's generated during the current clock
        // cycle to simulate higher resolution clock
        var nsecs = options.nsecs !== null ? options.nsecs : _lastNSecs + 1;

        // Time since last uuid creation (in msecs)
        var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs) / 10000;

        // Per 4.2.1.2, Bump clockseq on clock regression
        if (dt < 0 && options.clockseq === null) {
            clockseq = clockseq + 1 & 0x3fff;
        }

        // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
        // time interval
        if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === null) {
            nsecs = 0;
        }

        // Per 4.2.1.2 Throw error if too many uuids are requested
        if (nsecs >= 10000) {
            throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
        }

        _lastMSecs = msecs;
        _lastNSecs = nsecs;
        _clockseq = clockseq;

        // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
        msecs += 12219292800000;

        // `time_low`
        var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
        b[i++] = tl >>> 24 & 0xff;
        b[i++] = tl >>> 16 & 0xff;
        b[i++] = tl >>> 8 & 0xff;
        b[i++] = tl & 0xff;

        // `time_mid`
        var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
        b[i++] = tmh >>> 8 & 0xff;
        b[i++] = tmh & 0xff;

        // `time_high_and_version`
        b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
        b[i++] = tmh >>> 16 & 0xff;

        // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
        b[i++] = clockseq >>> 8 | 0x80;

        // `clock_seq_low`
        b[i++] = clockseq & 0xff;

        // `node`
        var node = options.node || _nodeId;
        for (var n = 0; n < 6; n++) {
            b[i + n] = node[n];
        }

        return buf ? buf : unparse(b);
    }

    // **`v4()` - Generate random UUID**

    // See https://github.com/broofa/node-uuid for API details
    function v4(options, buf, offset) {
        // Deprecated - 'format' argument, as supported in v1.2
        var i = buf && offset || 0;

        if (typeof(options) == 'string') {
            buf = options == 'binary' ? new BufferClass(16) : null;
            options = null;
        }
        options = options || {};

        var rnds = options.random || (options.rng || _rng)();

        // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
        rnds[6] = (rnds[6] & 0x0f) | 0x40;
        rnds[8] = (rnds[8] & 0x3f) | 0x80;

        // Copy bytes to buffer, if provided
        if (buf) {
            for (var ii = 0; ii < 16; ii++) {
                buf[i + ii] = rnds[ii];
            }
        }

        return buf || unparse(rnds);
    }

    // Export public API
    var uuid = v4;
    uuid.v1 = v1;
    uuid.v4 = v4;
    uuid.parse = parse;
    uuid.unparse = unparse;
    uuid.BufferClass = BufferClass;

    if (typeof define === 'function' && define.amd) {
        // Publish as AMD module
        define(function () {
            return uuid;
        });
    } else if (typeof(module) != 'undefined' && module.exports) {
        // Publish as node.js module
        module.exports = uuid;
    } else {
        // Publish as global (in browsers)
        var _previousRoot = _global.uuid;

        // **`noConflict()` - (browser only) to reset global 'uuid' var**
        uuid.noConflict = function () {
            _global.uuid = _previousRoot;
            return uuid;
        };

        _global.uuid = uuid;
    }
}).call(this);

;return module.exports;}({},{});
var __m3 = function(module,exports){module.exports=exports;
var Serializer = {
    deserializationMethodRegistry: {},

    deserialize: function (obj) {
        if (!obj) {
            return obj;
        }

        var clazz = obj._classname;
        var deserializationMethod = Serializer.deserializationMethodRegistry[clazz];
        if (!deserializationMethod) {
            console.log("Cannot find serializer registry for", clazz);
            return obj;
        }
        return deserializationMethod(obj);
    },

    serialize: function (obj) {
        if (obj && obj.hasOwnProperty('toJSONObject') && obj.hasOwnProperty('_classname')) {
            return obj.toJSONObject();
        } else {
            return obj;
        }
    },

    registerClass: function (className, fn) {
        Serializer.deserializationMethodRegistry[className] = fn;
    }
};

module.exports = Serializer;
;return module.exports;}({},{});
var __m0 = function(module,exports){module.exports=exports;
var Class = __m7;
var uuid = __m6;
var Serializer = __m3;

var BaseClass = Class.extend({
    // The name of the current instance type.  All class definitions should override this
    _classname: 'BaseClass',

    // The original format of the object
    _serializedJSON: null,

    // Shared Properties
    name: null,

    uuid: null,

    init: function () {
        this.uuid = uuid.v4();
    },

    getJSONProperty: function () {
        var output = {};
        for (var i = 0; i < arguments.length; i++) {
            var fieldName = arguments[i];
            var value = this[fieldName];
            if (value instanceof Array) { // Special handling for arrays
                if (value.length > 0 && value[0] instanceof BaseClass) {
                    output[fieldName] = value.map(function (item) {
                        return item.toJSONObject();
                    });
                } else {
                    output[fieldName] = value.slice();
                }
            } else if (value instanceof BaseClass) {
                output[fieldName] = value.toJSONObject();
            } else if (value instanceof Object) {
                // TODO: Deal with when an object contains other BaseClasses
                var item = {};
                for (var key in value) {
                    item[key] = value[key];
                }
                output[fieldName] = item;
            } else {
                output[fieldName] = value;
            }
        }
        return output;
    },

    toJSONObject: function () {
        var output = this.getJSONProperty('name', 'uuid');
        output._classname = this._classname;
        return output;
    },

    clone: function () {
        return Serializer.deserialize(this.toJSONObject());
    },

    _extend: function () {
        for (var i = 1; i < arguments.length; i++)
            for (var key in arguments[i])
                if (arguments[i].hasOwnProperty(key))
                    arguments[0][key] = arguments[i][key];
        return arguments[0];
    },

    _rehydrate: function (incoming) {
        var instance = this;

        for (var key in incoming) {
            if (key.substring(0, 1) != '_') { // Properties that shouldn't be deserialized should start with _
                var value = instance[key] = incoming[key];
                if (value) {
                    if (value.hasOwnProperty('_classname')) {
                        instance[key] = Serializer.deserialize(value);
                    } else if (value instanceof Array) {
                        if (value.length > 0 && value[0].hasOwnProperty('_classname')) {
                            for (var i = 0; i < value.length; i++) {
                                value[i] = Serializer.deserialize(value[i]);
                            }
                        } else {
                            instance[key] = value.slice();
                        }
                    }
                }
            }
        }
    }
});

module.exports = BaseClass;

;return module.exports;}({},{});
var __m4 = function(module,exports){module.exports=exports;
var BaseClass = __m0;
var Serializer = __m3;

var WorkerMessage = BaseClass.extend({
    _classname: 'WorkerMessage',

    type: null,
    workerId: null,
    content: null,

    init: function (type, content, workerId) {
        this._super();

        this.type = type;
        this.content = content;
        this.workerId = workerId;

        if (this.content && this.content instanceof BaseClass) {
            this.content = this.content.toJSONObject();
        }
    },

    toJSONObject: function () {
        return this._extend(this._super(), this.getJSONProperty('type', 'content', 'workerId'));
    }
});

// To Worker
WorkerMessage.MESSAGE_TYPE_START = 'start';
WorkerMessage.MESSAGE_TYPE_STOP = 'stop';
WorkerMessage.MESSAGE_TYPE_PAUSE = 'pause';
WorkerMessage.MESSAGE_TYPE_RESUME = 'resume';

// From Worker
WorkerMessage.MESSAGE_TYPE_INIT = 'init';
WorkerMessage.MESSAGE_TYPE_UPDATE = 'update';
WorkerMessage.MESSAGE_TYPE_FINISHED = 'finished';
WorkerMessage.MESSAGE_TYPE_ERROR = 'error';

WorkerMessage.deserialize = function (object) {
    return new WorkerMessage(object.type, object.content, object.workerId);
};

Serializer.registerClass(WorkerMessage.prototype._classname, WorkerMessage.deserialize);

module.exports = WorkerMessage;
;return module.exports;}({},{});
var __m1 = function(module,exports){module.exports=exports;
var Class = __m7;
var Serializer = __m3;
var WorkerMessage = __m4;

var Harness = Class.extend({
    workers: null,

    defaultMessageHandler: null,
    updateMessageHandler: null,
    errorMessageHandler: null,
    finishedMessageHandler: null,

    init: function (updateMessageHandler, finishedMessageHandler, errorMessageHandler, defaultMessageHandler) {
        this.workers = {};
        this.updateMessageHandler = updateMessageHandler;
        this.finishedMessageHandler = finishedMessageHandler;
        this.errorMessageHandler = errorMessageHandler;
        this.defaultMessageHandler = defaultMessageHandler;
    },

    handleIncomingMessage: function (event) {
        console.log(event);

        var workerMessage = Serializer.deserialize(event.data);
        switch (workerMessage.type) {
            case WorkerMessage.MESSAGE_TYPE_INIT:
                // Map Worker to Plow
                var worker = event.target;
                var workerId = event.data.workerId;
                this.workers[workerId] = worker;
                if (this.workers[worker] !== null) {
                    this.workers[worker](workerId); // Call the workerId handler
                    delete this.workers[worker];
                }
                break;
            case WorkerMessage.MESSAGE_TYPE_ERROR:
                if (this.errorMessageHandler) {
                    this.errorMessageHandler(workerMessage);
                }
                break;
            case WorkerMessage.MESSAGE_TYPE_FINISHED:
                if (this.finishedMessageHandler) {
                    this.finishedMessageHandler(workerMessage);
                }
                break;
            case WorkerMessage.MESSAGE_TYPE_UPDATE:
                if (this.updateMessageHandler) {
                    this.updateMessageHandler(workerMessage);
                }
                break;
            default:
                if (this.defaultMessageHandler) {
                    this.defaultMessageHandler(workerMessage);
                }
                break;
        }
    },

    initWorker: function (workerScript, workerIdReceivedHandler) {
        var self = this;
        var worker = new Worker(workerScript);
        worker.addEventListener("message", function (event) {
            self.handleIncomingMessage(event);
        }, false);

        this.workers[worker] = workerIdReceivedHandler;
    },

    sendMessage: function (workerId, type, object) {
        var workerMessage = new WorkerMessage(type, object).toJSONObject();
        this.workers[workerId].postMessage(workerMessage);
    },

    start: function (workerId, initialData) {
        this.sendMessage(workerId, WorkerMessage.MESSAGE_TYPE_START, initialData);
    },

    pause: function (workerId) {
        this.sendMessage(workerId, WorkerMessage.MESSAGE_TYPE_PAUSE);
    },

    resume: function (workerId) {
        this.sendMessage(workerId, WorkerMessage.MESSAGE_TYPE_RESUME);
    },

    stop: function (workerId) {
        this.sendMessage(workerId, WorkerMessage.MESSAGE_TYPE_STOP);
    }
});

module.exports = Harness;
;return module.exports;}({},{});
var __m2 = function(module,exports){module.exports=exports;
var Class = __m7;
var Serializer = __m3;
var WorkerMessage = __m4;
var uuid = __m6;

var Plow = Class.extend({
    started: false,
    paused: false,
    cycle: 0,
    sendOnCyle: 0,
    uuid: null,

    initialDataHandler: null,
    defaultMessageHandler: null,
    createUpdateContentHandler: null,
    executeHandler: null,

    init: function (executeHandler, initialDataHandler, createUpdateContentHandler, defaultMessageHandler) {
        this.uuid = uuid.v4();
        this.executeHandler = executeHandler;
        this.initialDataHandler = initialDataHandler;
        this.createUpdateContentHandler = createUpdateContentHandler;
        this.defaultMessageHandler = defaultMessageHandler;

        // Let the Harness know that the Plow has been instantiated.
        this.sendMessage(WorkerMessage.MESSAGE_TYPE_INIT);
    },

    handleIncomingMessage: function (message) {
        console.log('Received message from main thread', message);

        var workerMessage = Serializer.deserialize(message);
        switch (workerMessage.type) {
            case WorkerMessage.MESSAGE_TYPE_START:
                this.start(Serializer.deserialize(message.content));
                break;
            case WorkerMessage.MESSAGE_TYPE_PAUSE:
                this.pause();
                break;
            case WorkerMessage.MESSAGE_TYPE_STOP:
                this.stop();
                break;
            case WorkerMessage.MESSAGE_TYPE_RESUME:
                this.resume();
                break;
            default:
                if (this.defaultMessageHandler) {
                    this.defaultMessageHandler(workerMessage);
                }
                break;
        }
    },

    listen: function () {
        var self = this;
        onmessage = function (event) {
            self.handleIncomingMessage(event.data);
        };
    },

    start: function (initialData) {
        this.currentSimulation = initialData;
        this.lastEventDateTimeMS = new Date().getTime();
        this.started = true;
        this.paused = false;

        this.initialDataHandler(initialData);

        this.run();
    },

    run: function () {
        while (this.started) {
            this.execute();
        }
    },

    execute: function () {
        if (this.started && !this.paused) {
            if (this.executeHandler) {
                this.executeHandler();
            }

            this.cycle++;
            if (this.sendOnCycle !== null && this.cycle % this.sendOnCyle === 0) {
                this.update();
            }
        }
    },

    error: function (content) {
        this.sendMessage(WorkerMessage.MESSAGE_TYPE_ERROR, content);
        this.stop();
    },

    finished: function (content) {
        this.sendMessage(WorkerMessage.MESSAGE_TYPE_FINISHED, content);
        this.stop();
    },

    update: function () {
        var content = null;
        if (this.createUpdateContentHandler) {
            content = this.createUpdateContentHandler();
        }
        this.sendMessage(WorkerMessage.MESSAGE_TYPE_UPDATE, content);
    },

    stop: function () {
        this.started = false;
    },

    pause: function () {
        this.paused = true;
    },

    resume: function () {
        this.paused = false;
    },

    sendMessage: function (type, content) {
        var workerMessage = new WorkerMessage(type, content, this.uuid).toJSONObject();
        postMessage(workerMessage);
    }
});

module.exports = Plow;
;return module.exports;}({},{});
var __m5 = function(module,exports){module.exports=exports;
exports.Serializer = __m3;
exports.BaseClass = __m0;
exports.WorkerMessage = __m4;
exports.Harness = __m1;
exports.Plow = __m2;
;return module.exports;}({},{});return __m5;}());