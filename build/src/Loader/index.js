"use strict";
/**
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * The job of a loader is to load the template from a given path.
 * The base loader (shipped with edge) looks for files on the
 * file-system and reads them synchronously.
 *
 * You are free to define your own loaders that implements the [[LoaderContract]] interface.
 */
class Loader {
    constructor() {
        /**
         * List of mounted directories
         */
        this.mountedDirs = new Map();
        /**
         * List of pre-registered (in-memory) templates
         */
        this.preRegistered = new Map();
    }
    /**
     * Reads the content of a template from the disk. An exception is raised
     * when file is missing or if `readFileSync` returns an error.
     */
    readTemplateContents(absPath) {
        try {
            return fs_1.readFileSync(absPath, 'utf-8');
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`Cannot resolve "${absPath}". Make sure the file exists`);
            }
            else {
                throw error;
            }
        }
    }
    /**
     * Extracts the disk name and the template name from the template
     * path expression.
     *
     * If `diskName` is missing, it will be set to `default`.
     *
     * ```
     * extractDiskAndTemplateName('users::list')
     * // returns ['users', 'list.edge']
     *
     * extractDiskAndTemplateName('list')
     * // returns ['default', 'list.edge']
     * ```
     */
    extractDiskAndTemplateName(templatePath) {
        let [disk, ...rest] = templatePath.split('::');
        if (!rest.length) {
            rest = [disk];
            disk = 'default';
        }
        let [template, ext] = rest.join('::').split('.edge');
        /**
         * Depreciate dot based path seperators
         */
        if (template.indexOf('.') > -1) {
            process.emitWarning('DeprecationWarning', 'edge: dot "." based path seperators are depreciated. We recommend using "/" instead');
            template = template.replace(/\./g, '/');
        }
        return [disk, `${template}.${ext || 'edge'}`];
    }
    /**
     * Returns an object of mounted directories with their public
     * names.
     *
     * ```js
     * loader.mounted
     * // output
     *
     * {
     *   default: '/users/virk/code/app/views',
     *   foo: '/users/virk/code/app/foo',
     * }
     * ```
     */
    get mounted() {
        return Array.from(this.mountedDirs).reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
    }
    /**
     * Returns an object of templates registered as a raw string
     *
     * ```js
     * loader.templates
     * // output
     *
     * {
     *   'form.label': { template: '/users/virk/code/app/form/label' }
     * }
     * ```
     */
    get templates() {
        return Array.from(this.preRegistered).reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
    }
    /**
     * Mount a directory with a name for resolving views. If name is set
     * to `default`, then you can resolve views without prefixing the
     * disk name.
     *
     * ```js
     * loader.mount('default', join(__dirname, 'views'))
     *
     * // mount a named disk
     * loader.mount('admin', join(__dirname, 'admin/views'))
     * ```
     */
    mount(diskName, dirPath) {
        this.mountedDirs.set(diskName, dirPath);
    }
    /**
     * Remove the previously mounted dir.
     *
     * ```js
     * loader.unmount('default')
     * ```
     */
    unmount(diskName) {
        this.mountedDirs.delete(diskName);
    }
    /**
     * Make path to a given template. The paths are resolved from the root
     * of the mounted directory.
     *
     * ```js
     * loader.makePath('welcome') // returns {diskRootPath}/welcome.edge
     * loader.makePath('admin::welcome') // returns {adminRootPath}/welcome.edge
     * loader.makePath('users.list') // returns {diskRootPath}/users/list.edge
     * ```
     *
     * @throws Error if disk is not mounted and attempting to make path for it.
     */
    makePath(templatePath) {
        /**
         * Return the template path as it is, when it is registered
         * dynamically
         */
        if (this.preRegistered.has(templatePath)) {
            return templatePath;
        }
        /**
         * Return absolute path as it is
         */
        if (path_1.isAbsolute(templatePath)) {
            return templatePath;
        }
        /**
         * Extract disk name and template path from the expression
         */
        const [diskName, template] = this.extractDiskAndTemplateName(templatePath);
        /**
         * Raise exception when disk name is not registered
         */
        const mountedDir = this.mountedDirs.get(diskName);
        if (!mountedDir) {
            throw new Error(`"${diskName}" namespace is not mounted`);
        }
        return path_1.join(mountedDir, template);
    }
    /**
     * Resolves the template by reading its contents from the disk
     *
     * ```js
     * loader.resolve('welcome', true)
     *
     * // output
     * {
     *   template: `<h1> Template content </h1>`,
     * }
     * ```
     */
    resolve(templatePath) {
        /**
         * Return from pre-registered one's if exists
         */
        if (this.preRegistered.has(templatePath)) {
            return this.preRegistered.get(templatePath);
        }
        /**
         * Make absolute to the file on the disk
         */
        templatePath = path_1.isAbsolute(templatePath) ? templatePath : this.makePath(templatePath);
        return {
            template: this.readTemplateContents(templatePath),
        };
    }
    /**
     * Register in memory template for a given path. This is super helpful
     * when distributing components.
     *
     * ```js
     * loader.register('welcome', {
     *   template: '<h1> Template content </h1>',
     *   Presenter: class Presenter {
     *     constructor (state) {
     *       this.state = state
     *     }
     *   }
     * })
     * ```
     *
     * @throws Error if template content is empty.
     */
    register(templatePath, contents) {
        /**
         * Ensure template content is defined as a string
         */
        if (typeof contents.template !== 'string') {
            throw new Error('Make sure to define the template content as a string');
        }
        /**
         * Do not overwrite existing template with same template path
         */
        if (this.preRegistered.has(templatePath)) {
            throw new Error(`Cannot override previously registered "${templatePath}" template`);
        }
        this.preRegistered.set(templatePath, contents);
    }
}
exports.Loader = Loader;
