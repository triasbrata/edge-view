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
const edge_error_1 = require("edge-error");
const dev_utils_1 = require("@poppinss/dev-utils");
const Loader_1 = require("../src/Loader");
const Compiler_1 = require("../src/Compiler");
const Template_1 = require("../src/Template");
const Processor_1 = require("../src/Processor");
const Slot_1 = require("../src/Tags/Slot");
const Component_1 = require("../src/Tags/Component");
const fs = new dev_utils_1.Filesystem(path_1.join(__dirname, 'views'));
const tags = {
    component: Component_1.componentTag,
    slot: Slot_1.slotTag,
};
const loader = new Loader_1.Loader();
loader.mount('default', fs.basePath);
const processor = new Processor_1.Processor();
const compiler = new Compiler_1.Compiler(loader, tags, processor, { cache: false });
japa_1.default.group('Component | compile | errors', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('report component arguments error', async (assert) => {
        assert.plan(4);
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>

      @component([1, 2])
      @endcomponent
    `);
        const template = new Template_1.Template(compiler, {}, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, '"[1, 2]" is not a valid argument type for the @component tag');
            assert.equal(error.line, 3);
            assert.equal(error.col, 11);
            assert.equal(error.filename, path_1.join(fs.basePath, 'eval.edge'));
        }
    });
    japa_1.default('report slot argument name error', async (assert) => {
        assert.plan(4);
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>

      @component('foo')
        @slot(getSlotName())
        @endslot
      @endcomponent
    `);
        const template = new Template_1.Template(compiler, {}, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, '"getSlotName()" is not a valid argument type for the @slot tag');
            assert.equal(error.line, 4);
            assert.equal(error.col, 8);
            assert.equal(error.filename, path_1.join(fs.basePath, 'eval.edge'));
        }
    });
    japa_1.default('report slot arguments error', async (assert) => {
        assert.plan(4);
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>

      @component('foo')
        @slot('main', 'foo', 'bar')
        @endslot
      @endcomponent
    `);
        const template = new Template_1.Template(compiler, {}, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, 'maximum of 2 arguments are allowed for @slot tag');
            assert.equal(error.line, 4);
            assert.equal(error.col, 8);
            assert.equal(error.filename, path_1.join(fs.basePath, 'eval.edge'));
        }
    });
    japa_1.default('report slot scope argument error', async (assert) => {
        assert.plan(4);
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>

      @component('foo')
        @slot('main', [1, 2])
        @endslot
      @endcomponent
    `);
        const template = new Template_1.Template(compiler, {}, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, '"[1, 2]" is not valid prop identifier for @slot tag');
            assert.equal(error.line, 4);
            assert.equal(error.col, 16);
            assert.equal(error.filename, path_1.join(fs.basePath, 'eval.edge'));
        }
    });
});
japa_1.default.group('Component | render | errors', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('report component name runtime error', async (assert) => {
        assert.plan(4);
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>

      @component(getComponentName())
      @endcomponent
    `);
        const template = new Template_1.Template(compiler, {}, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, 'getComponentName is not a function');
            assert.equal(error.line, 3);
            assert.equal(error.col, 0);
            assert.equal(error.filename, path_1.join(fs.basePath, 'eval.edge'));
        }
    });
    japa_1.default('report component state argument error', async (assert) => {
        assert.plan(4);
        await fs.add('button.edge', '');
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>

      @component('button', { color: getColor() })
      @endcomponent
    `);
        const template = new Template_1.Template(compiler, {}, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, 'getColor is not a function');
            assert.equal(error.line, 3);
            assert.equal(error.col, 0);
            assert.equal(error.filename, path_1.join(fs.basePath, 'eval.edge'));
        }
    });
    japa_1.default('report component state argument error when spread over multiple lines', async (assert) => {
        assert.plan(4);
        await fs.add('button.edge', '');
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>

      @component('button', {
        color: getColor(),
      })
      @endcomponent
    `);
        const template = new Template_1.Template(compiler, {}, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, 'getColor is not a function');
            /**
             * Expected to be on line 4. But okay for now
             */
            assert.equal(error.line, 3);
            assert.equal(error.col, 0);
            assert.equal(error.filename, path_1.join(fs.basePath, 'eval.edge'));
        }
    });
    japa_1.default('report component state argument error with assignment expression', async (assert) => {
        assert.plan(4);
        await fs.add('button.edge', '');
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>

      @component('button', color = getColor())
      @endcomponent
    `);
        const template = new Template_1.Template(compiler, {}, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, 'getColor is not a function');
            assert.equal(error.line, 3);
            assert.equal(error.col, 0);
            assert.equal(error.filename, path_1.join(fs.basePath, 'eval.edge'));
        }
    });
    japa_1.default('report component state argument error with assignment expression in multiple lines', async (assert) => {
        assert.plan(4);
        await fs.add('button.edge', '');
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>

      @component(
        'button',
        color = getColor()
      )
      @endcomponent
    `);
        const template = new Template_1.Template(compiler, {}, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, 'getColor is not a function');
            /**
             * Expected to be on line 5. But okay for now
             */
            assert.equal(error.line, 3);
            assert.equal(error.col, 0);
            assert.equal(error.filename, path_1.join(fs.basePath, 'eval.edge'));
        }
    });
    japa_1.default('report scoped slot error', async (assert) => {
        assert.plan(4);
        await fs.add('button.edge', '{{ $slots.text() }}');
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>

      @component('button')
        @slot('text', button)
          {{ button.isPrimary() ? 'Hello primary' : 'Hello' }}
        @endslot
      @endcomponent
    `);
        const template = new Template_1.Template(compiler, {}, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, "Cannot read property 'isPrimary' of undefined");
            assert.equal(error.line, 5);
            assert.equal(error.col, 0);
            assert.equal(error.filename, path_1.join(fs.basePath, 'eval.edge'));
        }
    });
    japa_1.default('report component file errors', async (assert) => {
        assert.plan(4);
        await fs.add('button.edge', dedent_js_1.default `
      <button
        style="color: {{ getColor() }}"
      >
      </button>
    `);
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>
      @!component('button')
    `);
        const template = new Template_1.Template(compiler, {}, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, 'getColor is not a function');
            assert.equal(error.line, 2);
            assert.equal(error.col, 0);
            assert.equal(error.filename, path_1.join(fs.basePath, 'button.edge'));
        }
    });
    japa_1.default('point error back to the caller when props validation fails', async (assert) => {
        assert.plan(4);
        await fs.add('button.edge', `{{ $props.validate('text', () => {
				raise('text prop is required', $caller)
			}) }}`);
        await fs.add('eval.edge', dedent_js_1.default `
      <p> Some content </p>

      @!component('button')
    `);
        const template = new Template_1.Template(compiler, {
            raise: (message, options) => {
                throw new edge_error_1.EdgeError(message, 'E_RUNTIME_EXCEPTION', options);
            },
        }, {}, processor);
        try {
            template.render('eval.edge', {});
        }
        catch (error) {
            assert.equal(error.message, 'text prop is required');
            assert.equal(error.line, 3);
            assert.equal(error.col, 0);
            assert.equal(error.filename, path_1.join(fs.basePath, 'eval.edge'));
        }
    });
});
