import React, { Dispatch, SetStateAction } from 'react';
declare const _default: {
    addTopic<T>(topicName: string, defaultValue: T, initWithSessionStorage?: boolean): void;
    getPublisher(topics?: string[] | undefined): React.FunctionComponent<{
        children?: React.ReactNode;
    }>;
};
export default _default;
export declare function usePubSub<T>(topic: string): [T, React.Dispatch<React.SetStateAction<T>>];
export declare type Publish<T> = Dispatch<SetStateAction<T>>;
export declare type PubSubTuple<T> = [T, Publish<T>];
export declare enum PubSubTupleIndex {
    State = 0,
    Publish = 1
}
