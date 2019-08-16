
<div>
  <img height="180" alt='treble-hook' src='https://raw.githubusercontent.com/rollercodester/treble-hook/master/doc-assets/treble-hook-3.png'/>
  <p>
    <i>Super easy way to get "hooked" on subscribe-and-publish in React with no dependencies and no cruft.</i>
  </p>
  <br />
  <div style="float:left;">
    <a href="https://www.npmjs.com/package/treble-hook" rel="nofollow"><img src="https://img.shields.io/npm/v/treble-hook.svg?style=flat" alt="version"></a>
    <img src="https://img.shields.io/travis/igneous-systems/treble-hook.svg?branch=master&style=flat" alt="Build Status">
    <a href="http://www.npmtrends.com/treble-hook" rel="nofollow"><img src="https://img.shields.io/npm/dm/treble-hook.svg?style=flat" alt="downloads"></a>
    <a href="https://github.com/igneous-systems/treble-hook/blob/master/LICENSE" rel="nofollow"><img src="https://img.shields.io/npm/l/treble-hook.svg?style=flat" alt="MIT License"></a>
  </div>
</div>

<div style="float:none;">&nbsp;</div>


## Quick Start

### Installation

`yarn add treble-hook`

or

`npm install --save treble-hook`

### Usage

Contrived sign-in component along with component that displays active user (signed-in user).

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

## Documentation

### See the [Treble-Hook Wiki](https://github.com/igneous-systems/treble-hook/wiki) for API documentation and more.

## Live Codesandbox Examples

* [Sign-in README example](https://codesandbox.io/s/treble-hook-sign-in-example-ftsbx)
* [Crack That Code! game](https://codesandbox.io/s/treble-hook-presents-crack-that-code-vxcx1)


## Authors

Brought to you by the engineering team at [Igneous](https://www.igneous.io). Speaking of, we're always on the lookout for fun-loving, passionate engineers; visit [Igneous culture and careers](https://www.igneous.io/culture-and-careers) to learn more.

## Liscense

### MIT
