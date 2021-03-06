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
exports.CacheManager = void 0;
/**
 * In memory cache manager to cache pre-compiled templates.
 */
class CacheManager {
    constructor(enabled) {
        this.enabled = enabled;
        this.cacheStore = new Map();
    }
    /**
     * Returns a boolean to tell if a template has already been cached
     * or not.
     */
    has(absPath) {
        return this.cacheStore.has(absPath);
    }
    /**
     * Returns the template from the cache. If caching is disabled,
     * then it will return undefined.
     */
    get(absPath) {
        if (!this.enabled) {
            return;
        }
        return this.cacheStore.get(absPath);
    }
    /**
     * Set's the template path and the payload to the cache. If
     * cache is disabled, then this function results in a noop.
     */
    set(absPath, payload) {
        if (!this.enabled) {
            return;
        }
        this.cacheStore.set(absPath, payload);
    }
}
exports.CacheManager = CacheManager;
