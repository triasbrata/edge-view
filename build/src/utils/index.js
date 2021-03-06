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
exports.parseJsArg = exports.isNotSubsetOf = exports.isSubsetOf = exports.unallowedExpression = void 0;
const edge_error_1 = require("edge-error");
/**
 * Raise an `E_UNALLOWED_EXPRESSION` exception. Filename and expression is
 * required to point the error stack to the correct file
 */
function unallowedExpression(message, filename, loc) {
    throw new edge_error_1.EdgeError(message, 'E_UNALLOWED_EXPRESSION', {
        line: loc.line,
        col: loc.col,
        filename: filename,
    });
}
exports.unallowedExpression = unallowedExpression;
/**
 * Validates the expression type to be part of the allowed
 * expressions only.
 *
 * The filename is required to report errors.
 *
 * ```js
 * isNotSubsetOf(expression, ['Literal', 'Identifier'], () => {})
 * ```
 */
function isSubsetOf(expression, expressions, errorCallback) {
    if (!expressions.includes(expression.type)) {
        errorCallback();
    }
}
exports.isSubsetOf = isSubsetOf;
/**
 * Validates the expression type not to be part of the disallowed
 * expressions.
 *
 * The filename is required to report errors.
 *
 * ```js
 * isNotSubsetOf(expression, 'SequenceExpression', () => {})
 * ```
 */
function isNotSubsetOf(expression, expressions, errorCallback) {
    if (expressions.includes(expression.type)) {
        errorCallback();
    }
}
exports.isNotSubsetOf = isNotSubsetOf;
/**
 * Parses the jsArg by generating and transforming its AST
 */
function parseJsArg(parser, token) {
    return parser.utils.transformAst(parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename), token.filename, parser);
}
exports.parseJsArg = parseJsArg;
