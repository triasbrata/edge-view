import { ClaimTagFn } from 'edge-parser';
import { Compiler } from '../Compiler';
import { Processor } from '../Processor';
import { TagContract, EdgeOptions, EdgeContract, LoaderTemplate, EdgeRendererContract } from '../Contracts';
/**
 * Exposes the API to render templates, register custom tags and globals
 */
export declare class Edge implements EdgeContract {
    private options;
    private executedPlugins;
    /**
     * Options passed to the compiler instance
     */
    private compilerOptions;
    /**
     * An array of registered plugins
     */
    private plugins;
    /**
     * Reference to the registered processor handlers
     */
    processor: Processor;
    /**
     * Globals are shared with all rendered templates
     */
    GLOBALS: {
        [key: string]: any;
    };
    /**
     * List of registered tags. Adding new tags will only impact
     * this list
     */
    tags: {
        [name: string]: TagContract;
    };
    /**
     * The loader to load templates. A loader can read and return
     * templates from anywhere. The default loader reads files
     * from the disk
     */
    loader: import("../Contracts").LoaderContract;
    /**
     * The underlying compiler in use
     */
    compiler: Compiler;
    constructor(options?: EdgeOptions);
    /**
     * Execute plugins. Since plugins are meant to be called only
     * once we empty out the array after first call
     */
    private executePlugins;
    /**
     * Register a plugin. Plugin functions are called once just before
     * an attempt to render a view is made.
     */
    use<T extends any>(pluginFn: (edge: this, firstRun: boolean, options: T) => void, options?: T): this;
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
    mount(diskName: string, dirPath?: string): this;
    /**
     * Un Mount a disk from the loader.
     *
     * ```js
     * edge.unmount('admin')
     * ```
     */
    unmount(diskName: string): this;
    /**
     * Add a new global to the edge globals. The globals are available
     * to all the templates.
     *
     * ```js
     * edge.global('username', 'virk')
     * edge.global('time', () => new Date().getTime())
     * ```
     */
    global(name: string, value: any): this;
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
    registerTag(tag: TagContract): this;
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
    registerTemplate(templatePath: string, contents: LoaderTemplate): this;
    /**
     * Register a function to claim tags during the lexal analysis
     */
    claimTag(fn: ClaimTagFn): this;
    /**
     * Returns a new instance of edge. The instance
     * can be used to define locals.
     */
    getRenderer(): EdgeRendererContract;
    /**
     * Render a template with optional state
     *
     * ```ts
     * edge.render('welcome', { greeting: 'Hello world' })
     * ```
     */
    render(templatePath: string, state?: any): string;
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
    share(data: any): EdgeRendererContract;
}
