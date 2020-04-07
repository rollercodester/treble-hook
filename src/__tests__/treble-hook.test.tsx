/**
 * Copyright (c) Igneous, Inc. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// tslint:disable: no-console

import { act, renderHook } from '@testing-library/react-hooks'
import 'react'
import { configPubSub, PubSubTupleIndex, usePubSub } from '../'

const TEST_TOPIC_1 = 'test-topic-1'
const TEST_TOPIC_2 = 'test-topic-2'
const TEST_TOPIC_1_DEFAULT_STATE_1 = 'test-topic-1-default-state-1'
const TEST_TOPIC_1_DEFAULT_STATE_2 = 'test-topic-1-default-state-2'
const TEST_TOPIC_2_DEFAULT_STATE = 'test-topic-2-default-state'
const TEST_TOPIC_1_PUBLISH_STATE_1 = 'test-topic-1-published-state-1'
const TEST_TOPIC_1_PUBLISH_STATE_2 = 'test-topic-1-published-state-2'

describe('usePubSub', () => {

  it(`should return default state of second subscriber if first subscriber elected to not publish its default state for topic`, () => {

    renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_1))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_2, true))

    expect(subscriber2.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_DEFAULT_STATE_2)

    // delete topic so tests are properly reset
    act(() => {
      subscriber2.current[PubSubTupleIndex.DeleteTopic]()
    })

  })

  it(`should return given default state if no publish has been called for topic`, () => {

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_1))

    expect(subscriber1.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_DEFAULT_STATE_1)

    // delete topic so tests are properly reset
    act(() => {
      subscriber1.current[PubSubTupleIndex.DeleteTopic]()
    })

  })

  it(`should return given default state of first subscriber for any other subscribers if no publish has been called for topic`, () => {

    renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_1, true))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_2))

    expect(subscriber2.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_DEFAULT_STATE_1)

    // delete topic so tests are properly reset
    act(() => {
      subscriber2.current[PubSubTupleIndex.DeleteTopic]()
    })

  })

  it(`should handle numerous async subscriptions so that first to process sets default value (i.e. FIFO)`, () => {

    const subscriberPromises: Array<Promise<[string, () => void]>> = []

    let defaultState = TEST_TOPIC_1_DEFAULT_STATE_1

    for (let index = 0; index < 100; index++) {

      subscriberPromises.push(
        new Promise<[string, () => void]>(resolve => {

          const { result: subscriber } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, defaultState))

          resolve([subscriber.current[PubSubTupleIndex.State], subscriber.current[PubSubTupleIndex.DeleteTopic]])

        })
      )

      // make sure all other subscribers after first use different default
      defaultState = TEST_TOPIC_1_DEFAULT_STATE_2

    }

    Promise.all(subscriberPromises)
      .then(subscribers => {

        subscribers.forEach(s => {
          const [state] = s
          expect(state).toBe(TEST_TOPIC_1_DEFAULT_STATE_1)
        })

        if (subscribers.length) {

          // be sure to delete topic to reset for next test
          const deleteTopic = subscribers[0][1]
          deleteTopic()

        }

      })

  })

  it(`should return current publish state instead of given default state if a publish
      has been called for topic`, () => {

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_1))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_2))

    expect(subscriber2.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_1)

    // delete topic so tests are properly reset
    act(() => {
      subscriber1.current[PubSubTupleIndex.DeleteTopic]()
    })

  })

  it(`should publish state to all subscribers of published topic`, () => {

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_1))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_2))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(subscriber1.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_1)
    expect(subscriber2.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_1)

    // delete topic so tests are properly reset
    act(() => {
      subscriber1.current[PubSubTupleIndex.DeleteTopic]()
    })

  })

  it(`should NOT publish state to subscribers that have not subscribed to published topic`, () => {

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_1))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_2, TEST_TOPIC_2_DEFAULT_STATE))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(subscriber1.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_1)
    expect(subscriber2.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_2_DEFAULT_STATE)

    // delete topics so tests are properly reset
    act(() => {
      subscriber1.current[PubSubTupleIndex.DeleteTopic]()
      subscriber2.current[PubSubTupleIndex.DeleteTopic]()
    })

  })

  it(`should no longer publish to a subscription when the subscriber requests to be unsubscribed`, () => {

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_1))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_2))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(subscriber1.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_1)
    expect(subscriber2.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_1)

    act(() => {
      subscriber2.current[PubSubTupleIndex.Unsubscribe]()
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_2)
    })

    expect(subscriber1.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_2)
    expect(subscriber2.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_1)

    // delete topic so tests are properly reset
    act(() => {
      subscriber1.current[PubSubTupleIndex.DeleteTopic]()
    })

  })

  it(`should output a warning message when in development mode if a duplicate state is published for a topic when \
  the global suppressDupeStateWarning setting is false and the topic's allowDupeState setting is also false`, () => {

    process.env.NODE_ENV = 'development'

    const getOutput = captureWarningOutput()

    configPubSub({
      suppressDupeStateWarning: false,
      topicConfig: {
        [TEST_TOPIC_1]: {
          allowDupeState: false,
        },
      },
    })

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_1))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_2))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
      subscriber2.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(getOutput()).toContain('A publish of unchanged state was attempted for topic:')

    // delete topic so tests are properly reset
    act(() => {
      subscriber1.current[PubSubTupleIndex.DeleteTopic]()
    })

  })

  it(`should NOT output a warning message when in development mode if a duplicate state is published for a topic when \
  the global suppressDupeStateWarning setting is true`, () => {

    process.env.NODE_ENV = 'development'

    const getOutput = captureWarningOutput()

    configPubSub({
      suppressDupeStateWarning: true,
    })

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_1))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_2))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
      subscriber2.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(getOutput()).not.toContain('A publish of unchanged state was attempted for topic:')

    // delete topic so tests are properly reset
    act(() => {
      subscriber1.current[PubSubTupleIndex.DeleteTopic]()
    })

  })

  it(`should NOT output a warning message in development mode if a duplicate state is published for a topic when \
  the topic's allowDupeState setting is true`, () => {

    process.env.NODE_ENV = 'development'

    const getOutput = captureWarningOutput()

    configPubSub({
      suppressDupeStateWarning: false,
      topicConfig: {
        [TEST_TOPIC_1]: {
          allowDupeState: true,
        },
      },
    })

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_1))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_2))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
      subscriber2.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(getOutput()).not.toContain('A publish of unchanged state was attempted for topic:')

    // delete topic so tests are properly reset
    act(() => {
      subscriber1.current[PubSubTupleIndex.DeleteTopic]()
    })

  })

  it(`should NOT output a warning message when NOT in development mode if a duplicate state is published for a \
  topic when the global suppressDupeStateWarning setting is false and the topic's allowDupeState setting is also \
  false`, () => {

    process.env.NODE_ENV = 'production'

    const getOutput = captureWarningOutput()

    configPubSub({
      suppressDupeStateWarning: false,
      topicConfig: {
        [TEST_TOPIC_1]: {
          allowDupeState: false,
        },
      },
    })

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_1))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE_2))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
      subscriber2.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(getOutput()).not.toContain('A publish of unchanged state was attempted for topic:')

    // delete topic so tests are properly reset
    act(() => {
      subscriber1.current[PubSubTupleIndex.DeleteTopic]()
    })

  })

})


//
//
// helpers
//
//

function captureWarningOutput() {

  let output = ''
  const storeOutput = (input: string) => (output += input)
  const oldConsoleWarn = console.warn
  console.warn = jest.fn(storeOutput)


  return () => {
    console.warn = oldConsoleWarn
    return output
  }

}
