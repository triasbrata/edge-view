/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { lodash } from '@poppinss/utils'
import stringifyAttributes from 'stringify-attributes'
import { safeValue } from '../Context'

/**
 * Class to ease interactions with component props
 */
export class Props {
	constructor(options: { component: string; state: any }) {
		this[Symbol.for('options')] = options
		Object.assign(this, options.state)
	}

	/**
	 * Find if a key exists inside the props
	 */
	public has(key: string) {
		const value = lodash.get(this[Symbol.for('options')].state, key)
		return value !== undefined && value !== null
	}

	/**
	 * Validate prop value
	 */
	public validate(key: string, validateFn: (key: string, value?: any) => any) {
		const value = lodash.get(this[Symbol.for('options')].state, key)
		validateFn(key, value)
	}

	/**
	 * Return values for only the given keys
	 */
	public only(keys: string[]) {
		return lodash.pick(this[Symbol.for('options')].state, keys)
	}

	/**
	 * Return values except the given keys
	 */
	public except(keys: string[]) {
		return lodash.omit(this[Symbol.for('options')].state, keys)
	}

	/**
	 * Serialize all props to a string of HTML attributes
	 */
	public serialize(mergeProps?: any) {
		const attributes = lodash.merge({}, this[Symbol.for('options')].state, mergeProps)
		return safeValue(stringifyAttributes(attributes))
	}

	/**
	 * Serialize only the given keys to a string of HTML attributes
	 */
	public serializeOnly(keys: string[], mergeProps?: any) {
		const attributes = lodash.merge({}, this.only(keys), mergeProps)
		return safeValue(stringifyAttributes(attributes))
	}

	/**
	 * Serialize except the given keys to a string of HTML attributes
	 */
	public serializeExcept(keys: string[], mergeProps?: any) {
		const attributes = lodash.merge({}, this.except(keys), mergeProps)
		return safeValue(stringifyAttributes(attributes))
	}
}
