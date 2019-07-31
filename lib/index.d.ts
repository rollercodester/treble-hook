export declare enum TupleIndex {
    State = 0,
    Publish = 1,
    Unsubscribe = 2
}
export declare function usePubSub<T>(topic: string, defaultState: T): SubscriptionTuple<T>;
declare type Publish<T> = (newState: T) => void;
declare type PublicUnsubscribe = () => void;
declare type SubscriptionTuple<T> = [T, Publish<T>, PublicUnsubscribe];
export {};
