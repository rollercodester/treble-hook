/*!*
 * Copyright (c) Igneous, Inc. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export declare enum PubSubTupleIndex {
    State = 0,
    Publish = 1,
    Unsubscribe = 2,
    DeleteTopic = 3
}
export declare type Publish<T> = (newState: T) => void;
export interface TrebleHookConfig {
    suppressDupeStateWarning?: boolean;
    topicConfig?: TopicConfigMap;
}
export interface TopicConfig {
    allowDupeState?: boolean;
}
export interface TopicConfigMap {
    [topic: string]: TopicConfig;
}
export declare function configPubSub(config: TrebleHookConfig): void;
export declare function usePubSub<T>(topic: string, defaultState: T, publishDefaultState?: boolean): SubscriptionTuple<T>;
declare type PublicUnsubscribe = () => void;
declare type PublicDeleteTopic = () => void;
declare type SubscriptionTuple<T> = [T, Publish<T>, PublicUnsubscribe, PublicDeleteTopic];
export {};
