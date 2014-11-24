var Class = require('../node_modules/class.extend/lib/class.js');
var Serializer = require('Serializer.js');
var WorkerMessage = require('WorkerMessage');
var uuid = require('uuid');

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