"use strict";
/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
const edge_error_1 = require("edge-error");
const edge_parser_1 = require("edge-parser");
const edge_lexer_1 = require("edge-lexer");
const CacheManager_1 = require("../CacheManager");
/**
 * Compiler is to used to compile templates using the `edge-parser`. Along with that
 * it natively merges the contents of a layout with a parent template.
 */
class Compiler {
    constructor(loader, tags, processor, options = {
        cache: true,
    }) {
        this.loader = loader;
        this.tags = tags;
        this.processor = processor;
        this.options = options;
        this.cacheManager = new CacheManager_1.CacheManager(!!this.options.cache);
    }
    /**
     * Merges sections of base template and parent template tokens
     */
    mergeSections(base, extended) {
        /**
         * Collection of all sections from the extended tokens
         */
        const extendedSections = {};
        /**
         * Collection of extended set calls as top level nodes. The set
         * calls are hoisted just like `var` statements in Javascript.
         */
        const extendedSetCalls = [];
        extended.forEach((node) => {
            /**
             * Ignore new lines, comments, layout tag and empty raw nodes inside the parent
             * template
             */
            if (edge_lexer_1.utils.isTag(node, 'layout') ||
                node.type === 'newline' ||
                (node.type === 'raw' && !node.value.trim()) ||
                node.type === 'comment') {
                return;
            }
            /**
             * Collect parent template sections
             */
            if (edge_lexer_1.utils.isTag(node, 'section')) {
                extendedSections[node.properties.jsArg.trim()] = node;
                return;
            }
            /**
             * Collect set calls inside parent templates
             */
            if (edge_lexer_1.utils.isTag(node, 'set')) {
                extendedSetCalls.push(node);
                return;
            }
            /**
             * Everything else is not allowed as top level nodes
             */
            const [line, col] = edge_lexer_1.utils.getLineAndColumn(node);
            throw new edge_error_1.EdgeError('Template extending a layout can only use "@section" or "@set" tags as top level nodes', 'E_UNALLOWED_EXPRESSION', { line, col, filename: node.filename });
        });
        /**
         * Replace/extend sections inside base tokens list
         */
        const finalNodes = base.map((node) => {
            if (!edge_lexer_1.utils.isTag(node, 'section')) {
                return node;
            }
            const sectionName = node.properties.jsArg.trim();
            const extendedNode = extendedSections[sectionName];
            if (!extendedNode) {
                return node;
            }
            /**
             * Concat children when super was called
             */
            if (extendedNode.children.length) {
                if (edge_lexer_1.utils.isTag(extendedNode.children[0], 'super')) {
                    extendedNode.children.shift();
                    extendedNode.children = node.children.concat(extendedNode.children);
                }
                else if (edge_lexer_1.utils.isTag(extendedNode.children[1], 'super')) {
                    extendedNode.children.shift();
                    extendedNode.children.shift();
                    extendedNode.children = node.children.concat(extendedNode.children);
                }
            }
            return extendedNode;
        });
        /**
         * Set calls are hoisted to the top
         */
        return [].concat(extendedSetCalls).concat(finalNodes);
    }
    /**
     * Generates an array of lexer tokens from the template string. Further tokens
     * are checked for layouts and if layouts are used, their sections will be
     * merged together.
     */
    templateContentToTokens(content, parser, absPath) {
        let templateTokens = parser.tokenize(content, { filename: absPath });
        const firstToken = templateTokens[0];
        /**
         * The `layout` is inbuilt feature from core, where we merge the layout
         * and parent template sections together
         */
        if (edge_lexer_1.utils.isTag(firstToken, 'layout')) {
            const layoutName = firstToken.properties.jsArg.replace(/'|"/g, '');
            templateTokens = this.mergeSections(this.tokenize(layoutName, parser), templateTokens);
        }
        return templateTokens;
    }
    /**
     * Converts the template content to an array of lexer tokens. The method is
     * same as the `parser.tokenize`, but it also handles layouts natively.
     *
     * ```
     * compiler.tokenize('<template-path>')
     * ```
     */
    tokenize(templatePath, parser) {
        const absPath = this.loader.makePath(templatePath);
        let { template } = this.loader.resolve(absPath);
        template = this.processor.executeRaw({ path: absPath, raw: template });
        return this.templateContentToTokens(template, parser || new edge_parser_1.Parser(this.tags), absPath);
    }
    /**
     * Compiles the template contents to string. The output is same as the `edge-parser`,
     * it's just that the compiler uses the loader to load the templates and also
     * handles layouts.
     *
     * ```js
     * compiler.compile('welcome')
     * ```
     */
    compile(templatePath, localVariables) {
        const absPath = this.loader.makePath(templatePath);
        /**
         * If template is in the cache, then return it without
         * further processing
         */
        const cachedResponse = this.cacheManager.get(absPath);
        if (cachedResponse) {
            const template = this.processor.executeCompiled({
                path: absPath,
                compiled: cachedResponse.template,
            });
            return { template };
        }
        const parser = new edge_parser_1.Parser(this.tags, undefined, {
            claimTag: this.options.claimTag,
            onTag: (tag) => this.processor.executeTag({ tag, path: absPath }),
        });
        const buffer = new edge_parser_1.EdgeBuffer(absPath);
        /**
         * Define local variables on the parser. This is helpful when trying to compile
         * a partail and we want to share the local state of the parent template
         * with it
         */
        if (localVariables) {
            localVariables.forEach((localVariable) => parser.stack.defineVariable(localVariable));
        }
        const templateTokens = this.tokenize(absPath, parser);
        templateTokens.forEach((token) => parser.processToken(token, buffer));
        const template = buffer.flush();
        this.cacheManager.set(absPath, { template });
        return { template: this.processor.executeCompiled({ path: absPath, compiled: template }) };
    }
}
exports.Compiler = Compiler;
