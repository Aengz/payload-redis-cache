export declare const FIRST_KEY_INDEX = 1;
export declare const IS_READ_ONLY = true;
export declare function transformArguments(key: string): Array<string>;
declare type ListWithCountRawReply = Array<string | number>;
declare type ListWithCountReply = Array<{
    item: string;
    count: number;
}>;
export declare function transformReply(rawReply: ListWithCountRawReply): ListWithCountReply;
export {};
