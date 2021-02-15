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
const Props_1 = require("../src/Component/Props");
japa_1.default.group('Props', () => {
    japa_1.default('find if props has value', (assert) => {
        const props = new Props_1.Props({
            component: 'foo',
            state: { title: 'Hello' },
        });
        assert.isTrue(props.has('title'));
    });
    japa_1.default('cherry pick values from the props', (assert) => {
        const props = new Props_1.Props({
            component: 'foo',
            state: { title: 'Hello', label: 'Hello world', actionText: 'Confirm' },
        });
        assert.deepEqual(props.only(['label', 'actionText']), {
            label: 'Hello world',
            actionText: 'Confirm',
        });
    });
    japa_1.default('get values except for the defined keys from the props', (assert) => {
        const props = new Props_1.Props({
            component: 'foo',
            state: { title: 'Hello', label: 'Hello world', actionText: 'Confirm' },
        });
        assert.deepEqual(props.except(['label', 'actionText']), {
            title: 'Hello',
        });
    });
    japa_1.default('serialize props to html attributes', (assert) => {
        const props = new Props_1.Props({
            component: 'foo',
            state: {
                class: ['foo', 'bar'],
                onclick: 'foo = bar',
            },
        });
        assert.equal(props.serialize().value, ' class="foo bar" onclick="foo = bar"');
    });
    japa_1.default('serialize by merging custom properties', (assert) => {
        const props = new Props_1.Props({
            component: 'foo',
            state: {
                class: ['foo', 'bar'],
                onclick: 'foo = bar',
            },
        });
        assert.equal(props.serialize({ id: '1' }).value, ' class="foo bar" onclick="foo = bar" id="1"');
    });
    japa_1.default('serialize specific keys to html attributes', (assert) => {
        const props = new Props_1.Props({
            component: 'foo',
            state: {
                class: ['foo', 'bar'],
                onclick: 'foo = bar',
            },
        });
        assert.equal(props.serializeOnly(['class']).value, ' class="foo bar"');
    });
    japa_1.default('serialize specific keys to merge custom properties', (assert) => {
        const props = new Props_1.Props({
            component: 'foo',
            state: {
                class: ['foo', 'bar'],
                onclick: 'foo = bar',
            },
        });
        assert.equal(props.serializeOnly(['class'], { id: '1' }).value, ' class="foo bar" id="1"');
    });
    japa_1.default('serialize all except defined keys to html attributes', (assert) => {
        const props = new Props_1.Props({
            component: 'foo',
            state: {
                class: ['foo', 'bar'],
                onclick: 'foo = bar',
            },
        });
        assert.equal(props.serializeExcept(['class']).value, ' onclick="foo = bar"');
    });
    japa_1.default('serialize specific keys to merge custom properties', (assert) => {
        const props = new Props_1.Props({
            component: 'foo',
            state: {
                class: ['foo', 'bar'],
                onclick: 'foo = bar',
            },
        });
        assert.equal(props.serializeExcept(['class'], { id: '1' }).value, ' onclick="foo = bar" id="1"');
    });
    japa_1.default('copy state properties to the props class', (assert) => {
        const props = new Props_1.Props({
            component: 'foo',
            state: {
                class: ['foo', 'bar'],
                onclick: 'foo = bar',
            },
        });
        assert.deepEqual(props['class'], ['foo', 'bar']);
        assert.deepEqual(props['onclick'], 'foo = bar');
    });
    japa_1.default('access nested state properties from the props instance', (assert) => {
        const props = new Props_1.Props({
            component: 'foo',
            state: {
                user: {
                    name: 'virk',
                },
            },
        });
        assert.equal(props['user']['name'], 'virk');
    });
    japa_1.default('do not raise error when state is undefined', () => {
        new Props_1.Props({
            component: 'foo',
            state: undefined,
        });
    });
    japa_1.default('do not raise error when state is null', () => {
        new Props_1.Props({
            component: 'foo',
            state: null,
        });
    });
});
