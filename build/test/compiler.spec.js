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
const js_stringify_1 = __importDefault(require("js-stringify"));
const dev_utils_1 = require("@poppinss/dev-utils");
const edge_lexer_1 = require("edge-lexer");
const Loader_1 = require("../src/Loader");
const Context_1 = require("../src/Context");
const Set_1 = require("../src/Tags/Set");
const Compiler_1 = require("../src/Compiler");
const Processor_1 = require("../src/Processor");
const Layout_1 = require("../src/Tags/Layout");
const Section_1 = require("../src/Tags/Section");
const Component_1 = require("../src/Tags/Component");
const test_helpers_1 = require("../test-helpers");
require("./assert-extend");
const fs = new dev_utils_1.Filesystem(path_1.join(__dirname, 'views'));
japa_1.default.group('Compiler | Cache', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('compile template', async (assert) => {
        await fs.add('foo.edge', 'Hello {{ username }}');
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {}, new Processor_1.Processor());
        const { template } = compiler.compile('foo');
        assert.stringEqual(template, test_helpers_1.normalizeNewLines(dedent_js_1.default `let out = "";
      let $lineNumber = 1;
      let $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'foo.edge'))};
      try {
      out += "Hello ";
      out += \`\${ctx.escape(state.username)}\`;
      } catch (error) {
      ctx.reThrow(error, $filename, $lineNumber);
      }
      return out;`));
    });
    japa_1.default('save template to cache when caching is turned on', async (assert) => {
        await fs.add('foo.edge', 'Hello {{ username }}');
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {}, new Processor_1.Processor(), { cache: true });
        assert.equal(compiler.compile('foo').template, compiler.cacheManager.get(path_1.join(fs.basePath, 'foo.edge')).template);
    });
    japa_1.default('do not cache template when caching is turned off', async (assert) => {
        await fs.add('foo.edge', 'Hello {{ username }}');
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {}, new Processor_1.Processor(), { cache: false });
        compiler.compile('foo');
        assert.isUndefined(compiler.cacheManager.get(path_1.join(fs.basePath, 'foo.edge')));
    });
});
japa_1.default.group('Compiler | Tokenize', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('during tokenize, merge @section tags of a given layout', async (assert) => {
        await fs.add('master.edge', dedent_js_1.default `
      Master page
      @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
      @layout('master')
      @section('content')
        Hello world
      @endsection
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, new Processor_1.Processor());
        assert.deepEqual(compiler.tokenize('index.edge'), [
            {
                type: 'raw',
                value: 'Master page',
                line: 1,
                filename: path_1.join(fs.basePath, 'master.edge'),
            },
            {
                type: edge_lexer_1.TagTypes.TAG,
                filename: path_1.join(fs.basePath, 'index.edge'),
                properties: { name: 'section', jsArg: "'content'", selfclosed: false },
                loc: {
                    start: { line: 2, col: 9 },
                    end: { line: 2, col: 19 },
                },
                children: [
                    {
                        type: 'newline',
                        line: 2,
                        filename: path_1.join(fs.basePath, 'index.edge'),
                    },
                    {
                        type: 'raw',
                        value: '  Hello world',
                        line: 3,
                        filename: path_1.join(fs.basePath, 'index.edge'),
                    },
                ],
            },
        ]);
    });
    japa_1.default('during tokenize, merge @set tags of a given layout', async (assert) => {
        await fs.add('master.edge', dedent_js_1.default `
      Master page
      @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
      @layout('master')
      @set('username', 'virk')
      @section('content')
        Hello world
      @endsection
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
            set: Set_1.setTag,
        }, new Processor_1.Processor());
        assert.deepEqual(compiler.tokenize('index.edge'), [
            {
                type: edge_lexer_1.TagTypes.TAG,
                filename: path_1.join(fs.basePath, 'index.edge'),
                properties: { name: 'set', jsArg: "'username', 'virk'", selfclosed: false },
                loc: {
                    start: { line: 2, col: 5 },
                    end: { line: 2, col: 24 },
                },
                children: [],
            },
            {
                type: 'raw',
                value: 'Master page',
                line: 1,
                filename: path_1.join(fs.basePath, 'master.edge'),
            },
            {
                type: edge_lexer_1.TagTypes.TAG,
                filename: path_1.join(fs.basePath, 'index.edge'),
                properties: { name: 'section', jsArg: "'content'", selfclosed: false },
                loc: {
                    start: { line: 3, col: 9 },
                    end: { line: 3, col: 19 },
                },
                children: [
                    {
                        type: 'newline',
                        line: 3,
                        filename: path_1.join(fs.basePath, 'index.edge'),
                    },
                    {
                        type: 'raw',
                        value: '  Hello world',
                        line: 4,
                        filename: path_1.join(fs.basePath, 'index.edge'),
                    },
                ],
            },
        ]);
    });
    japa_1.default('ensure template extending layout can only use section or set tags', async (assert) => {
        assert.plan(4);
        await fs.add('master.edge', dedent_js_1.default `
      Master page
      @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
      @layout('master')
      Hello world
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, new Processor_1.Processor());
        try {
            compiler.tokenize('index.edge');
        }
        catch (error) {
            assert.equal(error.message, 'Template extending a layout can only use "@section" or "@set" tags as top level nodes');
            assert.equal(error.filename, path_1.join(fs.basePath, 'index.edge'));
            assert.equal(error.line, 2);
            assert.equal(error.col, 0);
        }
    });
    japa_1.default('during tokenize, merge @section tags of a nested layouts', async (assert) => {
        await fs.add('super-master.edge', dedent_js_1.default `
      Master page
      @!section('header')
      @!section('content')
    `);
        await fs.add('master.edge', dedent_js_1.default `
      @layout('super-master')
      @section('header')
        This is header
      @endsection
      @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
      @layout('master')
      @section('content')
        This is content
      @endsection
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, new Processor_1.Processor());
        assert.deepEqual(compiler.tokenize('index.edge'), [
            {
                type: 'raw',
                value: 'Master page',
                line: 1,
                filename: path_1.join(fs.basePath, 'super-master.edge'),
            },
            {
                type: edge_lexer_1.TagTypes.TAG,
                filename: path_1.join(fs.basePath, 'master.edge'),
                properties: { name: 'section', jsArg: "'header'", selfclosed: false },
                loc: {
                    start: { line: 2, col: 9 },
                    end: { line: 2, col: 18 },
                },
                children: [
                    {
                        type: 'newline',
                        line: 2,
                        filename: path_1.join(fs.basePath, 'master.edge'),
                    },
                    {
                        type: 'raw',
                        value: '  This is header',
                        line: 3,
                        filename: path_1.join(fs.basePath, 'master.edge'),
                    },
                ],
            },
            {
                type: 'newline',
                line: 2,
                filename: path_1.join(fs.basePath, 'super-master.edge'),
            },
            {
                type: edge_lexer_1.TagTypes.TAG,
                filename: path_1.join(fs.basePath, 'index.edge'),
                properties: { name: 'section', jsArg: "'content'", selfclosed: false },
                loc: {
                    start: { line: 2, col: 9 },
                    end: { line: 2, col: 19 },
                },
                children: [
                    {
                        type: 'newline',
                        line: 2,
                        filename: path_1.join(fs.basePath, 'index.edge'),
                    },
                    {
                        type: 'raw',
                        value: '  This is content',
                        line: 3,
                        filename: path_1.join(fs.basePath, 'index.edge'),
                    },
                ],
            },
        ]);
    });
    japa_1.default('layout tokens must point to its own filename', async (assert) => {
        await fs.add('master.edge', dedent_js_1.default `
      {{ username }}
      @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
      @layout('master')
      @section('content')
        Hello world
      @endsection
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, new Processor_1.Processor());
        assert.deepEqual(compiler.tokenize('index.edge'), [
            {
                type: edge_lexer_1.MustacheTypes.MUSTACHE,
                filename: path_1.join(fs.basePath, 'master.edge'),
                loc: {
                    start: { line: 1, col: 2 },
                    end: { line: 1, col: 14 },
                },
                properties: { jsArg: ' username ' },
            },
            {
                type: edge_lexer_1.TagTypes.TAG,
                filename: path_1.join(fs.basePath, 'index.edge'),
                properties: { name: 'section', jsArg: "'content'", selfclosed: false },
                loc: {
                    start: { line: 2, col: 9 },
                    end: { line: 2, col: 19 },
                },
                children: [
                    {
                        type: 'newline',
                        line: 2,
                        filename: path_1.join(fs.basePath, 'index.edge'),
                    },
                    {
                        type: 'raw',
                        value: '  Hello world',
                        line: 3,
                        filename: path_1.join(fs.basePath, 'index.edge'),
                    },
                ],
            },
        ]);
    });
});
japa_1.default.group('Compiler | Compile', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('compile template with layouts', async (assert) => {
        await fs.add('master.edge', dedent_js_1.default `
      {{ username }}
      @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, new Processor_1.Processor());
        assert.stringEqual(compiler.compile('index.edge').template, test_helpers_1.normalizeNewLines(dedent_js_1.default `let out = "";
      let $lineNumber = 1;
      let $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
      try {
      $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'master.edge'))};
      out += \`\${ctx.escape(state.username)}\`;
      out += "\\n";
      out += "  ";
      $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
      $lineNumber = 3;
      out += \`\${ctx.escape(state.content)}\`;
      } catch (error) {
      ctx.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `));
    });
    japa_1.default('compile errors inside layout must point to the right file', async (assert) => {
        assert.plan(3);
        await fs.add('master.edge', dedent_js_1.default `
      {{ user name }}
      @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, new Processor_1.Processor());
        try {
            compiler.compile('index.edge');
        }
        catch (error) {
            assert.equal(error.filename, path_1.join(fs.basePath, 'master.edge'));
            assert.equal(error.line, 1);
            assert.equal(error.col, 8);
        }
    });
    japa_1.default('compile errors parent template must point to the right file', async (assert) => {
        assert.plan(3);
        await fs.add('master.edge', dedent_js_1.default `
      {{ username }}
      @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
      @layout('master')
      @section('content')
        {{ con tent }}
      @endsection
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, new Processor_1.Processor());
        try {
            compiler.compile('index.edge');
        }
        catch (error) {
            assert.equal(error.filename, path_1.join(fs.basePath, 'index.edge'));
            assert.equal(error.line, 3);
            assert.equal(error.col, 9);
        }
    });
    japa_1.default('runtime errors inside layout must point to the right file', async (assert) => {
        assert.plan(4);
        await fs.add('master.edge', dedent_js_1.default `
      {{ getUserName() }}
      @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, new Processor_1.Processor());
        try {
            const fn = compiler.compile('index.edge').template;
            new Function('state', 'ctx', fn)({}, new Context_1.Context());
        }
        catch (error) {
            assert.equal(error.message, 'getUserName is not a function');
            assert.equal(error.filename, path_1.join(fs.basePath, 'master.edge'));
            assert.equal(error.line, 1);
            assert.equal(error.col, 0);
        }
    });
    japa_1.default('runtime errors inside parent template must point to the right file', async (assert) => {
        assert.plan(4);
        await fs.add('master.edge', dedent_js_1.default `
    {{ username }}
    @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
    @layout('master')
    @section('content')
      {{ getContent() }}
    @endsection
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, new Processor_1.Processor());
        try {
            new Function('state', 'ctx', compiler.compile('index.edge').template)({}, new Context_1.Context());
        }
        catch (error) {
            assert.equal(error.message, 'getContent is not a function');
            assert.equal(error.filename, path_1.join(fs.basePath, 'index.edge'));
            assert.equal(error.line, 3);
            assert.equal(error.col, 0);
        }
    });
});
japa_1.default.group('Compiler | Processor', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('execute raw processor function', async (assert) => {
        assert.plan(2);
        await fs.add('index.edge', dedent_js_1.default `Hello`);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const processor = new Processor_1.Processor();
        processor.process('raw', ({ raw, path }) => {
            assert.equal(raw, 'Hello');
            assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
        });
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, processor);
        compiler.compile('index');
    });
    japa_1.default('use return value of the processor function', async (assert) => {
        assert.plan(5);
        await fs.add('index.edge', dedent_js_1.default `Hello`);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const processor = new Processor_1.Processor();
        processor.process('raw', ({ raw, path }) => {
            assert.equal(raw, 'Hello');
            assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
            return 'Hi';
        });
        processor.process('raw', ({ raw, path }) => {
            assert.equal(raw, 'Hi');
            assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
            return 'Hey';
        });
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, processor);
        assert.stringEqual(compiler.compile('index.edge').template, test_helpers_1.normalizeNewLines(dedent_js_1.default `let out = "";
      let $lineNumber = 1;
      let $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
      try {
      out += "Hey";
      } catch (error) {
      ctx.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `));
    });
    japa_1.default('do not run raw processor when template is cached', async (assert) => {
        assert.plan(2);
        await fs.add('index.edge', dedent_js_1.default `Hello`);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const processor = new Processor_1.Processor();
        processor.process('raw', ({ raw, path }) => {
            assert.equal(raw, 'Hello');
            assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
        });
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, processor, { cache: true });
        compiler.compile('index.edge');
        compiler.compile('index.edge');
        compiler.compile('index.edge');
    });
    japa_1.default('run raw processor function when template is not cached', async (assert) => {
        assert.plan(6);
        await fs.add('index.edge', dedent_js_1.default `Hello`);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const processor = new Processor_1.Processor();
        processor.process('raw', ({ raw, path }) => {
            assert.equal(raw, 'Hello');
            assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
        });
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, processor, { cache: false });
        compiler.compile('index.edge');
        compiler.compile('index.edge');
        compiler.compile('index.edge');
    });
    japa_1.default('run compiled processor function', async (assert) => {
        assert.plan(2);
        await fs.add('index.edge', dedent_js_1.default `Hello`);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const processor = new Processor_1.Processor();
        processor.process('compiled', ({ compiled, path }) => {
            assert.stringEqual(compiled, test_helpers_1.normalizeNewLines(dedent_js_1.default `let out = "";
		      let $lineNumber = 1;
		      let $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
		      try {
		      out += "Hello";
		      } catch (error) {
		      ctx.reThrow(error, $filename, $lineNumber);
		      }
		      return out;
		    `));
            assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
        });
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, processor);
        compiler.compile('index.edge');
    });
    japa_1.default('use return value of the compiled processor function', async (assert) => {
        assert.plan(5);
        await fs.add('index.edge', dedent_js_1.default `Hello`);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const processor = new Processor_1.Processor();
        processor.process('compiled', ({ compiled, path }) => {
            assert.stringEqual(compiled, test_helpers_1.normalizeNewLines(dedent_js_1.default `let out = "";
		      let $lineNumber = 1;
		      let $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
		      try {
		      out += "Hello";
		      } catch (error) {
		      ctx.reThrow(error, $filename, $lineNumber);
		      }
		      return out;
    		`));
            assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
            return 'foo';
        });
        processor.process('compiled', ({ compiled, path }) => {
            assert.equal(compiled, 'foo');
            assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
            return 'bar';
        });
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, processor);
        assert.equal(compiler.compile('index.edge').template, 'bar');
    });
    japa_1.default('run compiled processor function even when template is cached', async (assert) => {
        assert.plan(6);
        await fs.add('index.edge', dedent_js_1.default `Hello`);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const processor = new Processor_1.Processor();
        processor.process('compiled', ({ compiled, path }) => {
            assert.stringEqual(compiled, test_helpers_1.normalizeNewLines(dedent_js_1.default `let out = "";
		      let $lineNumber = 1;
		      let $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
		      try {
		      out += "Hello";
		      } catch (error) {
		      ctx.reThrow(error, $filename, $lineNumber);
		      }
		      return out;
		    `));
            assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
        });
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, processor, { cache: true });
        compiler.compile('index.edge');
        compiler.compile('index.edge');
        compiler.compile('index.edge');
    });
    japa_1.default('do not mutate cache when compiled processor function returns a different value', async (assert) => {
        assert.plan(9);
        await fs.add('index.edge', dedent_js_1.default `Hello`);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const processor = new Processor_1.Processor();
        processor.process('compiled', ({ compiled, path }) => {
            assert.stringEqual(compiled, test_helpers_1.normalizeNewLines(dedent_js_1.default `let out = "";
		      let $lineNumber = 1;
		      let $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
		      try {
		      out += "Hello";
		      } catch (error) {
		      ctx.reThrow(error, $filename, $lineNumber);
		      }
		      return out;
		    `));
            assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
            return 'foo';
        });
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, processor, { cache: true });
        assert.equal(compiler.compile('index.edge').template, 'foo');
        assert.equal(compiler.compile('index.edge').template, 'foo');
        assert.equal(compiler.compile('index.edge').template, 'foo');
    });
    japa_1.default('run raw processor function for layouts', async (assert) => {
        assert.plan(5);
        await fs.add('master.edge', dedent_js_1.default `
      {{ username }}
      @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        let iteration = 0;
        const processor = new Processor_1.Processor();
        processor.process('raw', ({ raw, path }) => {
            iteration++;
            if (iteration === 1) {
                assert.equal(raw, dedent_js_1.default `@layout('master')
			      @section('content')
			        {{ content }}
			      @endsection`);
                assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
                return;
            }
            if (iteration === 2) {
                assert.equal(raw, dedent_js_1.default `{{ username }}
      			@!section('content')
      		`);
                assert.equal(path, path_1.join(fs.basePath, 'master.edge'));
                return;
            }
        });
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, processor);
        assert.stringEqual(compiler.compile('index.edge').template, test_helpers_1.normalizeNewLines(dedent_js_1.default `let out = "";
      let $lineNumber = 1;
      let $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
      try {
      $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'master.edge'))};
      out += \`\${ctx.escape(state.username)}\`;
      out += "\\n";
      out += "  ";
      $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
      $lineNumber = 3;
      out += \`\${ctx.escape(state.content)}\`;
      } catch (error) {
      ctx.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `));
    });
    japa_1.default('run compiled processor functions for layouts', async (assert) => {
        assert.plan(3);
        await fs.add('master.edge', dedent_js_1.default `
      {{ username }}
      @!section('content')
    `);
        await fs.add('index.edge', dedent_js_1.default `
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const processor = new Processor_1.Processor();
        processor.process('compiled', ({ compiled, path }) => {
            assert.stringEqual(compiled, test_helpers_1.normalizeNewLines(dedent_js_1.default `let out = "";
		      let $lineNumber = 1;
		      let $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
		      try {
		      $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'master.edge'))};
		      out += \`\${ctx.escape(state.username)}\`;
		      out += "\\n";
		      out += "  ";
		      $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
		      $lineNumber = 3;
		      out += \`\${ctx.escape(state.content)}\`;
		      } catch (error) {
		      ctx.reThrow(error, $filename, $lineNumber);
		      }
		      return out;
		    `));
            assert.equal(path, path_1.join(fs.basePath, 'index.edge'));
        });
        const compiler = new Compiler_1.Compiler(loader, {
            section: Section_1.sectionTag,
            layout: Layout_1.layoutTag,
        }, processor);
        assert.stringEqual(compiler.compile('index.edge').template, test_helpers_1.normalizeNewLines(dedent_js_1.default `let out = "";
      let $lineNumber = 1;
      let $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
      try {
      $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'master.edge'))};
      out += \`\${ctx.escape(state.username)}\`;
      out += "\\n";
      out += "  ";
      $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
      $lineNumber = 3;
      out += \`\${ctx.escape(state.content)}\`;
      } catch (error) {
      ctx.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `));
    });
    japa_1.default('run tag processor function', async (assert) => {
        await fs.add('modal.edge', dedent_js_1.default `
			This is a modal
    	`);
        await fs.add('index.edge', dedent_js_1.default `
			@hl.modal()
			@end
    	`);
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const processor = new Processor_1.Processor();
        processor.process('tag', ({ tag }) => {
            if (tag.properties.name === 'hl.modal') {
                tag.properties.name = 'component';
                tag.properties.jsArg = `'modal'`;
            }
        });
        const compiler = new Compiler_1.Compiler(loader, {
            component: Component_1.componentTag,
        }, processor, {
            claimTag: (name) => {
                if (name === 'hl.modal') {
                    return { seekable: true, block: true };
                }
                return null;
            },
        });
        assert.stringEqual(compiler.compile('index.edge').template, test_helpers_1.normalizeNewLines(dedent_js_1.default `let out = "";
      let $lineNumber = 1;
      let $filename = ${js_stringify_1.default(path_1.join(fs.basePath, 'index.edge'))};
      try {
      out += template.renderWithState('modal', {}, { main: function () { return \"\" } }, { filename: $filename, line: $lineNumber, col: 0 });
      } catch (error) {
      ctx.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `));
    });
});
