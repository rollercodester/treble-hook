import React, {
  createContext,
  Context,
  Dispatch,
  ElementType,
  FC,
  PropsWithChildren,
  ProviderProps,
  SetStateAction,
  useContext,
  useState
} from 'react'

const topicsCache: Topic = {}

export default (function TrebleHookPublisherFactory() {

  return {

    /**
     * Adds a new topic to TrebleHook that can be published and subscribed to.
     * @param topicName The name of the topic to add.
     * @param defaultValue The default (initial) state value for the topic.
     */
    addTopic<T>(topicName: string, defaultValue: T) {

      if (!topicsCache[topicName]) {

        //
        //
        // topic is new, so really add it
        //
        //

        // @ts-ignore
        const context = createPublishContext<T>()

        const provider = createPublishProvider<T>(context, defaultValue)

        topicsCache[topicName] = {
          context,
          provider,
        }

      }

    },

    /**
     * Returns a TrebleHookPublisher that manages publications for given topics.
     * The returned publisher should be placed above all consuming components in
     * React component tree.
     * @param topics Optional array of topics to publish to. By default,
     * all added topics will be published to.
     */
    getPublisher(topics?: string[]) {

      const TrebleHookPublisher: FC<PropsWithChildren<{}>> = ({
        children,
      }) => {

        //
        // don't trust the topics passed in...always defensively
        // build list to publish by filtering from actual cache
        //
        const topicNames = topics && topics.length
          ? Object.keys(topicsCache).filter(key => topics.some(topicName => topicName === key))
          : Object.keys(topicsCache)

        const ProviderNest = topicNames.reduce((tally, topicName) => {

          const topic = topicsCache[topicName]

          if (!topic) {
            throw new Error(getNoTopicErrorMessage(topicName))
          }

          const Provider = topic.provider

          return <Provider>{tally}</Provider>

        }, <>{children}</>)

        return ProviderNest

      }

      return TrebleHookPublisher

    },

  }

})()

/**
 * Hook that subscribes to a topic
 * @param topic The topic to subscribe to.
 */
export function usePubSub<T>(topic: string) {

  if (!topicsCache[topic]) {
    throw new Error(getNoTopicErrorMessage(topic))
  }

  const topicDef = topicsCache[topic]

  const context = useContext<PubSubTuple<T>>(
    topicDef.context as Context<PubSubTuple<T>>
  )

  if (!context) {
    throw new Error(
      `The "${topic} topic must be used within the context of a TrebleHook publisher.
         Please wrap your App component with a TrebleHook publisher.`
    )
  }

  return context

}

//
//
// interfaces
//
//

/**
 * Signature for publish method
 */
export type Publish<T> = Dispatch<SetStateAction<T>>

/**
 * Signature for state and publish tuple
 */
export type PubSubTuple<T> = [T, Publish<T>]

/**
 * Positional indexes for the tuple that is returned by usePubSub.
 */
export enum PubSubTupleIndex {
  State = 0,
  Publish = 1,
}

interface Topic {
  [name: string]: {
    provider: ElementType
    context: Context<PubSubTuple<unknown>>
  }
}

//
//
// helpers
//
//

function createPublishContext<T>() {
  // @ts-ignore because we don't want to
  // pass in default value, which is really
  // optional under the hood even though
  // type definition has it required
  return createContext<PubSubTuple<T>>()
}

function createPublishProvider<T>(
  TrebleHookContext: Context<T>,
  defaultValue: T
) {
  return (props: ProviderProps<T>) => {
    const contextState = useState(defaultValue)
    return <TrebleHookContext.Provider value={contextState} {...props} />
  }
}

function getNoTopicErrorMessage(topicName: string) {
  return `The topic "${topicName}" has not been added.
  Please use the addTopic function to do so before getting the Publisher.`
}
