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
const TEST_TOPIC_1_DEFAULT_STATE = 'test-topic-1-default-state'
const TEST_TOPIC_2_DEFAULT_STATE = 'test-topic-2-default-state'
const TEST_TOPIC_1_PUBLISH_STATE_1 = 'test-topic-1-published-state-1'
const TEST_TOPIC_1_PUBLISH_STATE_2 = 'test-topic-1-published-state-2'

describe('usePubSub', () => {

  it(`should return given default state if no publish has been called for topic`, () => {

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE))

    expect(subscriber1.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_DEFAULT_STATE)

  })

  it(`should return current publish state instead of given default state if a publish
      has been called for topic`, () => {

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_2_DEFAULT_STATE))

    expect(subscriber2.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_1)

  })

  it(`should publish state to all subscribers of published topic`, () => {

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_2_DEFAULT_STATE))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(subscriber1.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_1)
    expect(subscriber2.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_1)

  })

  it(`should NOT publish state to subscribers that not subscribed to published topic`, () => {

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_2, TEST_TOPIC_2_DEFAULT_STATE))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(subscriber1.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_1_PUBLISH_STATE_1)
    expect(subscriber2.current[PubSubTupleIndex.State]).toBe(TEST_TOPIC_2_DEFAULT_STATE)

  })

  it(`should no longer publish to a subscription when the subscriber requests to be unsubscribed`, () => {

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_2_DEFAULT_STATE))

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

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_2_DEFAULT_STATE))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
      subscriber2.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(getOutput()).toContain('A publish of unchanged state was attempted for topic:')

  })

  it(`should NOT output a warning message when in development mode if a duplicate state is published for a topic when \
  the global suppressDupeStateWarning setting is true`, () => {

    process.env.NODE_ENV = 'development'

    const getOutput = captureWarningOutput()

    configPubSub({
      suppressDupeStateWarning: true,
    })

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_2_DEFAULT_STATE))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
      subscriber2.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(getOutput()).not.toContain('A publish of unchanged state was attempted for topic:')

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

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_2_DEFAULT_STATE))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
      subscriber2.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(getOutput()).not.toContain('A publish of unchanged state was attempted for topic:')

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

    const { result: subscriber1 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_1_DEFAULT_STATE))
    const { result: subscriber2 } = renderHook(() => usePubSub<string>(TEST_TOPIC_1, TEST_TOPIC_2_DEFAULT_STATE))

    act(() => {
      subscriber1.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
      subscriber2.current[PubSubTupleIndex.Publish](TEST_TOPIC_1_PUBLISH_STATE_1)
    })

    expect(getOutput()).not.toContain('A publish of unchanged state was attempted for topic:')

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
