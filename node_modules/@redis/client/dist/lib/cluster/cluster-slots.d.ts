import { RedisClientType } from '../client';
import { RedisClusterOptions } from '.';
import { RedisCommandArgument, RedisFunctions, RedisModules, RedisScripts } from '../commands';
export interface ClusterNode<M extends RedisModules, F extends RedisFunctions, S extends RedisScripts> {
    id: string;
    client: RedisClientType<M, F, S>;
}
interface NodeAddress {
    host: string;
    port: number;
}
export declare type NodeAddressMap = {
    [address: string]: NodeAddress;
} | ((address: string) => NodeAddress | undefined);
declare type OnError = (err: unknown) => void;
export default class RedisClusterSlots<M extends RedisModules, F extends RedisFunctions, S extends RedisScripts> {
    #private;
    constructor(options: RedisClusterOptions<M, F, S>, onError: OnError);
    connect(): Promise<void>;
    rediscover(startWith: RedisClientType<M, F, S>): Promise<void>;
    getSlotMaster(slot: number): ClusterNode<M, F, S>;
    getClient(firstKey?: RedisCommandArgument, isReadonly?: boolean): RedisClientType<M, F, S>;
    getMasters(): Array<ClusterNode<M, F, S>>;
    getNodeByAddress(address: string): ClusterNode<M, F, S> | undefined;
    quit(): Promise<void>;
    disconnect(): Promise<void>;
}
export {};
