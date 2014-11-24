var Class = require('../node_modules/class.extend/lib/class.js');
var Serializer = require('Serializer.js');
var WorkerMessage = require('WorkerMessage.js');

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