"use strict";
/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eachTag = void 0;
const lodash_size_1 = __importDefault(require("lodash.size"));
const lodash_foreach_1 = __importDefault(require("lodash.foreach"));
const edge_lexer_1 = require("edge-lexer");
const edge_parser_1 = require("edge-parser");
const utils_1 = require("../utils");
/**
 * Returns the list to loop over for the each binary expression
 */
function getLoopList(rhsExpression, parser, filename) {
    return parser.utils.stringify(parser.utils.transformAst(rhsExpression, filename, parser));
}
/**
 * Returns loop item and the index for the each binary expression
 */
function getLoopItemAndIndex(lhsExpression, parser, filename) {
    /**
     * Ensure the LHS content inside `@each()` curly braces is a `SequenceExpression` or
     * `Identifier`. Anything else is not allowed.
     *
     * For example:
     *
     * - In `@each(user in users)`, `user` is an indentifier
     * - In `@each((user, index) in users)`, `(user, index)` is a sequence expression
     */
    utils_1.isSubsetOf(lhsExpression, [edge_parser_1.expressions.SequenceExpression, edge_parser_1.expressions.Identifier], () => {
        utils_1.unallowedExpression(`invalid left hand side "${lhsExpression.type}" expression for the @each tag`, filename, parser.utils.getExpressionLoc(lhsExpression));
    });
    /**
     * Return list index from the sequence expression
     */
    if (lhsExpression.type === 'SequenceExpression') {
        /**
         * First item of the sequence expression must be an idenifier
         */
        utils_1.isSubsetOf(lhsExpression.expressions[0], [edge_parser_1.expressions.Identifier], () => {
            utils_1.unallowedExpression(`"${lhsExpression.expressions[0]}.type" is not allowed as value identifier for @each tag`, filename, parser.utils.getExpressionLoc(lhsExpression.expressions[0]));
        });
        /**
         * Second item of the sequence expression must be an idenifier
         */
        utils_1.isSubsetOf(lhsExpression.expressions[1], [edge_parser_1.expressions.Identifier], () => {
            utils_1.unallowedExpression(`"${lhsExpression.expressions[1]}.type" is not allowed as key identifier for @each tag`, filename, parser.utils.getExpressionLoc(lhsExpression.expressions[1]));
        });
        return [lhsExpression.expressions[0].name, lhsExpression.expressions[1].name];
    }
    /**
     * There is no key, just the value
     */
    return [lhsExpression.name];
}
/**
 * Each tag is used to run a foreach loop on arrays and even objects.
 *
 * ```edge
 * @each((user, index) in users)
 *   {{ user }} {{ index }}
 * @endeach
 * ```
 */
exports.eachTag = {
    block: true,
    seekable: true,
    tagName: 'each',
    /**
     * Compile the template
     */
    compile(parser, buffer, token) {
        /**
         * We just generate the AST and do not transform it, since the transform
         * function attempts to resolve identifiers and we don't want that
         */
        const { expression } = parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename);
        /**
         * Each tag only accepts the binary expression or sequence expression. ie `user in users`
         */
        utils_1.isSubsetOf(expression, [edge_parser_1.expressions.BinaryExpression], () => {
            utils_1.unallowedExpression(`"${token.properties.jsArg}" is not valid expression for the @each tag`, token.filename, parser.utils.getExpressionLoc(expression));
        });
        /**
         * Finding if an else child exists inside the each tag
         */
        const elseIndex = token.children.findIndex((child) => edge_lexer_1.utils.isTag(child, 'else'));
        const elseChildren = elseIndex > -1 ? token.children.splice(elseIndex) : [];
        /**
         * Fetching the item,index and list for the each loop
         */
        const list = getLoopList(expression.right, parser, token.filename);
        const [item, index] = getLoopItemAndIndex(expression.left, parser, token.filename);
        /**
         * If there is an else statement, then wrap the loop inside the `if` statement first
         */
        if (elseIndex > -1) {
            buffer.writeStatement(`if(ctx.size(${list})) {`, token.filename, token.loc.start.line);
        }
        /**
         * Write the loop statement to the template
         */
        const loopCallbackArgs = (index ? [item, index] : [item]).join(',');
        buffer.writeStatement(`ctx.loop(${list}, function (${loopCallbackArgs}) {`, token.filename, token.loc.start.line);
        /**
         * Start a new parser scope. So that all variable resolutions for the `item`
         * are pointing to the local variable and not the template `state`.
         */
        parser.stack.defineScope();
        parser.stack.defineVariable(item);
        index && parser.stack.defineVariable(index);
        /**
         * Process all children
         */
        token.children.forEach((child) => parser.processToken(child, buffer));
        /**
         * Clear scope
         */
        parser.stack.clearScope();
        /**
         * Close each loop
         */
        buffer.writeExpression('})', token.filename, -1);
        /**
         * If there is an else statement, then process
         * else childs and close the if block
         */
        if (elseIndex > -1) {
            elseChildren.forEach((elseChild) => parser.processToken(elseChild, buffer));
            buffer.writeStatement('}', token.filename, -1);
        }
    },
    /**
     * Add methods to the runtime context for running the loop
     */
    run(context) {
        context.macro('loop', function loop(source, callback) {
            lodash_foreach_1.default(source, callback);
        });
        context.macro('size', lodash_size_1.default);
    },
};
