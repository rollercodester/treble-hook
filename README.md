
<div>
  <img height="180" alt='treble-hook' src='https://raw.githubusercontent.com/rollercodester/treble-hook/master/doc-assets/treble-hook-3.png'/>
    <h3>
    <i>Simple, lightweight state management library for ReactJS with zero dependencies, weighing in at <a href="https://bundlephobia.com/result?p=treble-hook@latest">just under 900 bytes (gzip)</a>.</i>
  </h3>
  <br />
  <div style="float:left;">
    <a href="https://www.npmjs.com/package/treble-hook" rel="nofollow"><img src="https://img.shields.io/npm/v/treble-hook.svg?style=flat" alt="version"></a>
    <img src="https://img.shields.io/travis/rollercodester/treble-hook.svg?branch=master&style=flat" alt="Build Status">
    <a href="http://www.npmtrends.com/treble-hook" rel="nofollow"><img src="https://img.shields.io/npm/dm/treble-hook.svg?style=flat" alt="downloads"></a>
    <a href="https://github.com/rollercodester/treble-hook/blob/master/LICENSE" rel="nofollow"><img src="https://img.shields.io/npm/l/treble-hook.svg?style=flat" alt="MIT License"></a>
  </div>
</div>

<div style="float:none;">&nbsp;</div>

<br/>

```diff
- IMPORTANT: Upgrading from v1 to v2 includes breaking changes; see API below for new interfaces.
```
<br/>

# Installation

`yarn add treble-hook`

or

`npm install --save treble-hook`

<br/>

# Quick Start

```jsx
import trebleHook, { usePubSub } from 'treble-hook'

// Welcome.jsx
export default function Welcome() {
  const [guestName] = usePubSub('guest')

  return (
    <h3>Welcome to treble-hook, {guestName || ''}!</h3>
  )
}

// GuestEntry.jsx
export default function GuestEntry() {
  const [, pubGuestName] = usePubSub('guest')

  return (
    <div>
      <input
        type="text"
        onChange={(e) => { pubGuestName(e.target.value) }}
      />
    </div>
  )
}

// App.jsx
export default function App() {

  trebleHook.addTopic('guest', '')

  const GuestPublisher = trebleHook.getPublisher()

  return (
    <GuestPublisher>
      <GuestEntry />
      <br />
      <Welcome />
    </GuestPublisher>
  )
}
```

<br/>

# Live Examples on Codesandbox

- [Welcome](https://codesandbox.io/s/treble-hook-quick-start-z2m7r) (Quick Start example with Typescript + Material-UI)
- [Classic ToDo App](https://codesandbox.io/s/treble-hook-todos-y7fr0)
- Code Cracker Game (coming soon)

<br/>

# API

## <ins>trebleHook.addTopic()<ins>

Adds a new topic that can be published and subscribed to.

```ts
addTopic<T>(topicName: string, defaultValue: T, initWithSessionStorage = false): void
```
- `topicName` is the identifier for the topic and must be unique within the application.
- `defaultValue` will be used as the initial state value for respective topic.
- `initWithSessionStorage` determines whether to retrieve the topic's initial state from session storage. If `true`, then all subsequent published state changes will also be stored in sessions state for the app. This is helpful to ensure consistent state between any routes that require hard reloads.

<ins>Example:</ins>

```ts
import trebleHook from 'treble-hook'

trebleHook.addTopic('apples', 25)
trebleHook.addTopic('organges', 42)
trebleHook.addTopic('carrots', 100)
```

<br/>

## <ins>trebleHook.getPublisher()</ins>

Returns a TrebleHookPublisher JSX element that manages publications for given topics. The Publisher JSX should be placed high in the component tree (ancestral to all components that interact with the respective publisher state).

```ts
getPublisher(topics?: string[]): TrebleHookPublisher (JSX.Element)
```
- `topics` is the array of topic names contextual to this publisher that have been added using the `addTopic` method. If no topics are passed in then all topics will be included in the returned publisher.

<ins>Example:</ins>

```tsx
import React from 'react'
import trebleHook from 'treble-hook'

const FruitCountPublisher = trebleHook.getPublisher(['apples', 'oranges'])

return (
  <FruitCountPublisher>
    <FruitStand />
  </FruitCountPublisher>
)
```

<br/>

## <ins>usePubSub</ins>

A React hook that subscribes a component to a topic. The hook returns a tuple that is similar to the tuple returned from `useState` where the first element is the topic's current state value and the second element is the method to publish a new state value for the topic.

```ts
usePubSub<T>(topic: string): PubSubTuple<T>
```
- `topic` is the unique topic name to subscribe to.

<ins>Example:</ins>

```tsx
import React from 'react'
import { usePubSub } from 'treble-hook'

function FruitTable() {
  const [apples] = usePubSub<number>('apples')
  const [oranges] = usePubSub<number>('oranges')

  return (
    <div>
      <h3>Apple count: {apples}</h3>
      <h3>Orange count: {oranges}</h3>
    </div>
  )
}

function FruitVendor() {
  const [apples, pubApples] = usePubSub<number>('apples')
  const [oranges, pubOranges] = usePubSub<number>('oranges')

  return (
    <div>
      <button
        disabled={apples === 0}
        onClick={() => {
          pubApples(apples - 1)
        }}
      >
        Sell an apple
      </button>
      <button
        disabled={oranges === 0}
        onClick={() => {
          pubOranges(oranges - 1)
        }}
      >
        Sell an orange
      </button>
    </div>
  )
}

function FruitStand() {
  <FruitTable />
  <FruitVendor />
}
```

<br/>

# Liscense

### MIT
