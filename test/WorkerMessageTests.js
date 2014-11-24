describe("WorkerMessage Tests", function () {
    it('has the appropriate content', function () {
        var testObject = {'test': 'data'};
        var message = new workhorse.WorkerMessage('', testObject);
        expect(message).to.have.property('content', testObject);
    });

    it('converts BaseClasses to JSON objects', function () {
        var baseInstance = new workhorse.BaseClass();
        baseInstance.name = 'My little pony';

        var message = new workhorse.WorkerMessage('', baseInstance);
        expect(message).to.have.deep.property('content.name', 'My little pony');
        expect(message).to.have.deep.property('content._classname', 'BaseClass');
    });

    it('converts BaseClass extensions to JSON objects', function () {
        var TestClass = workhorse.BaseClass.extend({
            _classname: 'TestClass',
            init: function (spore) {
                this.spore = spore;
            },

            toJSONObject: function () {
                return this._extend(this._super(), this.getJSONProperty('spore'));
            }
        });

        var instance = new TestClass('sporename');
        message = new workhorse.WorkerMessage('', instance);
        expect(message).to.have.deep.property('content.name');
        expect(message).to.have.deep.property('content.spore', 'sporename');
        expect(message).to.have.deep.property('content._classname', 'TestClass');
    });
});