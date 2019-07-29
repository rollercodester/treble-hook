import React, { SetStateAction, useEffect, useState } from 'react'

const HOOK_PUBLISH_INDEX = 1

// inspired by: https://gist.github.com/LeverOne/1308368
// tslint:disable-next-line: no-any
const getUUID = (a?: any, b?: any) => {
  // tslint:disable-next-line
  for(b=a='';a++<36;b+=4<<~a*6.5?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b as string
}

// this is where all topic subscriptions are ultimately cached
const topics: TopicMap = {}

/**
 * Returns published state for topic or undefined if topic is not yet published.
 */
const getCurrentState = (topic: string) => {

  const topicRecord = topics[topic]

  if (topicRecord && topicRecord.hasBeenPublished) {

    return topicRecord.currentState

  } else {

    return undefined

  }

}

/**
 * Publishes a new state value to all subscribers of a topic.
 */
const publish = <T>(topic: string) => (newState: T) => {

  const topicRecord = topics[topic]

  if (topicRecord) {

    Object.values(topicRecord.subscriptionMap).forEach(publicHook => publicHook[HOOK_PUBLISH_INDEX](newState))

    // record current state, which is used to initialize new
    // subscribers of this topic with the last published state
    topicRecord.currentState = newState

    // set a flag to indicate that this topic has been published to
    topicRecord.hasBeenPublished = true

  } else {

    throw new Error(`Cannot publish to non-existent topic "${topic}"`)

  }

}

/**
 * Sets up the unsubscribe function that is returned for a specific topi subscriber.
 */
const unsubscribe: InternalUnsubscribe = (topic: string, subscriptionId?: string) => () => {

  const topicRecord = topics[topic]

  if (topicRecord && subscriptionId) {

    delete topicRecord.subscriptionMap[subscriptionId]

  }

}

/**
 * Hook that enables pub-sub functionality across ReactJS function components.
 */
function usePubSub<T>(topic: string, defaultState: T): SubscriptionTuple<T> {

  if (arguments.length !== 2) {

    throw new Error(
      `Invalid hook usage; hook must be initialized with two arguments. The first
      argument is the topic and the second argument is the default state value for the topic.`
    )

  }

  // internal hook that actually does the dispatching to this new subscriber
  const [state, setState] = useState<T>()

  // internal hook that stores the unique ID for this topic subscriber
  const [subscriptionId, setSubscriptionId] = useState<string>()

  /**
   * Internal hook for this subscription that is used to cache the resulting tuple.
   */
  const internalUsePubSubState = () => {

    let currentState = getCurrentState(topic)

    currentState = typeof currentState !== 'undefined'
      ? currentState = currentState as SetStateAction<T>
      : currentState = defaultState

    if (typeof state === 'undefined' && typeof currentState !== 'undefined') {
      setState(currentState)
    }

    return [state, setState] as InternalTuple<T>

  }

  let internalTuple: InternalTuple<T>

  if (!subscriptionId) {

    internalTuple = internalUsePubSubState()

  }

  useEffect(() => {

    //
    // create the new subscription when subscribing component mounts
    //

    const newSubscriptionId = getUUID()

    setSubscriptionId(newSubscriptionId)

    if (!topics[topic]) {

      //
      // initialize a new topic record for topic
      //
      topics[topic] = {
        currentState: state,
        hasBeenPublished: false,
        subscriptionMap: {},
      }

    }

    // store tuple for new subscription
    topics[topic].subscriptionMap[newSubscriptionId] = internalTuple

    return () => {

      //
      // automatically unsubscribe from topic when
      // component unmounts (to prevent memory leaks)
      //
      unsubscribe(topic, newSubscriptionId)()

    }

  }, [])

  // return the subscription tuple
  return [state || defaultState, publish<T>(topic), unsubscribe(topic, subscriptionId)]

}

export { usePubSub }


//
//
// local types/interfaces
//
//

type InternalUnsubscribe = (topic: string, subscriptionsId?: string) => PublicUnsubscribe
type InternalTuple<T> = [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>]
type Publish<T> = (newState: T) => void
type PublicUnsubscribe = () => void
type SubscriptionTuple<T> = [T, Publish<T>, PublicUnsubscribe]

interface TopicMap {
  // tslint:disable-next-line: no-any
  [topic: string]: TopicRecord<any>
}

interface TopicRecord<T> {
  currentState: T
  hasBeenPublished: boolean
  subscriptionMap: SubscriptionMap<T>
}

interface SubscriptionMap<T> {
  [subscriptionId: string]: InternalTuple<T>
}
