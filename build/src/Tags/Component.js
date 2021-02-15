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
exports.componentTag = void 0;
const edge_error_1 = require("edge-error");
const edge_lexer_1 = require("edge-lexer");
const edge_parser_1 = require("edge-parser");
const StringifiedObject_1 = require("../StringifiedObject");
const utils_1 = require("../utils");
/**
 * A list of allowed expressions for the component name
 */
const ALLOWED_EXPRESSION_FOR_COMPONENT_NAME = [
    edge_parser_1.expressions.Identifier,
    edge_parser_1.expressions.Literal,
    edge_parser_1.expressions.LogicalExpression,
    edge_parser_1.expressions.MemberExpression,
    edge_parser_1.expressions.ConditionalExpression,
    edge_parser_1.expressions.CallExpression,
    edge_parser_1.expressions.TemplateLiteral,
];
/**
 * Returns the component name and props by parsing the component jsArg expression
 */
function getComponentNameAndProps(expression, parser, filename) {
    let name;
    /**
     * Use the first expression inside the sequence expression as the name
     * of the component
     */
    if (expression.type === edge_parser_1.expressions.SequenceExpression) {
        name = expression.expressions.shift();
    }
    else {
        name = expression;
    }
    /**
     * Ensure the component name is a literal value or an expression that
     * outputs a literal value
     */
    utils_1.isSubsetOf(name, ALLOWED_EXPRESSION_FOR_COMPONENT_NAME, () => {
        utils_1.unallowedExpression(`"${parser.utils.stringify(name)}" is not a valid argument for component name`, filename, parser.utils.getExpressionLoc(name));
    });
    /**
     * Parse rest of sequence expressions as an objectified string.
     */
    if (expression.type === edge_parser_1.expressions.SequenceExpression) {
        return [
            parser.utils.stringify(name),
            StringifiedObject_1.StringifiedObject.fromAcornExpressions(expression.expressions, parser),
        ];
    }
    /**
     * When top level expression is not a sequence expression, then we assume props
     * as empty stringified object.
     */
    return [parser.utils.stringify(name), '{}'];
}
/**
 * Parses the slot component to fetch it's name and props
 */
function getSlotNameAndProps(token, parser) {
    /**
     * We just generate the acorn AST only, since we don't want parser to transform
     * ast to edge statements for a `@slot` tag.
     */
    const parsed = parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename)
        .expression;
    utils_1.isSubsetOf(parsed, [edge_parser_1.expressions.Literal, edge_parser_1.expressions.SequenceExpression], () => {
        utils_1.unallowedExpression(`"${token.properties.jsArg}" is not a valid argument type for the @slot tag`, token.filename, parser.utils.getExpressionLoc(parsed));
    });
    /**
     * Fetch the slot name
     */
    let name;
    if (parsed.type === edge_parser_1.expressions.SequenceExpression) {
        name = parsed.expressions[0];
    }
    else {
        name = parsed;
    }
    /**
     * Validating the slot name to be a literal value, since slot names cannot be dynamic
     */
    utils_1.isSubsetOf(name, [edge_parser_1.expressions.Literal], () => {
        utils_1.unallowedExpression('slot name must be a valid string literal', token.filename, parser.utils.getExpressionLoc(name));
    });
    /**
     * Return the slot name with empty props, when the expression is a literal
     * value.
     */
    if (parsed.type === edge_parser_1.expressions.Literal) {
        return [name.raw, null];
    }
    /**
     * Make sure the sequence expression has only 2 arguments in it. Though it doesn't hurt
     * the rendering of component, we must not run code with false expectations.
     */
    if (parsed.expressions.length > 2) {
        throw new edge_error_1.EdgeError('maximum of 2 arguments are allowed for @slot tag', 'E_MAX_ARGUMENTS', {
            line: parsed.loc.start.line,
            col: parsed.loc.start.column,
            filename: token.filename,
        });
    }
    utils_1.isSubsetOf(parsed.expressions[1], [edge_parser_1.expressions.Identifier], () => {
        utils_1.unallowedExpression(`"${parser.utils.stringify(parsed.expressions[1])}" is not valid prop identifier for @slot tag`, token.filename, parser.utils.getExpressionLoc(parsed.expressions[1]));
    });
    /**
     * Returning the slot name and slot props name
     */
    return [name.raw, parsed.expressions[1].name];
}
/**
 * The component tag implementation. It is one of the most complex tags and
 * can be used as a reference for creating other tags.
 */
exports.componentTag = {
    block: true,
    seekable: true,
    tagName: 'component',
    compile(parser, buffer, token) {
        const parsed = utils_1.parseJsArg(parser, token);
        /**
         * Check component jsProps for allowed expressions
         */
        utils_1.isSubsetOf(parsed, ALLOWED_EXPRESSION_FOR_COMPONENT_NAME.concat(edge_parser_1.expressions.SequenceExpression), () => {
            utils_1.unallowedExpression(`"${token.properties.jsArg}" is not a valid argument type for the @component tag`, token.filename, parser.utils.getExpressionLoc(parsed));
        });
        /**
         * Pulling the name and props for the component. The underlying method will
         * ensure that the arguments passed to component tag are valid
         */
        const [name, props] = getComponentNameAndProps(parsed, parser, token.filename);
        /**
         * Loop over all the children and set them as part of slots. If no slot
         * is defined, then the content will be part of the main slot
         */
        const slots = {};
        /**
         * Main slot collects everything that is out of the named slots
         * inside a component
         */
        const mainSlot = {
            outputVar: 'slot_main',
            props: {},
            buffer: new edge_parser_1.EdgeBuffer(token.filename, { outputVar: 'slot_main' }),
            line: -1,
            filename: token.filename,
        };
        let slotsCounter = 0;
        /**
         * Loop over all the component children
         */
        token.children.forEach((child) => {
            /**
             * If children is not a slot, then add it to the main slot
             */
            if (!edge_lexer_1.utils.isTag(child, 'slot')) {
                /**
                 * Ignore first newline inside the unnamed main slot
                 */
                if (mainSlot.buffer.size === 0 && child.type === 'newline') {
                    return;
                }
                parser.processToken(child, mainSlot.buffer);
                return;
            }
            /**
             * Fetch slot and props
             */
            const [slotName, slotProps] = getSlotNameAndProps(child, parser);
            slotsCounter++;
            /**
             * Create a new slot with buffer to process the children
             */
            if (!slots[slotName]) {
                /**
                 * Slot buffer points to the component file name, since slots doesn't
                 * have their own file names.
                 */
                slots[slotName] = {
                    outputVar: `slot_${slotsCounter}`,
                    buffer: new edge_parser_1.EdgeBuffer(token.filename, { outputVar: `slot_${slotsCounter}` }),
                    props: slotProps,
                    line: -1,
                    filename: token.filename,
                };
                /**
                 * Only start the frame, when there are props in use for a given slot.
                 */
                if (slotProps) {
                    parser.stack.defineScope();
                    parser.stack.defineVariable(slotProps);
                }
            }
            /**
             * Self process the slot children.
             */
            child.children.forEach((grandChildren) => {
                parser.processToken(grandChildren, slots[slotName].buffer);
            });
            /**
             * Close the frame after process the slot children
             */
            if (slotProps) {
                parser.stack.clearScope();
            }
        });
        const obj = new StringifiedObject_1.StringifiedObject();
        /**
         * Add main slot to the stringified object, when main slot
         * is not defined otherwise.
         */
        if (!slots['main']) {
            if (mainSlot.buffer.size) {
                mainSlot.buffer.wrap('function () {', '}');
                obj.add('main', mainSlot.buffer.disableFileAndLineVariables().flush());
            }
            else {
                obj.add('main', 'function () { return "" }');
            }
        }
        /**
         * We convert the slots to an objectified string, that is passed to `template.renderWithState`,
         * which will pass it to the component as it's local state.
         */
        Object.keys(slots).forEach((slotName) => {
            if (slots[slotName].buffer.size) {
                const fnCall = slots[slotName].props
                    ? `function (${slots[slotName].props}) {`
                    : 'function () {';
                slots[slotName].buffer.wrap(fnCall, '}');
                obj.add(slotName, slots[slotName].buffer.disableFileAndLineVariables().flush());
            }
            else {
                obj.add(slotName, 'function () { return "" }');
            }
        });
        const caller = new StringifiedObject_1.StringifiedObject();
        caller.add('filename', '$filename');
        caller.add('line', '$lineNumber');
        caller.add('col', 0);
        /**
         * Write the line to render the component with it's own state
         */
        buffer.outputExpression(`template.renderWithState(${name}, ${props}, ${obj.flush()}, ${caller.flush()})`, token.filename, token.loc.start.line, false);
    },
};
