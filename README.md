
<div>
  <img height="180" alt='treble-hook' src='https://raw.githubusercontent.com/rollercodester/treble-hook/master/doc-assets/treble-hook-3.png'/>
  <p>
    <i>Super easy way to get "hooked" on subscribe-and-publish in React with no dependencies and no cruft.</i>
  </p>
  <br />
  <div style="float:left;">
    <a href="https://www.npmjs.com/package/treble-hook" rel="nofollow"><img src="https://img.shields.io/npm/v/treble-hook.svg?style=flat" alt="version"></a>
    <a href="https://travis-ci.org/rollercodester/treble-hook" rel="nofollow"><img src="https://img.shields.io/travis/rollercodester/treble-hook.svg?style=flat" alt="Build Status"></a>
    <a href="http://www.npmtrends.com/treble-hook" rel="nofollow"><img src="https://img.shields.io/npm/dm/treble-hook.svg?style=flat" alt="downloads"></a>
    <a href="https://github.com/igneous-systems/treble-hook/blob/master/LICENSE" rel="nofollow"><img src="https://img.shields.io/npm/l/treble-hook.svg?style=flat" alt="MIT License"></a>
  </div>
</div>

<div style="float:none;">&nbsp;</div>

## WARNING
This is still pre-release, so consider it beta, meaning there will likely be changes; however, we don't envision breaking interface.

## Installation

```sh
yarn add treble-hook
```
### or

```sh
npm install --save treble-hook
```

## Go ahead and give the tires a quick kick

Live code is so much better and more fun to boot, so we created a simple game to showcase treble-hook usage...

Step right up and play ["Crack That Code!" on codesandbox](https://codesandbox.io/s/treble-hook-presents-crack-that-code-vxcx1) !

## Usage

Contrived sign-in component and a component that displays active user (signed-in user).

> _But...wouldn't you rather see a [real live code example](https://codesandbox.io/s/treble-hook-presents-crack-that-code-vxcx1)?_

```tsx
import React, { ChangeEvent, useState } from 'react'
import { usePubSub } from 'treble-hook'

const ACTIVE_USER_TOPIC = 'active-user'

function SignIn() {

  // publishUser will do just that, publish the value
  // to all subscribers of the ACTIVE_USER_TOPIC
  const [_, publishUser] = usePubSub<string>(ACTIVE_USER_TOPIC, '')
  const [entered, setEntered] = useState<string>('')

  return (
    <div>
      <input
        type='text'
        onChange={
          (evt: ChangeEvent<HTMLInputElement>) => {
            setEntered(evt.target.value)
          }
        }
      />
      <button onClick={ () => { publishUser(entered) }}>Sign-in</button>
    </div>
  )

}

function ActiveUser() {

  // this subsribes the component to the ACTIVE_USER_TOPIC and
  // whenever the active user is published (from anywhere in the
  // app) it will get updated here. Also, this component doesn't
  // have to wait for the next publish, it will intialize with
  // the last published value or default to 'Anonymous' otherwise
  const [activeUser] = usePubSub<string>(
    ACTIVE_USER_TOPIC,
    'Anonymous'
  )

  return (
    <div>
      Active user: { activeUser }
    </div>
  )

}

```

## Motivation

The advent of Hooks in React 16.8 introduced a paradigm shift in how state *can* be managed in applications built on top of React. Arguably, the defacto standard for managing application state prior to 16.8 was Redux. This worked great but it came with its own idiosyncrasies and a lot of boilerplate. There were/are great alternatives to Redux but each seems to have its own complexities and/or different mannerisms that can feel, at times, "too much".

While the hooks feature provides a much easier approach to state management, its focus is really at the component level and not necessarily at the application level. But if you think about it, this is a very good thing and makes perfect sense. After all, React is more a library and less a framework, so it should confine itself to the component landscape along with the composition idioms that breathe life into that landscape.

## Same Old Same Old

So what are we to do if there is application state that we really need to share across multiple components, especially deeply nested sub-components?

All of the pre-Hooks-era options are certainly still available:

* Passing state down via props (aka prop-passing hell)
* Not-so-pretty code of render props
* HoCs (powerful, but not suited for state management)
* Context API (aka "global" application state)
* Component composition (inversion-of-control)
* Other state management libs (Redux, MobX, etc.)

But are any of these really well suited for a complex, real-world, single-page Web application that is built from the ground-up using hooks? The authors of this library believe that the answer is no, with the possible exception of the Context API; but it just feels yucky to use context for application state that isn't necessarily global.

### Redux + Hooks

Already have a lot of Redux code but you're really wanting to use React hooks for cross-cutting state going forward? Potential good news for you, then: [React-redux now supports hooks](https://react-redux.js.org/next/api/hooks), so maybe that's a viable alternative to refactoring a bunch of code, which is hardly ever fun.

Having said that, there's nothing wrong with using `treble-hook` AND `redux` going forward; it just means you'll have two different state management paradigms.

## Professional State Management

Any engineer that owns feature development and/or maintenenance of a large, single-page application built on React will most likely admit that keeping the component/sub-component structure completely logical is critical for continuous delivery/improvement. Adding on top of that the need to manage application state across multiple feature areas without going insane from over-abundance of boilerplate, prop-passing hell, and hard to debug 3rd party libraries...well, you get the picture.

To solve the problem, we wrote treble-hook, which very simply allows any component in an app to subscribe to state from anywhere in the tree and subsequently publish state at-will so that other components anywhere in the tree pick up those changes. Sounds like this would take a complicated library, right? Nope. Because treble-hook takes advantage of the power of hooks architecture, this functionality is possible via a library with zero hard dependencies and less than 3KB of code.

## Caveat

Even though treble-hook was written in Typescript and thus is the preferred way to consume the library, types in Typescript are compile-time only, meaning they cannot be enforced at runtime without not-so-perfect third party libraries. As such, it's possible for one component to subscribe to a topic using a completely different type than that of another subscribing component. If this were to happen and both components were to publish different data types, it would result in unexpected side-effects, for sure.

To mitigate this, it's a **strongly** suggested best practice to pre-define your state types with one or more enums and interfaces. This, of course, assumes you are writing your app in Typescript...and if you're not, you really should, but it's certainly not required. Regardless, like in Ghost Busters, you need to exercise extreme discipline and ensure that your proton packs don't cross streams. In other words, make sure that the data type published to a topic remains consistent throughout your application.

See the [live example code](https://codesandbox.io/s/treble-hook-presents-crack-that-code-vxcx1) for a peek at how we use enums/interfaces to _help_ enforce how topic policies are published, but even with this, we still have to publish application state responsibly. Can you say "code reviews"?

## Documentation

Coming soon.

## Authors

Brought to you by the engineering team at [Igneous](https://www.igneous.io). Speaking of, we're always on the lookout for fun-loving, passionate engineers; visit [Igneous culture and careers](https://www.igneous.io/culture-and-careers) to learn more.

## Issues

### Bugs

Find something we missed? File a bug and we'll take it from there. Want to fix yourself? See `Contributing` section below.

[Where bugs are trapped and squashed...](https://github.com/igneous-systems/treble-hook/labels/bug)

### Feaure Requests

Got a cool feature idea? By all means do submit it. Is your idea already added by someone else? Vote for it via a Github reaction to help bump its roadmap priority.

[Where features requests molt...](https://github.com/igneous-systems/treble-hook/labels/enhancement)

## Contributing

For now, we're keeping contributions internal, but that will change in the near future. Keep an eye out for our contribution guide (coming soon).

## Liscense

MIT
