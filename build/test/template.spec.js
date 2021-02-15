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
const dev_utils_1 = require("@poppinss/dev-utils");
const Loader_1 = require("../src/Loader");
const Context_1 = require("../src/Context");
const Template_1 = require("../src/Template");
const Compiler_1 = require("../src/Compiler");
const Slot_1 = require("../src/Tags/Slot");
const Processor_1 = require("../src/Processor");
const Include_1 = require("../src/Tags/Include");
const Component_1 = require("../src/Tags/Component");
require("./assert-extend");
const tags = { slot: Slot_1.slotTag, component: Component_1.componentTag, include: Include_1.includeTag };
const fs = new dev_utils_1.Filesystem(path_1.join(__dirname, 'views'));
const loader = new Loader_1.Loader();
loader.mount('default', fs.basePath);
japa_1.default.group('Template', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('run template using the given state', async (assert) => {
        await fs.add('foo.edge', 'Hello {{ username }}');
        const processor = new Processor_1.Processor();
        const compiler = new Compiler_1.Compiler(loader, tags, processor, { cache: false });
        const output = new Template_1.Template(compiler, {}, {}, processor).render('foo', { username: 'virk' });
        assert.equal(output.trim(), 'Hello virk');
    });
    japa_1.default('run template with shared state', async (assert) => {
        await fs.add('foo.edge', 'Hello {{ getUsername() }}');
        const processor = new Processor_1.Processor();
        const compiler = new Compiler_1.Compiler(loader, tags, processor, { cache: false });
        const output = new Template_1.Template(compiler, { username: 'virk' }, {
            getUsername() {
                return this.username.toUpperCase();
            },
        }, processor).render('foo', {});
        assert.equal(output.trim(), 'Hello VIRK');
    });
    japa_1.default('run partial inside existing state', async (assert) => {
        await fs.add('foo.edge', 'Hello {{ username }}');
        const processor = new Processor_1.Processor();
        const compiler = new Compiler_1.Compiler(loader, tags, processor, { cache: false });
        const template = new Template_1.Template(compiler, {}, {}, processor);
        const output = template.renderInline('foo')(template, { username: 'virk' }, new Context_1.Context());
        assert.equal(output.trim(), 'Hello virk');
    });
    japa_1.default('pass local variables to inline templates', async (assert) => {
        await fs.add('foo.edge', 'Hello {{ user.username }}');
        const processor = new Processor_1.Processor();
        const compiler = new Compiler_1.Compiler(loader, tags, processor, { cache: false });
        const template = new Template_1.Template(compiler, {}, {}, processor);
        const user = { username: 'virk' };
        const output = template.renderInline('foo', 'user')(template, {}, new Context_1.Context(), user);
        assert.equal(output.trim(), 'Hello virk');
    });
    japa_1.default('process file names starting with u', async (assert) => {
        await fs.add('users.edge', 'Hello {{ user.username }}');
        const processor = new Processor_1.Processor();
        const compiler = new Compiler_1.Compiler(loader, tags, processor, { cache: false });
        const template = new Template_1.Template(compiler, {}, {}, processor);
        const user = { username: 'virk' };
        const output = template.render('users', { user });
        assert.equal(output.trim(), 'Hello virk');
    });
    japa_1.default('execute output processor function', async (assert) => {
        assert.plan(3);
        await fs.add('users.edge', 'Hello {{ user.username }}');
        const processor = new Processor_1.Processor();
        processor.process('output', ({ output, template }) => {
            assert.stringEqual(output, 'Hello virk');
            assert.instanceOf(template, Template_1.Template);
        });
        const compiler = new Compiler_1.Compiler(loader, tags, processor, { cache: false });
        const template = new Template_1.Template(compiler, {}, {}, processor);
        const user = { username: 'virk' };
        const output = template.render('users', { user });
        assert.equal(output.trim(), 'Hello virk');
    });
    japa_1.default('use return value of the output processor function', async (assert) => {
        assert.plan(3);
        await fs.add('users.edge', 'Hello {{ user.username }}');
        const processor = new Processor_1.Processor();
        processor.process('output', ({ output, template }) => {
            assert.stringEqual(output, 'Hello virk');
            assert.instanceOf(template, Template_1.Template);
            return output.toUpperCase();
        });
        const compiler = new Compiler_1.Compiler(loader, tags, processor, { cache: false });
        const template = new Template_1.Template(compiler, {}, {}, processor);
        const user = { username: 'virk' };
        const output = template.render('users', { user });
        assert.equal(output.trim(), 'HELLO VIRK');
    });
});
