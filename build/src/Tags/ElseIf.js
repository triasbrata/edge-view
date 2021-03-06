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
exports.elseIfTag = void 0;
const edge_parser_1 = require("edge-parser");
const utils_1 = require("../utils");
/**
 * Else if tag is used to define conditional blocks. We keep `@elseif` tag
 * is a inline tag, so that everything between the `if` and the `elseif`
 * comes `if` children.
 */
exports.elseIfTag = {
    block: false,
    seekable: true,
    tagName: 'elseif',
    /**
     * Compiles the else if block node to a Javascript if statement
     */
    compile(parser, buffer, token) {
        const parsed = utils_1.parseJsArg(parser, token);
        /**
         * Disallow sequence expressions
         */
        utils_1.isNotSubsetOf(parsed, [edge_parser_1.expressions.SequenceExpression], () => {
            utils_1.unallowedExpression(`{${token.properties.jsArg}} is not a valid argument type for the @elseif tag`, token.filename, parser.utils.getExpressionLoc(parsed));
        });
        /**
         * Start else if block
         */
        buffer.writeStatement(`} else if (${parser.utils.stringify(parsed)}) {`, token.filename, token.loc.start.line);
    },
};
