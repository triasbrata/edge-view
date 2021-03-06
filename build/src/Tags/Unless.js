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
exports.unlessTag = void 0;
const edge_parser_1 = require("edge-parser");
const utils_1 = require("../utils");
/**
 * Inverse of the `if` condition. The term `unless` is more readable and logical
 * vs using `@if(!expression)`.
 *
 * ```edge
 * @unless(auth.user)
 *   <a href="/login"> Login </a>
 * @endunless
 * ```
 */
exports.unlessTag = {
    block: true,
    seekable: true,
    tagName: 'unless',
    /**
     * Compiles the if block node to a Javascript if statement
     */
    compile(parser, buffer, token) {
        const parsed = utils_1.parseJsArg(parser, token);
        /**
         * Disallow sequence expressions
         */
        utils_1.isNotSubsetOf(parsed, [edge_parser_1.expressions.SequenceExpression], () => {
            utils_1.unallowedExpression(`"${token.properties.jsArg}" is not a valid argument type for the @unless tag`, token.filename, parser.utils.getExpressionLoc(parsed));
        });
        /**
         * Start if block
         */
        buffer.writeStatement(`if (!${parser.utils.stringify(parsed)}) {`, token.filename, token.loc.start.line);
        /**
         * Process of all children recursively
         */
        token.children.forEach((child) => parser.processToken(child, buffer));
        /**
         * Close if block
         */
        buffer.writeStatement('}', token.filename, -1);
    },
};
