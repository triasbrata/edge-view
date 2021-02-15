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
const fs = new dev_utils_1.Filesystem(path_1.join(__dirname, 'views'));
japa_1.default.group('Loader', (group) => {
    group.afterEach(async () => {
        await fs.cleanup();
    });
    japa_1.default('mount path with a name', (assert) => {
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        assert.deepEqual(loader.mounted, { default: fs.basePath });
    });
    japa_1.default('unmount path with a name', (assert) => {
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        loader.unmount('default');
        assert.deepEqual(loader.mounted, {});
    });
    japa_1.default('throw exception when resolving path from undefined location', (assert) => {
        const loader = new Loader_1.Loader();
        const fn = () => loader.resolve('foo');
        assert.throw(fn, '"default" namespace is not mounted');
    });
    japa_1.default('resolve template for the default disk', async (assert) => {
        await fs.add('foo.edge', 'Hello world');
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const { template } = loader.resolve('foo');
        assert.equal(template.trim(), 'Hello world');
    });
    japa_1.default('raise error when template is missing', async (assert) => {
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const fn = () => loader.resolve('foo');
        assert.throw(fn, `Cannot resolve "${path_1.join(fs.basePath, 'foo.edge')}". Make sure the file exists`);
    });
    japa_1.default('resolve template with extension', async (assert) => {
        await fs.add('foo.edge', 'Hello world');
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const { template } = loader.resolve('foo.edge');
        assert.equal(template.trim(), 'Hello world');
    });
    japa_1.default('resolve template from a named disk', async (assert) => {
        await fs.add('foo.edge', 'Hello world');
        const loader = new Loader_1.Loader();
        loader.mount('users', fs.basePath);
        const { template } = loader.resolve('users::foo.edge');
        assert.equal(template.trim(), 'Hello world');
    });
    japa_1.default('do not replace edge within the template path name', async (assert) => {
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const templatePath = loader.makePath('edge-partial.edge');
        assert.equal(templatePath, path_1.join(fs.basePath, 'edge-partial.edge'));
    });
    japa_1.default('do not replace edge within the template path seperator', async (assert) => {
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const templatePath = loader.makePath('partial/edge');
        assert.equal(templatePath, path_1.join(fs.basePath, 'partial/edge.edge'));
    });
    japa_1.default('do not replace edge within the template path seperator with extension', async (assert) => {
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const templatePath = loader.makePath('partial/edge.edge');
        assert.equal(templatePath, path_1.join(fs.basePath, 'partial/edge.edge'));
    });
    japa_1.default('do not replace edge within the template path seperator with named disk', async (assert) => {
        const loader = new Loader_1.Loader();
        loader.mount('users', fs.basePath);
        const templatePath = loader.makePath('users::partial/edge.edge');
        assert.equal(templatePath, path_1.join(fs.basePath, 'partial/edge.edge'));
    });
    japa_1.default('pre register templates with a key', async (assert) => {
        const loader = new Loader_1.Loader();
        loader.register('my-view', {
            template: 'Hello world',
        });
        const { template } = loader.resolve('my-view');
        assert.equal(template.trim(), 'Hello world');
    });
    japa_1.default('pre registering duplicate templates must raise an error', async (assert) => {
        const loader = new Loader_1.Loader();
        loader.register('my-view', { template: 'Hello world' });
        const fn = () => loader.register('my-view', { template: 'Hello world' });
        assert.throw(fn, 'Cannot override previously registered "my-view" template');
    });
    japa_1.default('resolve template with dot seperator', async (assert) => {
        await fs.add('foo/bar.edge', 'Hello world');
        const loader = new Loader_1.Loader();
        loader.mount('default', fs.basePath);
        const { template } = loader.resolve('foo.bar');
        assert.equal(template.trim(), 'Hello world');
    });
});
