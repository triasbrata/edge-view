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
exports.includeTag = exports.getRenderExpression = exports.ALLOWED_EXPRESSION = void 0;
const edge_parser_1 = require("edge-parser");
const utils_1 = require("../utils");
/**
 * List of expressions allowed for the include tag
 */
exports.ALLOWED_EXPRESSION = [
    edge_parser_1.expressions.Identifier,
    edge_parser_1.expressions.Literal,
    edge_parser_1.expressions.LogicalExpression,
    edge_parser_1.expressions.MemberExpression,
    edge_parser_1.expressions.ConditionalExpression,
    edge_parser_1.expressions.CallExpression,
    edge_parser_1.expressions.TemplateLiteral,
];
/**
 * Returns the expression for rendering the partial
 */
function getRenderExpression(parser, parsedExpression) {
    /**
     * We need to pass the local variables to the partial render function
     */
    const localVariables = parser.stack.list();
    /**
     * Arguments for the `renderInline` method
     */
    const renderArgs = localVariables.length
        ? [
            parser.utils.stringify(parsedExpression),
            localVariables.map((localVar) => `"${localVar}"`).join(','),
        ]
        : [parser.utils.stringify(parsedExpression)];
    /**
     * Arguments for invoking the output function of `renderInline`
     */
    const callFnArgs = localVariables.length
        ? ['template', 'state', 'ctx', localVariables.map((localVar) => localVar).join(',')]
        : ['template', 'state', 'ctx'];
    return `template.renderInline(${renderArgs.join(',')})(${callFnArgs.join(',')})`;
}
exports.getRenderExpression = getRenderExpression;
/**
 * Include tag is used to include partials in the same scope of the parent
 * template.
 *
 * ```edge
 * @include('partials.header')
 * ```
 */
exports.includeTag = {
    block: false,
    seekable: true,
    tagName: 'include',
    /**
     * Compiles else block node to Javascript else statement
     */
    compile(parser, buffer, token) {
        const parsed = utils_1.parseJsArg(parser, token);
        /**
         * Only mentioned expressions are allowed inside `@include` tag
         */
        utils_1.isSubsetOf(parsed, exports.ALLOWED_EXPRESSION, () => {
            utils_1.unallowedExpression(`"${token.properties.jsArg}" is not a valid argument type for the @include tag`, token.filename, parser.utils.getExpressionLoc(parsed));
        });
        buffer.outputExpression(getRenderExpression(parser, parsed), token.filename, token.loc.start.line, false);
    },
};
