declare function usePubSub<T>(topic: string, defaultState: T): SubscriptionTuple<T>;
export default usePubSub;
declare type Publish<T> = (newState: T) => void;
declare type PublicUnsubscribe = () => void;
declare type SubscriptionTuple<T> = [T, Publish<T>, PublicUnsubscribe];
