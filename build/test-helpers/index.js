"use strict";
/*
 * edge-parser
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFilename = exports.normalizeNewLines = void 0;
const path_1 = require("path");
const os_1 = require("os");
const js_stringify_1 = __importDefault(require("js-stringify"));
function normalizeNewLines(value) {
    // eslint-disable-next-line @typescript-eslint/quotes
    return value.replace(/\+=\s"\\n"/g, `+= ${os_1.EOL === '\n' ? `"\\n"` : `"\\r\\n"`}`);
}
exports.normalizeNewLines = normalizeNewLines;
function normalizeFilename(basePath, value) {
    value = value.replace('{{__dirname}}', `${basePath}${path_1.sep}`);
    if (value.trim().startsWith('let $filename') || value.trim().startsWith('$filename =')) {
        return value.replace(/=\s"(.*)"/, (_, group) => `= ${js_stringify_1.default(group)}`);
    }
    return value;
}
exports.normalizeFilename = normalizeFilename;
