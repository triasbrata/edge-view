import { LoaderTemplate, CacheManagerContract } from '../Contracts';
/**
 * In memory cache manager to cache pre-compiled templates.
 */
export declare class CacheManager implements CacheManagerContract {
    private enabled;
    private cacheStore;
    constructor(enabled: boolean);
    /**
     * Returns a boolean to tell if a template has already been cached
     * or not.
     */
    has(absPath: string): boolean;
    /**
     * Returns the template from the cache. If caching is disabled,
     * then it will return undefined.
     */
    get(absPath: string): undefined | LoaderTemplate;
    /**
     * Set's the template path and the payload to the cache. If
     * cache is disabled, then this function results in a noop.
     */
    set(absPath: string, payload: LoaderTemplate): void;
}
