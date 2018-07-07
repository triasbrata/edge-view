/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Parser } from 'edge-parser'
import { EdgeBuffer } from 'edge-parser/build/src/EdgeBuffer'
import { IBlockNode } from 'edge-lexer/build/src/Contracts'
import { allowExpressions } from '../utils'
import { each, size as lodashSize } from 'lodash'

export class EachTag {
  public static block = true
  public static seekable = true
  public static selfclosed = true
  public static tagName = 'each'

  private allowedExpressions = ['BinaryExpression']

  /**
   * Returns the value and key names for the foreach loop
   */
  private _getLoopKeyValue (expression: any): [string, string] {
    allowExpressions('each', expression, ['SequenceExpression', 'Identifier'])

    if (expression.type === 'SequenceExpression') {
      return [expression.expressions[0].name, expression.expressions[1].name]
    }

    return [expression.name, 'key']
  }

  private _getLoopSource (expression: any, parser: Parser): string {
    return parser.statementToString(parser.parseStatement(expression))
  }

  /**
   * Compiles else block node to Javascript else statement
   */
  public compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode) {
    const ast = parser.generateAst(token.properties.jsArg, token.lineno)
    const expression = ast.body[0].expression

    allowExpressions('each', expression, this.allowedExpressions)

    const [value, key] = this._getLoopKeyValue(expression.left)
    const rhs = this._getLoopSource(expression.right, parser)

    const elseIndex = token
      .children
      .findIndex((child) => {
        return child.type === 'block' && (child as IBlockNode).properties.name === 'else'
      })
    const elseChild = elseIndex > -1 ? token.children.splice(elseIndex) : []

    /**
     * If there is an else statement, then wrap the loop
     * inside the `if` statement first
     */
    if (elseIndex > -1) {
      buffer.writeStatement(`if(ctx.size(${rhs})) {`)
      buffer.indent()
    }

    /**
     * Write the loop statement to the template
     */
    buffer.writeStatement(`ctx.loop(${rhs}, function (${value}, ${key}) {`)

    /**
     * Indent block
     */
    buffer.indent()

    /**
     * Start a new context frame. Frame ensures the value inside
     * the loop is given priority over top level values. Think
     * of it as a Javascript block scope.
     */
    buffer.writeStatement('ctx.newFrame()')

    /**
     * Set key and value pair on the context
     */
    buffer.writeStatement(`ctx.setOnFrame('${value}', ${value})`)
    buffer.writeStatement(`ctx.setOnFrame('${key}', ${key})`)

    /**
     * Process all kids
     */
    token.children.forEach((child, index) => {
      parser.processToken(child, buffer)
    })

    /**
     * Remove the frame
     */
    buffer.writeStatement('ctx.removeFrame()')

    /**
     * Dedent block
     */
    buffer.dedent()

    /**
     * Close each loop
     */
    buffer.writeStatement('})')

    /**
     * If there is an else statement, then process
     * else childs and close the if block
     */
    if (elseIndex > -1) {
      elseChild.forEach((child) => parser.processToken(child, buffer))
      buffer.dedent()
      buffer.writeStatement(`}`)
    }
  }

  public static run (Context) {
    Context.macro('loop', function loop (source, callback) {
      each(source, (value, key) => {
        callback(value, key)
      })
    })

    Context.macro('size', function size (source) {
      return lodashSize(source)
    })
  }
}