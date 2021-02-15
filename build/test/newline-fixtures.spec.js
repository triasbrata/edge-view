"use strict";
/*
 * edge-parser
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./assert-extend");
const japa_1 = __importDefault(require("japa"));
const path_1 = require("path");
const fs_1 = require("fs");
const tags = __importStar(require("../src/Tags"));
const Loader_1 = require("../src/Loader");
const Context_1 = require("../src/Context");
const Template_1 = require("../src/Template");
const Compiler_1 = require("../src/Compiler");
const Processor_1 = require("../src/Processor");
const test_helpers_1 = require("../test-helpers");
const basePath = path_1.join(__dirname, '../newline-fixtures');
const loader = new Loader_1.Loader();
loader.mount('default', basePath);
const processor = new Processor_1.Processor();
const compiler = new Compiler_1.Compiler(loader, tags, processor);
japa_1.default.group('Newline Fixtures', (group) => {
    group.before(() => {
        Object.keys(tags).forEach((tag) => {
            if (tags[tag].run) {
                tags[tag].run(Context_1.Context);
            }
        });
    });
    const dirs = fs_1.readdirSync(basePath).filter((file) => fs_1.statSync(path_1.join(basePath, file)).isDirectory());
    dirs.forEach((dir) => {
        const dirBasePath = path_1.join(basePath, dir);
        japa_1.default(dir, (assert) => {
            const template = new Template_1.Template(compiler, {}, {}, processor);
            /**
             * Render output
             */
            const out = test_helpers_1.normalizeNewLines(fs_1.readFileSync(path_1.join(dirBasePath, 'index.txt'), 'utf-8'));
            const state = JSON.parse(fs_1.readFileSync(path_1.join(dirBasePath, 'index.json'), 'utf-8'));
            const output = template.render(`${dir}/index.edge`, state);
            assert.stringEqual(output, out
                .split('\n')
                .map((line) => test_helpers_1.normalizeFilename(dirBasePath, line))
                .join('\n'));
        });
    });
});
