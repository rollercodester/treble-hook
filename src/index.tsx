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

// topic cache
const topics: Topic = {}

export default (function TrebleHookPublisherFactory() {

   return {
      addTopic<T>(topicName: string, defaultValue: T) {
         if (topics[topicName]) {
            throw new Error(`The topic "${topicName}" has already been added.`)
         }

         // @ts-ignore
         const context = createPublishContext<T>()
         const provider = createPublishProvider<T>(context, defaultValue)

         topics[topicName] = {
            context,
            provider,
         }
      },

      getPublisher() {
         const TrebleHookPublisher: FC<PropsWithChildren<{}>> = ({
            children,
         }) => {
            const ProviderNest = Object.keys(topics).reduce(
               (tally, topicName) => {
                  const topic = topics[topicName]

                  if (!topic) {
                     throw new Error(getNoTopicErrorMessage(topicName))
                  }

                  const Provider = topic.provider

                  return <Provider>{tally}</Provider>
               },
               <>{children}</>
            )

            return ProviderNest
         }

         return TrebleHookPublisher
      },
   }
})()

export function usePubSub<T>(topic: string) {
   if (!topics[topic]) {
      throw new Error(getNoTopicErrorMessage(topic))
   }

   const topicDef = topics[topic]

   const context = useContext<ContextState<T>>(
      topicDef.context as Context<ContextState<T>>
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
 * Signature for Publish method
 */
export type Publish<T> = Dispatch<SetStateAction<T>>

type ContextState<T> = [T, Publish<T>]

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
      context: Context<ContextState<unknown>>
   }
}

//
//
// helpers
//
//

function createPublishContext<T>() {
  // @ts-ignore
  return createContext<ContextState<T>>()
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
