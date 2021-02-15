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
const path_1 = require("path");
const dedent_js_1 = __importDefault(require("dedent-js"));
const dev_utils_1 = require("@poppinss/dev-utils");
const Edge_1 = require("../src/Edge");
const test_helpers_1 = require("../test-helpers");
require("./assert-extend");
const fs = new dev_utils_1.Filesystem(path_1.join(__dirname, 'views'));
japa_1.default.group('Template FileName', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('print file absolute path', async (assert) => {
        await fs.add('foo.edge', '{{ $filename }}');
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        const output = edge.render('foo', {});
        assert.equal(output.trim(), path_1.join(fs.basePath, 'foo.edge'));
    });
    japa_1.default('print file absolute path inside a partial', async (assert) => {
        await fs.add('foo.edge', dedent_js_1.default `
			@include('bar')
			{{ $filename }}
		`);
        await fs.add('bar.edge', '{{ $filename }}');
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        const output = edge.render('foo', {});
        assert.stringEqual(output.trim(), test_helpers_1.normalizeNewLines(dedent_js_1.default `
				${path_1.join(fs.basePath, 'bar.edge')}
				${path_1.join(fs.basePath, 'foo.edge')}
			`));
    });
    japa_1.default('print file absolute path inside a layout', async (assert) => {
        await fs.add('foo.edge', dedent_js_1.default `
			@layout('master')
			@section('content')
				@super
				{{ $filename }}
			@endsection
		`);
        await fs.add('master.edge', dedent_js_1.default `
			@section('content')
				{{ $filename }}
			@endsection
		`);
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        const output = edge.render('foo', {});
        assert.stringEqual(output.trim(), test_helpers_1.normalizeNewLines(dedent_js_1.default `
				${path_1.join(fs.basePath, 'master.edge')}
					${path_1.join(fs.basePath, 'foo.edge')}
			`));
    });
    japa_1.default('print file absolute path inside a partial', async (assert) => {
        await fs.add('foo.edge', dedent_js_1.default `
			@include('bar')
			{{ $filename }}
		`);
        await fs.add('bar.edge', '{{ $filename }}');
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        const output = edge.render('foo', {});
        assert.stringEqual(output.trim(), test_helpers_1.normalizeNewLines(dedent_js_1.default `
				${path_1.join(fs.basePath, 'bar.edge')}
				${path_1.join(fs.basePath, 'foo.edge')}
			`));
    });
    japa_1.default('print file absolute path inside a component', async (assert) => {
        await fs.add('foo.edge', dedent_js_1.default `
			@component('button')
				@slot('text')
				{{ $filename }}
				@endslot
			@endcomponent
		`);
        await fs.add('button.edge', dedent_js_1.default `
			{{{ $slots.text() }}}
			{{ $filename }}
		`);
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        const output = edge.render('foo', {});
        assert.stringEqual(output.trim(), test_helpers_1.normalizeNewLines(dedent_js_1.default `
				${path_1.join(fs.basePath, 'foo.edge')}
				${path_1.join(fs.basePath, 'button.edge')}
			`));
    });
});
