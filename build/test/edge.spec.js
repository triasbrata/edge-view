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
require("./assert-extend");
const japa_1 = __importDefault(require("japa"));
const path_1 = require("path");
const dedent_js_1 = __importDefault(require("dedent-js"));
const dev_utils_1 = require("@poppinss/dev-utils");
const Edge_1 = require("../src/Edge");
const globals_1 = require("../src/Edge/globals");
const fs = new dev_utils_1.Filesystem(path_1.join(__dirname, 'views'));
japa_1.default.group('Edge', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('mount default disk', (assert) => {
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        assert.deepEqual(edge.loader.mounted, { default: fs.basePath });
    });
    japa_1.default('mount named disk', (assert) => {
        const edge = new Edge_1.Edge();
        edge.mount('foo', fs.basePath);
        assert.deepEqual(edge.loader.mounted, { foo: fs.basePath });
    });
    japa_1.default('unmount named disk', (assert) => {
        const edge = new Edge_1.Edge();
        edge.mount('foo', fs.basePath);
        edge.unmount('foo');
        assert.deepEqual(edge.loader.mounted, {});
    });
    japa_1.default('register globals', (assert) => {
        const edge = new Edge_1.Edge();
        edge.global('foo', 'bar');
        assert.deepEqual(edge.GLOBALS.foo, 'bar');
    });
    japa_1.default('add a custom tag to the tags list', (assert) => {
        const edge = new Edge_1.Edge();
        class MyTag {
            static compile() { }
        }
        MyTag.tagName = 'mytag';
        MyTag.block = true;
        MyTag.seekable = true;
        edge.registerTag(MyTag);
        assert.deepEqual(edge.compiler['tags'].mytag, MyTag);
    });
    japa_1.default('invoke tag run method when registering the tag', (assert) => {
        assert.plan(2);
        const edge = new Edge_1.Edge();
        class MyTag {
            static compile() { }
            static run() {
                assert.isTrue(true);
            }
        }
        MyTag.tagName = 'mytag';
        MyTag.block = true;
        MyTag.seekable = true;
        edge.registerTag(MyTag);
        assert.deepEqual(edge.compiler['tags'].mytag, MyTag);
    });
    japa_1.default('render a view using the render method', async (assert) => {
        const edge = new Edge_1.Edge();
        await fs.add('foo.edge', 'Hello {{ username }}');
        edge.mount(fs.basePath);
        assert.equal(edge.render('foo', { username: 'virk' }).trim(), 'Hello virk');
    });
    japa_1.default('pass locals to the view context', async (assert) => {
        const edge = new Edge_1.Edge();
        await fs.add('foo.edge', "Hello {{ username || 'guest' }}");
        edge.mount(fs.basePath);
        const tmpl = edge.getRenderer();
        tmpl.share({ username: 'nikk' });
        assert.equal(tmpl.render('foo', {}).trim(), 'Hello nikk');
        assert.equal(edge.render('foo', {}).trim(), 'Hello guest');
    });
    japa_1.default('register a template as a string', async (assert) => {
        const edge = new Edge_1.Edge();
        edge.registerTemplate('foo', {
            template: 'Hello {{ username }}',
        });
        assert.equal(edge.render('foo', { username: 'virk' }).trim(), 'Hello virk');
    });
    japa_1.default('register a template on a named disk', async (assert) => {
        const edge = new Edge_1.Edge();
        edge.mount('hello', fs.basePath);
        edge.registerTemplate('hello::foo', {
            template: 'Hello {{ username }}',
        });
        assert.equal(edge.render('hello::foo', { username: 'virk' }).trim(), 'Hello virk');
    });
    japa_1.default('pass absolute path of template to lexer errors', async (assert) => {
        assert.plan(1);
        await fs.add('foo.edge', '@if(1 + 1)');
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        try {
            edge.render('foo', false);
        }
        catch ({ stack }) {
            assert.equal(stack.split('\n')[1].trim(), `at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:1:4)`);
        }
    });
    japa_1.default('pass absolute path of template to parser errors', async (assert) => {
        assert.plan(1);
        await fs.add('foo.edge', 'Hello {{ a,:b }}');
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        try {
            edge.render('foo', false);
        }
        catch ({ stack }) {
            assert.equal(stack.split('\n')[1].trim(), `at anonymous (${path_1.join(fs.basePath, 'foo.edge')}:1:11)`);
        }
    });
    japa_1.default('pass absolute path of layout to lexer errors', async (assert) => {
        assert.plan(1);
        await fs.add('foo.edge', "@layout('bar')");
        await fs.add('bar.edge', '@if(username)');
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        try {
            edge.render('foo', false);
        }
        catch ({ stack }) {
            assert.equal(stack.split('\n')[1].trim(), `at anonymous (${path_1.join(fs.basePath, 'bar.edge')}:1:4)`);
        }
    });
    japa_1.default('pass absolute path of layout to parser errors', async (assert) => {
        assert.plan(1);
        await fs.add('foo.edge', "@layout('bar')");
        await fs.add('bar.edge', '{{ a:b }}');
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        try {
            edge.render('foo', false);
        }
        catch ({ stack }) {
            assert.equal(stack.split('\n')[1].trim(), `at anonymous (${path_1.join(fs.basePath, 'bar.edge')}:1:3)`);
        }
    });
    japa_1.default('pass absolute path of partial to lexer errors', async (assert) => {
        assert.plan(1);
        await fs.add('foo.edge', "@include('bar')");
        await fs.add('bar.edge', '@if(username)');
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        try {
            edge.render('foo', false);
        }
        catch ({ stack }) {
            assert.equal(stack.split('\n')[1].trim(), `at anonymous (${path_1.join(fs.basePath, 'bar.edge')}:1:4)`);
        }
    });
    japa_1.default('pass absolute path of partial to parser errors', async (assert) => {
        assert.plan(1);
        await fs.add('foo.edge', "@include('bar')");
        await fs.add('bar.edge', '{{ a:b }}');
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        try {
            edge.render('foo', false);
        }
        catch ({ stack }) {
            assert.equal(stack.split('\n')[1].trim(), `at anonymous (${path_1.join(fs.basePath, 'bar.edge')}:1:3)`);
        }
    });
    japa_1.default('pass absolute path of component to lexer errors', async (assert) => {
        assert.plan(1);
        await fs.add('foo.edge', "@!component('bar')");
        await fs.add('bar.edge', '@if(username)');
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        try {
            edge.render('foo', false);
        }
        catch ({ stack }) {
            assert.equal(stack.split('\n')[1].trim(), `at anonymous (${path_1.join(fs.basePath, 'bar.edge')}:1:4)`);
        }
    });
    japa_1.default('pass absolute path of component to parser errors', async (assert) => {
        assert.plan(1);
        await fs.add('foo.edge', "@!component('bar')");
        await fs.add('bar.edge', '{{ a:b }}');
        const edge = new Edge_1.Edge();
        edge.mount(fs.basePath);
        try {
            edge.render('foo', false);
        }
        catch ({ stack }) {
            assert.equal(stack.split('\n')[1].trim(), `at anonymous (${path_1.join(fs.basePath, 'bar.edge')}:1:3)`);
        }
    });
    japa_1.default('register and call plugins before rendering a view', async (assert) => {
        assert.plan(3);
        const edge = new Edge_1.Edge();
        edge.use(($edge) => {
            assert.deepEqual($edge.loader.mounted, { hello: fs.basePath });
            assert.deepEqual(edge.loader.templates, {
                'hello::foo': { template: 'Hello {{ username }}' },
            });
        });
        edge.mount('hello', fs.basePath);
        edge.registerTemplate('hello::foo', {
            template: 'Hello {{ username }}',
        });
        assert.equal(edge.render('hello::foo', { username: 'virk' }).trim(), 'Hello virk');
    });
    japa_1.default('do not run plugins until a view is rendered', async (assert) => {
        assert.plan(0);
        const edge = new Edge_1.Edge();
        edge.use(($edge) => {
            assert.deepEqual($edge.loader.mounted, { hello: fs.basePath });
            assert.deepEqual(edge.loader.templates, {
                'hello::foo': { template: 'Hello {{ username }}' },
            });
        });
        edge.mount('hello', fs.basePath);
        edge.registerTemplate('hello::foo', {
            template: 'Hello {{ username }}',
        });
    });
    japa_1.default('run plugins only once', async (assert) => {
        assert.plan(5);
        const edge = new Edge_1.Edge();
        edge.use(($edge) => {
            assert.deepEqual($edge.loader.mounted, { hello: fs.basePath });
            assert.deepEqual(edge.loader.templates, {
                'hello::foo': { template: 'Hello {{ username }}' },
            });
        });
        edge.mount('hello', fs.basePath);
        edge.registerTemplate('hello::foo', {
            template: 'Hello {{ username }}',
        });
        assert.equal(edge.render('hello::foo', { username: 'virk' }).trim(), 'Hello virk');
        assert.equal(edge.render('hello::foo', { username: 'virk' }).trim(), 'Hello virk');
        assert.equal(edge.render('hello::foo', { username: 'virk' }).trim(), 'Hello virk');
    });
    japa_1.default('run recurring plugins again and again', async (assert) => {
        assert.plan(9);
        const edge = new Edge_1.Edge();
        edge.use(($edge) => {
            assert.deepEqual($edge.loader.mounted, { hello: fs.basePath });
            assert.deepEqual(edge.loader.templates, {
                'hello::foo': { template: 'Hello {{ username }}' },
            });
        }, { recurring: true });
        edge.mount('hello', fs.basePath);
        edge.registerTemplate('hello::foo', {
            template: 'Hello {{ username }}',
        });
        assert.equal(edge.render('hello::foo', { username: 'virk' }).trim(), 'Hello virk');
        assert.equal(edge.render('hello::foo', { username: 'virk' }).trim(), 'Hello virk');
        assert.equal(edge.render('hello::foo', { username: 'virk' }).trim(), 'Hello virk');
    });
});
japa_1.default.group('Edge | regression', () => {
    japa_1.default('render non-existy values', (assert) => {
        const edge = new Edge_1.Edge();
        edge.registerTemplate('numeric', {
            template: 'Total {{ total }}',
        });
        edge.registerTemplate('boolean', {
            template: 'Is Active {{ isActive }}',
        });
        assert.equal(edge.render('numeric', { total: 0 }), 'Total 0');
        assert.equal(edge.render('boolean', { isActive: false }), 'Is Active false');
    });
    japa_1.default('render inline scripts with regex', (assert) => {
        const edge = new Edge_1.Edge();
        edge.registerTemplate('eval', {
            template: dedent_js_1.default `
      <script type="text/javascript">
        var pl = /\+/g
      </script>
      `,
        });
        assert.stringEqual(edge.render('eval'), dedent_js_1.default `
      <script type="text/javascript">
        var pl = /\+/g
      </script>
    `);
    });
    japa_1.default('render complex binary expressions', (assert) => {
        const edge = new Edge_1.Edge();
        edge.registerTemplate('eval', {
            template: dedent_js_1.default `
      {{
        line.lineName + (
          (user.line.id === line.id)
            ? ' (current)' :
            (' (' + (line.user.username || 'unselected') + ')')
          )
      }}`,
        });
        assert.equal(edge.render('eval', {
            line: { id: 1, lineName: 'aaa', user: {} },
            user: { line: {} },
        }), dedent_js_1.default `
      aaa (unselected)
    `);
    });
    japa_1.default('do not escape when using safe global method', (assert) => {
        const edge = new Edge_1.Edge();
        Object.keys(globals_1.GLOBALS).forEach((key) => edge.global(key, globals_1.GLOBALS[key]));
        edge.registerTemplate('eval', {
            template: 'Hello {{ safe(username) }}',
        });
        assert.equal(edge.render('eval', { username: '<p>virk</p>' }), 'Hello <p>virk</p>');
    });
    japa_1.default('truncate string by characters', (assert) => {
        const edge = new Edge_1.Edge();
        Object.keys(globals_1.GLOBALS).forEach((key) => edge.global(key, globals_1.GLOBALS[key]));
        edge.registerTemplate('eval', {
            template: '{{{ truncate(text, 10) }}}',
        });
        assert.equal(edge.render('eval', { text: '<p>hello world & universe</p>' }), '<p>hello world...</p>');
    });
    japa_1.default('truncate string by characters in strict mode', (assert) => {
        const edge = new Edge_1.Edge();
        Object.keys(globals_1.GLOBALS).forEach((key) => edge.global(key, globals_1.GLOBALS[key]));
        edge.registerTemplate('eval', {
            template: '{{{ truncate(text, 10, { strict: true }) }}}',
        });
        assert.equal(edge.render('eval', { text: '<p>hello world & universe</p>' }), '<p>hello worl...</p>');
    });
    japa_1.default('define custom suffix for truncate', (assert) => {
        const edge = new Edge_1.Edge();
        Object.keys(globals_1.GLOBALS).forEach((key) => edge.global(key, globals_1.GLOBALS[key]));
        edge.registerTemplate('eval', {
            template: '{{{ truncate(text, 10, { suffix: ". more" }) }}}',
        });
        assert.equal(edge.render('eval', { text: '<p>hello world & universe</p>' }), '<p>hello world. more</p>');
    });
    japa_1.default('generate string excerpt', (assert) => {
        const edge = new Edge_1.Edge();
        Object.keys(globals_1.GLOBALS).forEach((key) => edge.global(key, globals_1.GLOBALS[key]));
        edge.registerTemplate('eval', {
            template: '{{{ excerpt(text, 10) }}}',
        });
        assert.equal(edge.render('eval', { text: '<p>hello world & universe</p>' }), 'hello world...');
    });
    japa_1.default('excerpt remove in-between tag', (assert) => {
        const edge = new Edge_1.Edge();
        Object.keys(globals_1.GLOBALS).forEach((key) => edge.global(key, globals_1.GLOBALS[key]));
        edge.registerTemplate('eval', {
            template: '{{{ excerpt(text, 10) }}}',
        });
        assert.equal(edge.render('eval', {
            text: '<p>hello <strong>world</strong> & <strong>universe</strong></p>',
        }), 'hello world...');
    });
    japa_1.default('generate excerpt in strict mode', (assert) => {
        const edge = new Edge_1.Edge();
        Object.keys(globals_1.GLOBALS).forEach((key) => edge.global(key, globals_1.GLOBALS[key]));
        edge.registerTemplate('eval', {
            template: '{{{ excerpt(text, 10, { strict: true }) }}}',
        });
        assert.equal(edge.render('eval', {
            text: '<p>hello <strong>world</strong> & <strong>universe</strong></p>',
        }), 'hello worl...');
    });
    japa_1.default('add custom suffix for excerpt', (assert) => {
        const edge = new Edge_1.Edge();
        Object.keys(globals_1.GLOBALS).forEach((key) => edge.global(key, globals_1.GLOBALS[key]));
        edge.registerTemplate('eval', {
            template: '{{{ excerpt(text, 10, { suffix: ". more" }) }}}',
        });
        assert.equal(edge.render('eval', {
            text: '<p>hello <strong>world</strong> & <strong>universe</strong></p>',
        }), 'hello world. more');
    });
});
