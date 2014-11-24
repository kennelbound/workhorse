importScripts('../distrib/workhorse.js');

var plow = null;

var worker = {
    current: 0,

    execute: function () {
        worker.current += 1;

        console.log("Current state", worker.current);
        if (worker.current > 1000) {
            plow.update();
            plow.finished();
        }
    },

    defaultMessageHandler: function (workerMessage) {
        console.log("Received message", workerMessage);
    },

    updateContent: function () {
        return {current: worker.current};
    },

    initData: function (data) {
        if (data && data.current) {
            worker.current = data.current;
        }
    }
};

plow = new workhorse.Plow(worker.execute, worker.initData, worker.updateContent, worker.defaultMessageHandler);
plow.sendOnCycle = 100;
plow.listen();

