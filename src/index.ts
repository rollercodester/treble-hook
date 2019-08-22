/*!*
 * Copyright (c) Igneous, Inc. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { SetStateAction, useEffect, useState } from 'react'

/**
 * Positional indexes for the tuple that is returned by usePubSub.
 */
export enum PubSubTupleIndex {
  State = 0,
  Publish = 1,
  Unsubscribe = 2,
}

/**
 * The type that defines the publish method's interface.
 */
export type Publish<T> = (newState: T) => void

/**
 * Interface that defines the config for treble-hook.
 */
export interface TrebleHookConfig {
  suppressDupeStateWarning?: boolean
  topicConfig?: TopicConfigMap
}

/**
 * Interface for a topic's config.
 */
export interface TopicConfig {
  allowDupeState?: boolean
}

/**
 * Map that holds all topic configs.
 */
export interface TopicConfigMap {
  [topic: string]: TopicConfig
}

// inspired by: https://gist.github.com/LeverOne/1308368
// tslint:disable-next-line: no-any
const getUUID = (a?: any, b?: any) => {
  // tslint:disable-next-line
  for(b=a='';a++<36;b+=4<<~a*6.5?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b as string
}

// this is where the config is cached and
// initialized with default settings
let trebleHookConfig: TrebleHookConfig = {}

// this is where all topic subscriptions are ultimately cached
const topics: TopicMap = {}

/**
 * Returns published state for topic or undefined if topic is not yet published.
 */
const getCurrentState = <T>(topic: string) => {

  const topicRecord = topics[topic]

  if (topicRecord && topicRecord.hasBeenPublished) {

    return topicRecord.currentState as SetStateAction<T>

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

    const allowDupeState = Boolean(
      trebleHookConfig.topicConfig
      && trebleHookConfig.topicConfig[topic]
      && trebleHookConfig.topicConfig[topic].allowDupeState
    )

    let proceed = true

    if (!allowDupeState) {

      const currentStateCompare = JSON.stringify(topicRecord.currentState)
      const newStateCompare = JSON.stringify(newState)

      proceed = newStateCompare !== currentStateCompare

    }

    if (proceed) {

      Object.values(topicRecord.subscriptionMap).forEach(
        publicHook => publicHook[PubSubTupleIndex.Publish](newState)
      )

      // record current state, which is used to initialize new
      // subscribers of this topic with the last published state
      topicRecord.currentState = newState

      // set a flag to indicate that this topic has been published to
      topicRecord.hasBeenPublished = true

    } else if (!trebleHookConfig.suppressDupeStateWarning) {

      const logWarning = process && process.env && process.env.NODE_ENV ? process.env.NODE_ENV === 'development' : true

      if (logWarning) {

        // tslint:disable-next-line: no-console
        console.warn(
          '[treble-hook] A publish of unchanged state was attempted for topic:',
          topic,
          '\n\n\t- If this is desired behavior then set the "allowDupeState" flag to true',
          '\n\t-To suppress this warning, set either "allowDupeState" for topic to true ' +
          'or set the global "suppressDupeStateWarning" flag to true'
        )

      }

    }

  } else {

    throw new Error(`Cannot publish to non-existent topic "${topic}"`)

  }

}

/**
 * Sets up the unsubscribe function that is returned for a specific topic subscriber.
 */
const unsubscribe: InternalUnsubscribe = (topic: string, subscriptionId?: string) => () => {

  const topicRecord = topics[topic]

  if (topicRecord && subscriptionId) {

    delete topicRecord.subscriptionMap[subscriptionId]

  }

}

export function configPubSub(config: TrebleHookConfig) {

  trebleHookConfig = {...trebleHookConfig, ...config}

}

/**
 * Hook that enables pub-sub functionality across ReactJS function components.
 */
export function usePubSub<T>(topic: string, defaultState: T): SubscriptionTuple<T> {

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

    const currentState = getCurrentState<T | undefined>(topic)

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

    if (typeof state === 'undefined') {

      //
      // this means that this is the first
      // subscriber to the topic, so initialize
      // the topic state by issuing a publish
      // using the default state passed in
      //

      publish(topic)(defaultState);

    }

    return () => {

      //
      // automatically unsubscribe from topic when
      // component unmounts (to prevent memory leaks)
      //
      unsubscribe(topic, newSubscriptionId)()

    }

  }, [])

  // return the subscription tuple
  return [typeof state !== 'undefined' ? state : defaultState, publish<T>(topic), unsubscribe(topic, subscriptionId)]

}


//
//
// local types/interfaces
//
//

type InternalUnsubscribe = (topic: string, subscriptionsId?: string) => PublicUnsubscribe
type InternalTuple<T> = [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>]
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
