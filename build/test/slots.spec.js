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
const Slots_1 = require("../src/Component/Slots");
japa_1.default.group('Slots', () => {
    japa_1.default('render slot', (assert) => {
        const slots = new Slots_1.Slots({
            component: 'foo',
            slots: {
                main: () => 'hello',
            },
            caller: {
                filename: 'bar.edge',
                line: 1,
                col: 0,
            },
        });
        assert.equal(slots.render('main').value, 'hello');
    });
    japa_1.default('raise error when slot is missing', (assert) => {
        const slots = new Slots_1.Slots({
            component: 'foo',
            slots: {},
            caller: {
                filename: 'bar.edge',
                line: 1,
                col: 0,
            },
        });
        try {
            slots.render('main');
        }
        catch (error) {
            assert.equal(error.message, '"main" slot is required in order to render the "foo" component');
            assert.equal(error.filename, 'bar.edge');
            assert.equal(error.line, 1);
        }
    });
    japa_1.default('return empty string when slot is missing', (assert) => {
        const slots = new Slots_1.Slots({
            component: 'foo',
            slots: {},
            caller: {
                filename: 'bar.edge',
                line: 1,
                col: 0,
            },
        });
        assert.equal(slots.renderIfExists('main'), '');
    });
    japa_1.default('access slots directly', (assert) => {
        const slots = new Slots_1.Slots({
            component: 'foo',
            slots: {
                main: () => 'hello',
            },
            caller: {
                filename: 'bar.edge',
                line: 1,
                col: 0,
            },
        });
        assert.equal(slots['main'](), 'hello');
    });
});
