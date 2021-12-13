# IndexNow

An IndexNow wrapper for TypeScript/JavaScript.

## Installation

### Node.js

```bash
# npm
npm i indexnow
# yarn
yarn add indexnow
```

### Deno

```js
import IndexNow from 'https://deno.land/x/indexnow.js@0.1.0/mod.ts'
```

## Usage

You can use the library using a functional or object-based approach.

```js
// functional
const { indexNow } = require('indexnow')

const key = "my-key"
const engine = SEARCH_ENGINES.BING

indexNow('https://example.com/new_page', engine, key)
// NOTE: First string in the list is used as the host, and will not be submitted
indexNow(['https://example.com', 'https://example.com/page1', 'https://example.com/page2'], engine, key)

// object-oriented
const IndexNow, { SEARCH_ENGINES } = require('indexnow')

const indexer = new IndexNow(SEARCH_ENGINES.BING, '<key>') // keyLocation is an optional third argument

indexer.submitUrl('https://example.com/new_page', key)
indexer.submitUrls('https://example.com', ['https://example.com/page1', 'https://example.com/page2'], key)
```
