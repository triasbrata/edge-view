import { TagToken } from 'edge-lexer';
import { ProcessorContract, TemplateContract } from '../Contracts';
/**
 * Exposes the API to register a set of handlers to process the
 * templates output at different stages
 */
export declare class Processor implements ProcessorContract {
    private handlers;
    /**
     * Execute tag handler
     */
    executeTag(data: {
        tag: TagToken;
        path: string;
    }): void;
    /**
     * Execute raw handlers
     */
    executeRaw(data: {
        raw: string;
        path: string;
    }): string;
    /**
     * Execute compiled handlers
     */
    executeCompiled(data: {
        compiled: string;
        path: string;
    }): string;
    /**
     * Execute output handlers
     */
    executeOutput(data: {
        output: string;
        template: TemplateContract;
    }): string;
    /**
     * Define a processor function
     */
    process(event: 'raw', handler: (data: {
        raw: string;
        path: string;
    }) => string | void): this;
    process(event: 'tag', handler: (data: {
        tag: TagToken;
        path: string;
    }) => void): this;
    process(event: 'compiled', handler: (data: {
        compiled: string;
        path: string;
    }) => string | void): this;
    process(event: 'output', handler: (data: {
        output: string;
        template: TemplateContract;
    }) => string | void): this;
}
