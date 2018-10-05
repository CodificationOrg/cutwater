# Cutwater Core

[![CircleCI](https://img.shields.io/circleci/project/github/CodificationOrg/cutwater-core.svg)](https://circleci.com/gh/CodificationOrg/cutwater-core)
[![NPM](https://img.shields.io/npm/v/cutwater-core.svg)](https://www.npmjs.com/package/cutwater-core)

A library providing general core functionality for TypeScript projects.

## Installation

Via npm:

```
npm install cutwater-core
```

Via yarn:

```
yarn add cutwater-core
```

## API

### Configuration

### Environment

### String Utilities

### Time Utilities

### Logging

The purpose of the Logging feature is to provide a simple, easy to use method for logging, both on the server and client side.

Basic usage:

```typescript
import { LoggerFactory } from 'cutwater-core';

const LOG = LoggerFactory.getLogger();
LOG.info('Hey, here is a log message.');
LOG.debug('Examine this object: %j', someObj);
```

#### `LoggerFactory`

##### METHODS

- `getLogger()`: By default this will return the default `Logger`. If a name is passed as an argument, a `Logger` with that name will be created, or, if one already exists, it will be returned.
- `logEnabledLevels(logger: Logger)`: This will print an entry in the logs for every log `Level` that is enabled for the specified `Logger`.

##### PROPERTIES

- `ENV_LOGGING_LEVEL`: _(readonly)_ Name of value read from `Config` to determine initial default `Level`. [LOGGING_LEVEL]
- `ENV_LOGGING_LEVEL_PREFIX`: _(readonly)_ Prefix for any `Config` based `Level` used for a specific `Logger`. [LOGGING_LEVEL_]
- `DEFAULT_LOGGER`: _(readonly)_ Name of the default `Logger`. [DEFAULT]
- `DEFAULT_LOGGING_LEVEL`: _(readonly)_ The default logging `Level`. [ERROR]
- `GLOBAL_LEVEL`: The `Level` used by all `Logger`s that do not have one set explicitly.
- `GLOBAL_APPENDER`: The `Appender` used by all `Logger`s that do not have one set explicitly.

### Http Utilities