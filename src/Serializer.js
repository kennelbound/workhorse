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