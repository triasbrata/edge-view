/**
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { LoaderContract, LoaderTemplate } from '../Contracts';
/**
 * The job of a loader is to load the template from a given path.
 * The base loader (shipped with edge) looks for files on the
 * file-system and reads them synchronously.
 *
 * You are free to define your own loaders that implements the [[LoaderContract]] interface.
 */
export declare class Loader implements LoaderContract {
    /**
     * List of mounted directories
     */
    private mountedDirs;
    /**
     * List of pre-registered (in-memory) templates
     */
    private preRegistered;
    /**
     * Reads the content of a template from the disk. An exception is raised
     * when file is missing or if `readFileSync` returns an error.
     */
    private readTemplateContents;
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
    private extractDiskAndTemplateName;
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
    get mounted(): {
        [key: string]: string;
    };
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
    get templates(): {
        [templatePath: string]: LoaderTemplate;
    };
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
    mount(diskName: string, dirPath: string): void;
    /**
     * Remove the previously mounted dir.
     *
     * ```js
     * loader.unmount('default')
     * ```
     */
    unmount(diskName: string): void;
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
    makePath(templatePath: string): string;
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
    resolve(templatePath: string): LoaderTemplate;
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
    register(templatePath: string, contents: LoaderTemplate): void;
}
