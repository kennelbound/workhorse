describe("BaseClass Tests", function () {
    var TestClass = workhorse.BaseClass.extend({
        _classname: 'TestClass',
        init: function (purpose) {
            this.purpose = purpose;
        },

        toJSONObject: function () {
            return this._extend(this._super(), this.getJSONProperty('purpose'));
        }
    });

    it('is a function', function () {
        expect(TestClass).to.be.an.instanceof(Function);
    });

    var purpose = 'My Purpose';
    var testInstance = new TestClass(purpose);

    it('is a class', function () {
        expect(testInstance).to.be.an.instanceof(TestClass);
        expect(testInstance.purpose).to.equal(purpose);
    });

    var jsonObject = testInstance.toJSONObject();
    it('serializes appropriately', function () {
        expect(jsonObject).to.have.property('_classname', 'TestClass');
        expect(jsonObject).to.have.property('purpose', purpose);
    });
});