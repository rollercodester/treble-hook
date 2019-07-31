export declare function usePubSub<T>(topic: string, defaultState: T): SubscriptionTuple<T>;
declare type Publish<T> = (newState: T) => void;
declare type PublicUnsubscribe = () => void;
declare type SubscriptionTuple<T> = [T, Publish<T>, PublicUnsubscribe];
export {};
