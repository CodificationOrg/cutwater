# @codification/cutwater-node-core

A library of tools for simplifying interaction with IO and HTTP on the server-side.

## Installation

Via npm:

```bash
npm install @codification/cutwater-node-core
```

Via yarn:

```bash
yarn add @codification/cutwater-node-core
```

## Documentation

* [Release Notes](https://codificationorg.github.io/cutwater-core/CHANGELOG.html)
* [API Documentation](https://cutwater.codification.org/docs/api/cutwater-node-core/api-readme)

## Quick Start Guide

### Http

**Note:** The `http` related functions are designed to simplify aspects of working with the [http module in Node.js](https://nodejs.org/api/http.html)

```typescript
import { HttpUtils } from '@codification/cutwater-node-core';

const LOG = LoggerFactory.getLogger();
const response = magicalHttpRequestFunction();
if(HttpUtils.isResponseOk(response)){
  HttpUtils.toBodyText(response).then(
    bodyTxt => {
      LOG.info('The body text was: %s', bodyTxt);
    }
  ).catch(
    err => {
      LOG.error('Oops! Problem reading the body: %j',err);
    }
  )

  const nextRequestHeaders = HttpUtils.mergeHeaders(response.headers,{'x-custom-header':'Custom Value'},true);
  // Will add the 'x-custom-header' to the received headers, or overwrite if it already exists.
}
```