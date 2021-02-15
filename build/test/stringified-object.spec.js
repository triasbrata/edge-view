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
const japa_1 = __importDefault(require("japa"));
const edge_parser_1 = require("edge-parser");
const StringifiedObject_1 = require("../src/StringifiedObject");
/**
 * Sample loc
 */
const LOC = {
    start: {
        line: 1,
        col: 0,
    },
    end: {
        line: 1,
        col: 0,
    },
};
japa_1.default.group('StringifiedObject', () => {
    japa_1.default('add string as a key-value pair to object', (assert) => {
        const stringified = new StringifiedObject_1.StringifiedObject();
        stringified.add('username', "'virk'");
        assert.equal(stringified.flush(), "{ username: 'virk' }");
    });
    japa_1.default('add number as a key-value pair to object', (assert) => {
        const stringified = new StringifiedObject_1.StringifiedObject();
        stringified.add('username', '22');
        assert.equal(stringified.flush(), '{ username: 22 }');
    });
    japa_1.default('add boolean as a key-value pair to object', (assert) => {
        const stringified = new StringifiedObject_1.StringifiedObject();
        stringified.add('username', 'true');
        assert.equal(stringified.flush(), '{ username: true }');
    });
    japa_1.default('add object as a key-value pair to object', (assert) => {
        const stringified = new StringifiedObject_1.StringifiedObject();
        stringified.add('username', '{ age: 22 }');
        assert.equal(stringified.flush(), '{ username: { age: 22 } }');
    });
    japa_1.default('add array as a key-value pair to object', (assert) => {
        const stringified = new StringifiedObject_1.StringifiedObject();
        stringified.add('username', '[10, 20]');
        assert.equal(stringified.flush(), '{ username: [10, 20] }');
    });
});
japa_1.default.group('StringifiedObject | fromAcornAst', () => {
    japa_1.default('stringify object expression', (assert) => {
        const parser = new edge_parser_1.Parser({});
        const expression = parser.utils.transformAst(parser.utils.generateAST("({ username: 'virk' })", LOC, 'eval.edge'), 'eval.edge', parser);
        const props = StringifiedObject_1.StringifiedObject.fromAcornExpressions([expression], parser);
        assert.equal(props, "{ username: 'virk' }");
    });
    japa_1.default('parse props with shorthand obj', (assert) => {
        const parser = new edge_parser_1.Parser({});
        const expression = parser.utils.transformAst(parser.utils.generateAST('({ username })', LOC, 'eval.edge'), 'eval.edge', parser);
        const props = StringifiedObject_1.StringifiedObject.fromAcornExpressions([expression], parser);
        assert.equal(props, '{ username: state.username }');
    });
    japa_1.default('parse props with computed obj', (assert) => {
        const parser = new edge_parser_1.Parser({});
        const expression = parser.utils.transformAst(parser.utils.generateAST('({ [username]: username })', LOC, 'eval.edge'), 'eval.edge', parser);
        const props = StringifiedObject_1.StringifiedObject.fromAcornExpressions([expression], parser);
        assert.equal(props, '{ [state.username]: state.username }');
    });
    japa_1.default('parse props with multiple obj properties', (assert) => {
        const parser = new edge_parser_1.Parser({});
        const expression = parser.utils.transformAst(parser.utils.generateAST("({ username: 'virk', age: 22 })", LOC, 'eval.edge'), 'eval.edge', parser);
        const props = StringifiedObject_1.StringifiedObject.fromAcornExpressions([expression], parser);
        assert.equal(props, "{ username: 'virk', age: 22 }");
    });
    japa_1.default('parse props with shorthand and full properties', (assert) => {
        const parser = new edge_parser_1.Parser({});
        const expression = parser.utils.transformAst(parser.utils.generateAST('({ username, age: 22 })', LOC, 'eval.edge'), 'eval.edge', parser);
        const props = StringifiedObject_1.StringifiedObject.fromAcornExpressions([expression], parser);
        assert.equal(props, '{ username: state.username, age: 22 }');
    });
    japa_1.default('parse props with assignment expression', (assert) => {
        const parser = new edge_parser_1.Parser({});
        const expression = parser.utils.transformAst(parser.utils.generateAST("(title = 'Hello')", LOC, 'eval.edge'), 'eval.edge', parser);
        const props = StringifiedObject_1.StringifiedObject.fromAcornExpressions([expression], parser);
        assert.equal(props, "{ title: 'Hello' }");
    });
    japa_1.default('parse props with more than one assignment expression', (assert) => {
        const parser = new edge_parser_1.Parser({});
        const expression = parser.utils.transformAst(parser.utils.generateAST("(title = 'Hello', body = 'Some content')", LOC, 'eval.edge'), 'eval.edge', parser);
        const props = StringifiedObject_1.StringifiedObject.fromAcornExpressions(expression.expressions, parser);
        assert.equal(props, "{ title: 'Hello', body: 'Some content' }");
    });
});
