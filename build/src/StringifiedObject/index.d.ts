import { Parser } from 'edge-parser';
/**
 * This class generates a valid object as a string, which is written to the template
 * output. The reason we need a string like object, since we don't want it's
 * properties to be evaluated during the object creation, instead it must
 * be evaluated when the compiled output is invoked.
 */
export declare class StringifiedObject {
    private obj;
    /**
     * Add key/value pair to the object.
     *
     * ```js
     * stringifiedObject.add('username', `'virk'`)
     * ```
     */
    add(key: any, value: any, isComputed?: boolean): void;
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
    flush(): string;
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
    static fromAcornExpressions(expressions: any[], parser: Parser): string;
}
