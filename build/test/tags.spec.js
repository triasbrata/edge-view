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
const japa_1 = __importDefault(require("japa"));
const path_1 = require("path");
const dedent_js_1 = __importDefault(require("dedent-js"));
const dev_utils_1 = require("@poppinss/dev-utils");
const tags = __importStar(require("../src/Tags"));
const Loader_1 = require("../src/Loader");
const Compiler_1 = require("../src/Compiler");
const Processor_1 = require("../src/Processor");
const fs = new dev_utils_1.Filesystem(path_1.join(__dirname, 'views'));
const loader = new Loader_1.Loader();
loader.mount('default', fs.basePath);
const processor = new Processor_1.Processor();
const compiler = new Compiler_1.Compiler(loader, tags, processor);
japa_1.default.group('If tag', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('raise errors on correct line with if tag', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `Hello everyone!
      We are writing a bad if condition

      @if(foo bar)
      @endif`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.message, 'Unexpected token ');
            assert.equal(error.line, 4);
        }
    });
    japa_1.default('raise errors when using sequence expression', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `Hello everyone!
      We are writing a bad if condition

      @if(foo, bar)
      @endif`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.line, 4);
            assert.equal(error.message, '"foo, bar" is not a valid argument type for the @if tag');
        }
    });
    japa_1.default('raise errors when expression was never closed', async (assert) => {
        assert.plan(1);
        const templateContent = dedent_js_1.default `Hello everyone!
      We are writing a bad if condition

      @if(foo, bar)`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.message, 'Unclosed tag if');
        }
    });
});
japa_1.default.group('Include', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('raise errors on correct line with include tag', async (assert) => {
        assert.plan(1);
        const templateContent = dedent_js_1.default `We are writing a bad include condition
    @include(foo bar)`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:2:13)`);
        }
    });
    japa_1.default('raise errors when using sequence expression', async (assert) => {
        assert.plan(2);
        const templateContent = "@include('foo', 'bar')";
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:1:9)`);
            assert.equal(error.message, "\"'foo', 'bar'\" is not a valid argument type for the @include tag");
        }
    });
});
japa_1.default.group('IncludeIf', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('raise errors when not passing sequence expression', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `We are writing a bad include condition
    @includeIf(foo)`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.message, '"foo" is not a valid argument type for the @includeIf tag');
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:2:11)`);
        }
    });
    japa_1.default('raise errors when passing more than 2 arguments', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `We are writing a bad include condition
    @includeIf(foo, bar, baz)`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.message, '@includeIf expects a total of 2 arguments');
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:2:11)`);
        }
    });
    japa_1.default('raise errors when 1st argument is a sequence expression', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `We are writing a bad include condition
    @includeIf((foo, bar), baz)`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.message, '"SequenceExpression" is not a valid 1st argument type for the @includeIf tag');
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:2:12)`);
        }
    });
});
japa_1.default.group('Component', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('raise errors when slot name is not defined as a literal', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `@component('bar')
      @slot(hello)
      @endslot

      @endcomponent`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:2:6)`);
            assert.equal(error.message, '"hello" is not a valid argument type for the @slot tag');
        }
    });
    japa_1.default('raise errors when slot has more than 2 arguments', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `@component('bar')
      @slot('hello', props, propsAgain)
      @endslot

      @endcomponent`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:2:6)`);
            assert.equal(error.message, 'maximum of 2 arguments are allowed for @slot tag');
        }
    });
    japa_1.default('raise errors when slot first argument is not a literal', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `@component('bar')
      @slot(hello, props)
      @endslot

      @endcomponent`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:2:6)`);
            assert.equal(error.message, 'slot name must be a valid string literal');
        }
    });
    japa_1.default('raise errors when slot 2nd argument is not an identifier', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `@component('bar')
      @slot(
        'hello',
        'props'
      )
      @endslot

      @endcomponent`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:4:2)`);
            assert.equal(error.message, '"\'props\'" is not valid prop identifier for @slot tag');
        }
    });
    japa_1.default('raise error when slot is inside a conditional block', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `@component('bar')

      @if(username)
        @slot('header')
        @endslot
      @endif

      @endcomponent`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:4:8)`);
            assert.equal(error.message, '@slot tag must appear as top level tag inside the @component tag');
        }
    });
});
japa_1.default.group('Layouts', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('raise error when section is nested inside conditional block', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `@layout('master')

      @if(username)
        @section('body')
          <p> Hello world </p>
        @endsection
      @endif`;
        await fs.add('foo.edge', templateContent);
        await fs.add('master.edge', "@!section('body')");
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:3:4)`);
            assert.equal(error.message, 'Template extending a layout can only use "@section" or "@set" tags as top level nodes');
        }
    });
    japa_1.default('raise error when section is not a top level tag inside nested layouts', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `@layout('master')

      @if(username)
        @section('body')
          <p> Hello world </p>
        @endsection
      @endif`;
        await fs.add('foo.edge', templateContent);
        await fs.add('master.edge', "@layout('super')");
        await fs.add('super.edge', "@!section('body')");
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:3:4)`);
            assert.equal(error.message, 'Template extending a layout can only use "@section" or "@set" tags as top level nodes');
        }
    });
    japa_1.default('raise error when there are raw content outside sections', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `@layout('master')
      <p> Hello world </p>`;
        await fs.add('foo.edge', templateContent);
        await fs.add('master.edge', "@!section('body')");
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.stack.split('\n')[1], `    at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:2:0)`);
            assert.equal(error.message, 'Template extending a layout can only use "@section" or "@set" tags as top level nodes');
        }
    });
});
japa_1.default.group('Each tag', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('raise errors when arg is not a binary expression', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `Hello everyone!
      We are writing a bad each condition

      @each(users)
      @endeach`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.message, '"users" is not valid expression for the @each tag');
            assert.equal(error.line, 4);
        }
    });
    japa_1.default('raise errors when lhs of binary expression is not an indentifier', async (assert) => {
        assert.plan(2);
        const templateContent = dedent_js_1.default `Hello everyone!
      We are writing a bad each condition

      @each('user' in users)
      @endeach`;
        await fs.add('foo.edge', templateContent);
        try {
            compiler.compile('foo');
        }
        catch (error) {
            assert.equal(error.message, 'invalid left hand side "Literal" expression for the @each tag');
            assert.equal(error.line, 4);
        }
    });
});
