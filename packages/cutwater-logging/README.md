# @codification/cutwater-logging

A library providing easy logging capabilities for both the browser and server-side.

## Installation

Via npm:

```bash
npm install @codification/cutwater-logging
```

Via yarn:

```bash
yarn add @codification/cutwater-logging
```

## Documentation

* [API Documentation](https://cutwater.codification.org/docs/api/cutwater-logging/api-readme)

## Quick Start Guide

### Logging

```typescript
import { LoggerFactory } from 'cutwater-core';

const LOG = LoggerFactory.getLogger();
LOG.info('Hey, here is a log message.');
LOG.debug('Examine this object: %j', someObj);
```

---