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
exports.includeIfTag = void 0;
const edge_error_1 = require("edge-error");
const edge_parser_1 = require("edge-parser");
const Include_1 = require("./Include");
const utils_1 = require("../utils");
/**
 * Include tag is used to include partials in the same scope of the parent
 * template.
 *
 * ```edge
 * @include('partials.header')
 * ```
 */
exports.includeIfTag = {
    block: false,
    seekable: true,
    tagName: 'includeIf',
    /**
     * Compiles else block node to Javascript else statement
     */
    compile(parser, buffer, token) {
        const parsed = utils_1.parseJsArg(parser, token);
        /**
         * The include if only accepts the sequence expression
         */
        utils_1.isSubsetOf(parsed, [edge_parser_1.expressions.SequenceExpression], () => {
            utils_1.unallowedExpression(`"${token.properties.jsArg}" is not a valid argument type for the @includeIf tag`, token.filename, parser.utils.getExpressionLoc(parsed));
        });
        /**
         * Disallow more than or less than 2 values for the sequence expression
         */
        if (parsed.expressions.length !== 2) {
            throw new edge_error_1.EdgeError('@includeIf expects a total of 2 arguments', 'E_ARGUMENTS_MIS_MATCH', {
                line: parsed.loc.start.line,
                col: parsed.loc.start.column,
                filename: token.filename,
            });
        }
        const [conditional, include] = parsed.expressions;
        utils_1.isNotSubsetOf(conditional, [edge_parser_1.expressions.SequenceExpression], () => {
            utils_1.unallowedExpression(`"${conditional.type}" is not a valid 1st argument type for the @includeIf tag`, token.filename, parser.utils.getExpressionLoc(conditional));
        });
        utils_1.isSubsetOf(include, Include_1.ALLOWED_EXPRESSION, () => {
            utils_1.unallowedExpression(`"${include.type}" is not a valid 2nd argument type for the @includeIf tag`, token.filename, parser.utils.getExpressionLoc(include));
        });
        buffer.writeStatement(`if (${parser.utils.stringify(conditional)}) {`, token.filename, token.loc.start.line);
        buffer.outputExpression(Include_1.getRenderExpression(parser, include), token.filename, token.loc.start.line, false);
        buffer.writeStatement('}', token.filename, -1);
    },
};
