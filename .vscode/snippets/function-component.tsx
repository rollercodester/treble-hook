import log from '@igneous.io/ux-logger'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import React, { useEffect } from 'react'


// ---------------------------------------
//
//  style definitions for component
//
// ---------------------------------------
const getClasses = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
  },
}))


/**
 * Renders the Policy Execution view.
 */
const GreetingsEarthling: React.FC<Props> = ({ name }) => {

  // --------------------------
  //
  //  style management
  //
  // --------------------------
  const classes = getClasses()


  // --------------------------
  //
  //  data management
  //
  // --------------------------

  // TODO: put data manager hooks here!


  // --------------------------
  //
  //  state management
  //
  // --------------------------

  // TODO: put react hooks here!


  // --------------------------
  //
  //  lifecycle management
  //
  // --------------------------

  // executes after EVERY render
  useEffect(() => {
    log.debug('GreetingsEarthling:render')
  })


  // --------------------------
  //
  //  simple child components
  //
  // --------------------------

  // TODO: put simple child components here


  // --------------------------
  //
  //  callback handlers
  //
  // --------------------------

  // TODO: put callback handlers here


  // --------------------------
  //
  //  render logic
  //
  // --------------------------

  return (
    <article className={classes.root}>
      <h1>Greetings earthling, { name } </h1>
    </article>
  )

}

export default GreetingsEarthling


// ---------------------------------------
//
//  interfaces
//
// ---------------------------------------

interface Props {
  name: string
}
