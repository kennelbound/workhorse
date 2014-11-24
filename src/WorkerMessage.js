var BaseClass = require('BaseClass.js');
var Serializer = require('Serializer.js');

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