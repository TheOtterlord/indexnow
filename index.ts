/**
 * A Node.js script to port the Deno module.
 */

import fetch from 'node-fetch'

// @ts-ignore ignore typecheck
globalThis.fetch = fetch;

import IndexNow from './deno/mod'
export * from './deno/mod'
export default IndexNow
