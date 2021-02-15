"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Assert_1 = require("japa/build/src/Assert");
Assert_1.Assert.use((chai) => {
    chai.assert.stringEqual = function stringEqual(val, exp, msg) {
        new chai.Assertion(val.split(/\r\n|\n/), msg).to.deep.equal(exp.split(/\r\n|\n/));
    };
});
