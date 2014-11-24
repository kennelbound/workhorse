describe("Serializer Tests", function () {
    var TestClass = workhorse.BaseClass.extend({
        _classname: 'TestClass',
        init: function (purpose) {
            this.purpose = purpose;
        },

        toJSONObject: function () {
            return this._extend(this._super(), this.getJSONProperty('purpose'));
        }
    });

    TestClass.deserialize = function (obj) {
        var testClass = new TestClass(obj.purpose);
        testClass._rehydrate(obj);
        return testClass;
    };

    workhorse.Serializer.registerClass(TestClass.prototype._classname, TestClass.deserialize);

    var instance = new TestClass('dat purpose');
    var serialized = workhorse.Serializer.serialize(instance);

    it('serializes BaseClass instances', function () {
        expect(serialized).to.have.property('purpose', instance.purpose);
        expect(serialized).to.have.property('_classname', instance._classname);
        expect(serialized).to.have.property('uuid', instance.uuid);
    });

    var object = {car: 'talk', is: {'the': 'very'}, best: ['show']};
    var serializedObject = workhorse.Serializer.serialize(object);

    it('serializes Object instances', function () {
        expect(serializedObject).to.have.property('car', object.car);
        expect(serializedObject).to.have.deep.property('is.the', 'very');
        expect(serializedObject).to.have.deep.property('best[0]', 'show');
    });

    it('deserializes BaseClass instances', function () {
        var deserialized = workhorse.Serializer.deserialize(serialized);
        expect(deserialized).to.have.property('purpose', instance.purpose);
        expect(deserialized).to.have.property('_classname', instance._classname);
        expect(deserialized).to.have.property('uuid', instance.uuid);
        expect(deserialized).to.be.instanceof(TestClass);
    });

    it('deserializes Object instances', function () {
        var deserialized = workhorse.Serializer.deserialize(serializedObject);
        expect(deserialized).to.have.property('car', object.car);
        expect(deserialized).to.have.deep.property('is.the', 'very');
        expect(deserialized).to.have.deep.property('best[0]', 'show');
    });
});