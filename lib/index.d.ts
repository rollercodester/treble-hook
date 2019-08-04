export declare enum PubSubTupleIndex {
    State = 0,
    Publish = 1,
    Unsubscribe = 2
}
export declare type Publish<T> = (newState: T) => void;
export declare function usePubSub<T>(topic: string, defaultState: T): SubscriptionTuple<T>;
declare type PublicUnsubscribe = () => void;
declare type SubscriptionTuple<T> = [T, Publish<T>, PublicUnsubscribe];
export {};
