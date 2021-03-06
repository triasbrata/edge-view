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
exports.StringifiedObject = void 0;
/**
 * This class generates a valid object as a string, which is written to the template
 * output. The reason we need a string like object, since we don't want it's
 * properties to be evaluated during the object creation, instead it must
 * be evaluated when the compiled output is invoked.
 */
class StringifiedObject {
    constructor() {
        this.obj = '';
    }
    /**
     * Add key/value pair to the object.
     *
     * ```js
     * stringifiedObject.add('username', `'virk'`)
     * ```
     */
    add(key, value, isComputed = false) {
        key = isComputed ? `[${key}]` : key;
        this.obj += this.obj.length ? `, ${key}: ${value}` : `${key}: ${value}`;
    }
    /**
     * Returns the object alike string back.
     *
     * ```js
     * stringifiedObject.flush()
     *
     * // returns
     * `{ username: 'virk' }`
     * ```
     */
    flush() {
        const obj = `{ ${this.obj} }`;
        this.obj = '';
        return obj;
    }
    /**
     * Parses an array of expressions to form an object. Each expression inside the array must
     * be `ObjectExpression` or an `AssignmentExpression`, otherwise it will be ignored.
     *
     * ```js
     * (title = 'hello')
     * // returns { title: 'hello' }
     *
     * ({ title: 'hello' })
     * // returns { title: 'hello' }
     *
     * ({ title: 'hello' }, username = 'virk')
     * // returns { title: 'hello', username: 'virk' }
     * ```
     */
    static fromAcornExpressions(expressions, parser) {
        if (!Array.isArray(expressions)) {
            throw new Error('"fromAcornExpressions" expects an array of acorn ast expressions');
        }
        const objectifyString = new this();
        expressions.forEach((arg) => {
            if (arg.type === 'ObjectExpression') {
                arg.properties.forEach((prop) => {
                    const key = parser.utils.stringify(prop.key);
                    const value = parser.utils.stringify(prop.value);
                    objectifyString.add(key, value, prop.computed);
                });
            }
            if (arg.type === 'AssignmentExpression') {
                objectifyString.add(arg.left.name, parser.utils.stringify(arg.right));
            }
        });
        return objectifyString.flush();
    }
}
exports.StringifiedObject = StringifiedObject;
