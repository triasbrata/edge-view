"use strict";
/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLOBALS = exports.safeValue = exports.Edge = void 0;
__exportStar(require("./src/Contracts"), exports);
const Edge_1 = require("./src/Edge");
Object.defineProperty(exports, "Edge", { enumerable: true, get: function () { return Edge_1.Edge; } });
const Context_1 = require("./src/Context");
Object.defineProperty(exports, "safeValue", { enumerable: true, get: function () { return Context_1.safeValue; } });
const globals_1 = require("./src/Edge/globals");
Object.defineProperty(exports, "GLOBALS", { enumerable: true, get: function () { return globals_1.GLOBALS; } });
/**
 * Default export
 */
const edge = new Edge_1.Edge();
Object.keys(globals_1.GLOBALS).forEach((key) => edge.global(key, globals_1.GLOBALS[key]));
exports.default = edge;
