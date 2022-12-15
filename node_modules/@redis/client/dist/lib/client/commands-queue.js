"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RedisCommandsQueue_instances, _a, _RedisCommandsQueue_flushQueue, _RedisCommandsQueue_emitPubSubMessage, _RedisCommandsQueue_maxLength, _RedisCommandsQueue_waitingToBeSent, _RedisCommandsQueue_waitingForReply, _RedisCommandsQueue_pubSubState, _RedisCommandsQueue_PUB_SUB_MESSAGES, _RedisCommandsQueue_chainInExecution, _RedisCommandsQueue_decoder, _RedisCommandsQueue_pushPubSubCommand, _RedisCommandsQueue_updatePubSubActiveState, _RedisCommandsQueue_handlePubSubReply;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubUnsubscribeCommands = exports.PubSubSubscribeCommands = void 0;
const LinkedList = require("yallist");
const errors_1 = require("../errors");
const decoder_1 = require("./RESP2/decoder");
const encoder_1 = require("./RESP2/encoder");
var PubSubSubscribeCommands;
(function (PubSubSubscribeCommands) {
    PubSubSubscribeCommands["SUBSCRIBE"] = "SUBSCRIBE";
    PubSubSubscribeCommands["PSUBSCRIBE"] = "PSUBSCRIBE";
})(PubSubSubscribeCommands = exports.PubSubSubscribeCommands || (exports.PubSubSubscribeCommands = {}));
var PubSubUnsubscribeCommands;
(function (PubSubUnsubscribeCommands) {
    PubSubUnsubscribeCommands["UNSUBSCRIBE"] = "UNSUBSCRIBE";
    PubSubUnsubscribeCommands["PUNSUBSCRIBE"] = "PUNSUBSCRIBE";
})(PubSubUnsubscribeCommands = exports.PubSubUnsubscribeCommands || (exports.PubSubUnsubscribeCommands = {}));
class RedisCommandsQueue {
    constructor(maxLength) {
        _RedisCommandsQueue_instances.add(this);
        _RedisCommandsQueue_maxLength.set(this, void 0);
        _RedisCommandsQueue_waitingToBeSent.set(this, new LinkedList());
        _RedisCommandsQueue_waitingForReply.set(this, new LinkedList());
        _RedisCommandsQueue_pubSubState.set(this, {
            isActive: false,
            subscribing: 0,
            subscribed: 0,
            unsubscribing: 0,
            listeners: {
                channels: new Map(),
                patterns: new Map()
            }
        });
        _RedisCommandsQueue_chainInExecution.set(this, void 0);
        _RedisCommandsQueue_decoder.set(this, new decoder_1.default({
            returnStringsAsBuffers: () => {
                return !!__classPrivateFieldGet(this, _RedisCommandsQueue_waitingForReply, "f").head?.value.returnBuffers ||
                    __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").isActive;
            },
            onReply: reply => {
                if (__classPrivateFieldGet(this, _RedisCommandsQueue_instances, "m", _RedisCommandsQueue_handlePubSubReply).call(this, reply)) {
                    return;
                }
                else if (!__classPrivateFieldGet(this, _RedisCommandsQueue_waitingForReply, "f").length) {
                    throw new Error('Got an unexpected reply from Redis');
                }
                const { resolve, reject } = __classPrivateFieldGet(this, _RedisCommandsQueue_waitingForReply, "f").shift();
                if (reply instanceof errors_1.ErrorReply) {
                    reject(reply);
                }
                else {
                    resolve(reply);
                }
            }
        }));
        __classPrivateFieldSet(this, _RedisCommandsQueue_maxLength, maxLength, "f");
    }
    addCommand(args, options) {
        if (__classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").isActive && !options?.ignorePubSubMode) {
            return Promise.reject(new Error('Cannot send commands in PubSub mode'));
        }
        else if (__classPrivateFieldGet(this, _RedisCommandsQueue_maxLength, "f") && __classPrivateFieldGet(this, _RedisCommandsQueue_waitingToBeSent, "f").length + __classPrivateFieldGet(this, _RedisCommandsQueue_waitingForReply, "f").length >= __classPrivateFieldGet(this, _RedisCommandsQueue_maxLength, "f")) {
            return Promise.reject(new Error('The queue is full'));
        }
        else if (options?.signal?.aborted) {
            return Promise.reject(new errors_1.AbortError());
        }
        return new Promise((resolve, reject) => {
            const node = new LinkedList.Node({
                args,
                chainId: options?.chainId,
                returnBuffers: options?.returnBuffers,
                resolve,
                reject
            });
            if (options?.signal) {
                const listener = () => {
                    __classPrivateFieldGet(this, _RedisCommandsQueue_waitingToBeSent, "f").removeNode(node);
                    node.value.reject(new errors_1.AbortError());
                };
                node.value.abort = {
                    signal: options.signal,
                    listener
                };
                // AbortSignal type is incorrent
                options.signal.addEventListener('abort', listener, {
                    once: true
                });
            }
            if (options?.asap) {
                __classPrivateFieldGet(this, _RedisCommandsQueue_waitingToBeSent, "f").unshiftNode(node);
            }
            else {
                __classPrivateFieldGet(this, _RedisCommandsQueue_waitingToBeSent, "f").pushNode(node);
            }
        });
    }
    subscribe(command, channels, listener, returnBuffers) {
        const channelsToSubscribe = [], listenersMap = command === PubSubSubscribeCommands.SUBSCRIBE ?
            __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").listeners.channels :
            __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").listeners.patterns;
        for (const channel of (Array.isArray(channels) ? channels : [channels])) {
            const channelString = typeof channel === 'string' ? channel : channel.toString();
            let listeners = listenersMap.get(channelString);
            if (!listeners) {
                listeners = {
                    buffers: new Set(),
                    strings: new Set()
                };
                listenersMap.set(channelString, listeners);
                channelsToSubscribe.push(channel);
            }
            // https://github.com/microsoft/TypeScript/issues/23132
            (returnBuffers ? listeners.buffers : listeners.strings).add(listener);
        }
        if (!channelsToSubscribe.length) {
            return Promise.resolve();
        }
        return __classPrivateFieldGet(this, _RedisCommandsQueue_instances, "m", _RedisCommandsQueue_pushPubSubCommand).call(this, command, channelsToSubscribe);
    }
    unsubscribe(command, channels, listener, returnBuffers) {
        const listeners = command === PubSubUnsubscribeCommands.UNSUBSCRIBE ?
            __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").listeners.channels :
            __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").listeners.patterns;
        if (!channels) {
            const size = listeners.size;
            listeners.clear();
            return __classPrivateFieldGet(this, _RedisCommandsQueue_instances, "m", _RedisCommandsQueue_pushPubSubCommand).call(this, command, size);
        }
        const channelsToUnsubscribe = [];
        for (const channel of (Array.isArray(channels) ? channels : [channels])) {
            const sets = listeners.get(channel);
            if (!sets)
                continue;
            let shouldUnsubscribe;
            if (listener) {
                // https://github.com/microsoft/TypeScript/issues/23132
                (returnBuffers ? sets.buffers : sets.strings).delete(listener);
                shouldUnsubscribe = !sets.buffers.size && !sets.strings.size;
            }
            else {
                shouldUnsubscribe = true;
            }
            if (shouldUnsubscribe) {
                channelsToUnsubscribe.push(channel);
                listeners.delete(channel);
            }
        }
        if (!channelsToUnsubscribe.length) {
            return Promise.resolve();
        }
        return __classPrivateFieldGet(this, _RedisCommandsQueue_instances, "m", _RedisCommandsQueue_pushPubSubCommand).call(this, command, channelsToUnsubscribe);
    }
    resubscribe() {
        __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").subscribed = 0;
        __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").subscribing = 0;
        __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").unsubscribing = 0;
        const promises = [], { channels, patterns } = __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").listeners;
        if (channels.size) {
            promises.push(__classPrivateFieldGet(this, _RedisCommandsQueue_instances, "m", _RedisCommandsQueue_pushPubSubCommand).call(this, PubSubSubscribeCommands.SUBSCRIBE, [...channels.keys()]));
        }
        if (patterns.size) {
            promises.push(__classPrivateFieldGet(this, _RedisCommandsQueue_instances, "m", _RedisCommandsQueue_pushPubSubCommand).call(this, PubSubSubscribeCommands.PSUBSCRIBE, [...patterns.keys()]));
        }
        if (promises.length) {
            return Promise.all(promises);
        }
    }
    getCommandToSend() {
        const toSend = __classPrivateFieldGet(this, _RedisCommandsQueue_waitingToBeSent, "f").shift();
        if (!toSend)
            return;
        let encoded;
        try {
            encoded = (0, encoder_1.default)(toSend.args);
        }
        catch (err) {
            toSend.reject(err);
            return;
        }
        __classPrivateFieldGet(this, _RedisCommandsQueue_waitingForReply, "f").push({
            resolve: toSend.resolve,
            reject: toSend.reject,
            channelsCounter: toSend.channelsCounter,
            returnBuffers: toSend.returnBuffers
        });
        __classPrivateFieldSet(this, _RedisCommandsQueue_chainInExecution, toSend.chainId, "f");
        return encoded;
    }
    onReplyChunk(chunk) {
        __classPrivateFieldGet(this, _RedisCommandsQueue_decoder, "f").write(chunk);
    }
    flushWaitingForReply(err) {
        __classPrivateFieldGet(this, _RedisCommandsQueue_decoder, "f").reset();
        __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").isActive = false;
        __classPrivateFieldGet(RedisCommandsQueue, _a, "m", _RedisCommandsQueue_flushQueue).call(RedisCommandsQueue, __classPrivateFieldGet(this, _RedisCommandsQueue_waitingForReply, "f"), err);
        if (!__classPrivateFieldGet(this, _RedisCommandsQueue_chainInExecution, "f"))
            return;
        while (__classPrivateFieldGet(this, _RedisCommandsQueue_waitingToBeSent, "f").head?.value.chainId === __classPrivateFieldGet(this, _RedisCommandsQueue_chainInExecution, "f")) {
            __classPrivateFieldGet(this, _RedisCommandsQueue_waitingToBeSent, "f").shift();
        }
        __classPrivateFieldSet(this, _RedisCommandsQueue_chainInExecution, undefined, "f");
    }
    flushAll(err) {
        __classPrivateFieldGet(RedisCommandsQueue, _a, "m", _RedisCommandsQueue_flushQueue).call(RedisCommandsQueue, __classPrivateFieldGet(this, _RedisCommandsQueue_waitingForReply, "f"), err);
        __classPrivateFieldGet(RedisCommandsQueue, _a, "m", _RedisCommandsQueue_flushQueue).call(RedisCommandsQueue, __classPrivateFieldGet(this, _RedisCommandsQueue_waitingToBeSent, "f"), err);
    }
}
exports.default = RedisCommandsQueue;
_a = RedisCommandsQueue, _RedisCommandsQueue_maxLength = new WeakMap(), _RedisCommandsQueue_waitingToBeSent = new WeakMap(), _RedisCommandsQueue_waitingForReply = new WeakMap(), _RedisCommandsQueue_pubSubState = new WeakMap(), _RedisCommandsQueue_chainInExecution = new WeakMap(), _RedisCommandsQueue_decoder = new WeakMap(), _RedisCommandsQueue_instances = new WeakSet(), _RedisCommandsQueue_flushQueue = function _RedisCommandsQueue_flushQueue(queue, err) {
    while (queue.length) {
        queue.shift().reject(err);
    }
}, _RedisCommandsQueue_emitPubSubMessage = function _RedisCommandsQueue_emitPubSubMessage(listenersMap, message, channel, pattern) {
    const keyString = (pattern ?? channel).toString(), listeners = listenersMap.get(keyString);
    if (!listeners)
        return;
    for (const listener of listeners.buffers) {
        listener(message, channel);
    }
    if (!listeners.strings.size)
        return;
    const channelString = pattern ? channel.toString() : keyString, messageString = channelString === '__redis__:invalidate' ?
        // https://github.com/redis/redis/pull/7469
        // https://github.com/redis/redis/issues/7463
        (message === null ? null : message.map(x => x.toString())) :
        message.toString();
    for (const listener of listeners.strings) {
        listener(messageString, channelString);
    }
}, _RedisCommandsQueue_pushPubSubCommand = function _RedisCommandsQueue_pushPubSubCommand(command, channels) {
    return new Promise((resolve, reject) => {
        const isSubscribe = command === PubSubSubscribeCommands.SUBSCRIBE || command === PubSubSubscribeCommands.PSUBSCRIBE, inProgressKey = isSubscribe ? 'subscribing' : 'unsubscribing', commandArgs = [command];
        let channelsCounter;
        if (typeof channels === 'number') { // unsubscribe only
            channelsCounter = channels;
        }
        else {
            commandArgs.push(...channels);
            channelsCounter = channels.length;
        }
        __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").isActive = true;
        __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f")[inProgressKey] += channelsCounter;
        __classPrivateFieldGet(this, _RedisCommandsQueue_waitingToBeSent, "f").push({
            args: commandArgs,
            channelsCounter,
            returnBuffers: true,
            resolve: () => {
                __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f")[inProgressKey] -= channelsCounter;
                __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").subscribed += channelsCounter * (isSubscribe ? 1 : -1);
                __classPrivateFieldGet(this, _RedisCommandsQueue_instances, "m", _RedisCommandsQueue_updatePubSubActiveState).call(this);
                resolve();
            },
            reject: err => {
                __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f")[inProgressKey] -= channelsCounter * (isSubscribe ? 1 : -1);
                __classPrivateFieldGet(this, _RedisCommandsQueue_instances, "m", _RedisCommandsQueue_updatePubSubActiveState).call(this);
                reject(err);
            }
        });
    });
}, _RedisCommandsQueue_updatePubSubActiveState = function _RedisCommandsQueue_updatePubSubActiveState() {
    if (!__classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").subscribed &&
        !__classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").subscribing &&
        !__classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").subscribed) {
        __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").isActive = false;
    }
}, _RedisCommandsQueue_handlePubSubReply = function _RedisCommandsQueue_handlePubSubReply(reply) {
    if (!__classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").isActive || !Array.isArray(reply))
        return false;
    if (__classPrivateFieldGet(RedisCommandsQueue, _a, "f", _RedisCommandsQueue_PUB_SUB_MESSAGES).message.equals(reply[0])) {
        __classPrivateFieldGet(RedisCommandsQueue, _a, "m", _RedisCommandsQueue_emitPubSubMessage).call(RedisCommandsQueue, __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").listeners.channels, reply[2], reply[1]);
    }
    else if (__classPrivateFieldGet(RedisCommandsQueue, _a, "f", _RedisCommandsQueue_PUB_SUB_MESSAGES).pMessage.equals(reply[0])) {
        __classPrivateFieldGet(RedisCommandsQueue, _a, "m", _RedisCommandsQueue_emitPubSubMessage).call(RedisCommandsQueue, __classPrivateFieldGet(this, _RedisCommandsQueue_pubSubState, "f").listeners.patterns, reply[3], reply[2], reply[1]);
    }
    else if (__classPrivateFieldGet(RedisCommandsQueue, _a, "f", _RedisCommandsQueue_PUB_SUB_MESSAGES).subscribe.equals(reply[0]) ||
        __classPrivateFieldGet(RedisCommandsQueue, _a, "f", _RedisCommandsQueue_PUB_SUB_MESSAGES).pSubscribe.equals(reply[0]) ||
        __classPrivateFieldGet(RedisCommandsQueue, _a, "f", _RedisCommandsQueue_PUB_SUB_MESSAGES).unsubscribe.equals(reply[0]) ||
        __classPrivateFieldGet(RedisCommandsQueue, _a, "f", _RedisCommandsQueue_PUB_SUB_MESSAGES).pUnsubscribe.equals(reply[0])) {
        if (--__classPrivateFieldGet(this, _RedisCommandsQueue_waitingForReply, "f").head.value.channelsCounter === 0) {
            __classPrivateFieldGet(this, _RedisCommandsQueue_waitingForReply, "f").shift().resolve();
        }
    }
    return true;
};
_RedisCommandsQueue_PUB_SUB_MESSAGES = { value: {
        message: Buffer.from('message'),
        pMessage: Buffer.from('pmessage'),
        subscribe: Buffer.from('subscribe'),
        pSubscribe: Buffer.from('psubscribe'),
        unsubscribe: Buffer.from('unsubscribe'),
        pUnsubscribe: Buffer.from('punsubscribe')
    } };
