var Class = require('../node_modules/class.extend/lib/class.js');
var uuid = require('uuid.js');
var Serializer = require('Serializer.js');

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
