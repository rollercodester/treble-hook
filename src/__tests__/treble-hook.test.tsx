import { act, renderHook } from '@testing-library/react-hooks'
import 'react'
import { PubSubTupleIndex, usePubSub } from '../'

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

})
