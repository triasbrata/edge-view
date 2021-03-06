"use strict";
/*
 * edge
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Edge = void 0;
const Tags = __importStar(require("../Tags"));
const Loader_1 = require("../Loader");
const Context_1 = require("../Context");
const Compiler_1 = require("../Compiler");
const Processor_1 = require("../Processor");
const Renderer_1 = require("../Renderer");
/**
 * Exposes the API to render templates, register custom tags and globals
 */
class Edge {
    constructor(options = {}) {
        this.options = options;
        this.executedPlugins = false;
        /**
         * Options passed to the compiler instance
         */
        this.compilerOptions = {
            cache: !!this.options.cache,
        };
        /**
         * An array of registered plugins
         */
        this.plugins = [];
        /**
         * Reference to the registered processor handlers
         */
        this.processor = new Processor_1.Processor();
        /**
         * Globals are shared with all rendered templates
         */
        this.GLOBALS = {};
        /**
         * List of registered tags. Adding new tags will only impact
         * this list
         */
        this.tags = {};
        /**
         * The loader to load templates. A loader can read and return
         * templates from anywhere. The default loader reads files
         * from the disk
         */
        this.loader = this.options.loader || new Loader_1.Loader();
        /**
         * The underlying compiler in use
         */
        this.compiler = new Compiler_1.Compiler(this.loader, this.tags, this.processor, this.compilerOptions);
        Object.keys(Tags).forEach((name) => this.registerTag(Tags[name]));
    }
    /**
     * Execute plugins. Since plugins are meant to be called only
     * once we empty out the array after first call
     */
    executePlugins() {
        if (this.executedPlugins) {
            this.plugins.forEach(({ fn, options }) => {
                if (options && options.recurring) {
                    fn(this, false, options);
                }
            });
        }
        else {
            this.executedPlugins = true;
            this.plugins.forEach(({ fn, options }) => {
                fn(this, true, options);
            });
        }
    }
    /**
     * Register a plugin. Plugin functions are called once just before
     * an attempt to render a view is made.
     */
    use(pluginFn, options) {
        this.plugins.push({
            fn: pluginFn,
            options,
        });
        return this;
    }
    /**
     * Mount named directory to use views. Later you can reference
     * the views from a named disk as follows.
     *
     * ```
     * edge.mount('admin', join(__dirname, 'admin'))
     *
     * edge.render('admin::filename')
     * ```
     */
    mount(diskName, dirPath) {
        if (!dirPath) {
            dirPath = diskName;
            diskName = 'default';
        }
        this.loader.mount(diskName, dirPath);
        return this;
    }
    /**
     * Un Mount a disk from the loader.
     *
     * ```js
     * edge.unmount('admin')
     * ```
     */
    unmount(diskName) {
        this.loader.unmount(diskName);
        return this;
    }
    /**
     * Add a new global to the edge globals. The globals are available
     * to all the templates.
     *
     * ```js
     * edge.global('username', 'virk')
     * edge.global('time', () => new Date().getTime())
     * ```
     */
    global(name, value) {
        this.GLOBALS[name] = value;
        return this;
    }
    /**
     * Add a new tag to the tags list.
     *
     * ```ts
     * edge.registerTag('svg', {
     *   block: false,
     *   seekable: true,
     *
     *   compile (parser, buffer, token) {
     *     const fileName = token.properties.jsArg.trim()
     *     buffer.writeRaw(fs.readFileSync(__dirname, 'assets', `${fileName}.svg`), 'utf-8')
     *   }
     * })
     * ```
     */
    registerTag(tag) {
        if (typeof tag.run === 'function') {
            tag.run(Context_1.Context);
        }
        this.tags[tag.tagName] = tag;
        return this;
    }
    /**
     * Register an in-memory template.
     *
     * ```ts
     * edge.registerTemplate('button', {
     *   template: `<button class="{{ this.type || 'primary' }}">
     *     @!yield($slots.main())
     *   </button>`,
     * })
     * ```
     *
     * Later you can use this template
     *
     * ```edge
     * @component('button', type = 'primary')
     *   Get started
     * @endcomponent
     * ```
     */
    registerTemplate(templatePath, contents) {
        this.loader.register(templatePath, contents);
        return this;
    }
    /**
     * Register a function to claim tags during the lexal analysis
     */
    claimTag(fn) {
        this.compilerOptions.claimTag = fn;
        return this;
    }
    /**
     * Returns a new instance of edge. The instance
     * can be used to define locals.
     */
    getRenderer() {
        this.executePlugins();
        return new Renderer_1.EdgeRenderer(this.compiler, this.GLOBALS, this.processor);
    }
    /**
     * Render a template with optional state
     *
     * ```ts
     * edge.render('welcome', { greeting: 'Hello world' })
     * ```
     */
    render(templatePath, state) {
        return this.getRenderer().render(templatePath, state);
    }
    /**
     * Share locals with the current view context.
     *
     * ```js
     * const view = edge.getRenderer()
     *
     * // local state for the current render
     * view.share({ foo: 'bar' })
     *
     * view.render('welcome')
     * ```
     */
    share(data) {
        return this.getRenderer().share(data);
    }
}
exports.Edge = Edge;
