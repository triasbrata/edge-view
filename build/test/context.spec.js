"use strict";
/*
 * edge
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
const japa_1 = __importDefault(require("japa"));
const Context_1 = require("../src/Context");
japa_1.default.group('Context', (group) => {
    group.afterEach(() => {
        Context_1.Context.hydrate();
    });
    japa_1.default('escape HTML', (assert) => {
        const context = new Context_1.Context();
        assert.equal(context.escape('<h2> Hello world </h2>'), '&lt;h2&gt; Hello world &lt;/h2&gt;');
    });
    japa_1.default('do not escape values, which are not string', (assert) => {
        const context = new Context_1.Context();
        assert.equal(context.escape(22), 22);
    });
    japa_1.default('do not escape values, which instance of safe value', (assert) => {
        const context = new Context_1.Context();
        assert.equal(context.escape(Context_1.safeValue('<h2> Hello world </h2>')), '<h2> Hello world </h2>');
    });
    japa_1.default('add macros to context', (assert) => {
        Context_1.Context.macro('upper', (username) => {
            return username.toUpperCase();
        });
        const context = new Context_1.Context();
        assert.equal(context['upper']('virk'), 'VIRK');
    });
    japa_1.default('add getters to context', (assert) => {
        Context_1.Context.getter('username', function username() {
            return 'virk';
        });
        const context = new Context_1.Context();
        assert.equal(context['username'], 'virk');
    });
});
