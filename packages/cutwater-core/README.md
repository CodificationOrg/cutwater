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

Basic usage:

```typescript
import { Config } from 'cutwater-core';

const url = Config.get('API_URL','https://api.example.com');
// Returns 'https://api.example.com' if there is no value for API_URL
const otherUrl = Config.getRequired('API_URL','API_URL is required!');
// Will throw an error (optionally with the provided message) if API_URL does not exist
Config.put('BACKUP_API_URL','https://api-backup.example.com');
```

#### `Config`

##### METHODS

- `put(key: string, value: string): void` - This will set the provided configuration `key` to the specified `value`.  This does not make any changes to `process.env`, the key/value pair is stored in memory only.
- `get(key: string, defaultValue?: string): string` - Returns the value associated with the `key`, checking first for values provided by the `put` method and then from `process.env`.  If the value is not found, the `defaultValue` is returned, or an empty string if that is not provided.
- `getRequired(key: string, errorMsg?: string): string` - Returns the value associated with the `key`, checking first for values provided by the `put` method and then from `process.env`.  Unlike the `get` method, an error is thrown if the value is not found, using the message specified if provided.

### Environment

Basic usage:

```typescript
import { Env } from 'cutwater-core';

if(Env.isProd()){
    console.log('Yeah, we made it to production!');
}
if(Env.isDev()){
    console.log('No yet I guess.');
}
```

#### `Env`

##### METHODS

- `isProd(): boolean` - Returns `true` if the `STAGE` value in `Config` indicates a production environment.
- `isDev(): boolean` - Returns `true` if the `STAGE` value in `Config` does not indicate a production environment.  In other words: `!Env.isProd()`.

##### PROPERTIES

- `ENV_STAGE` - _(readonly)_ Name of the `Config` variable expected to contain the name of the environment. [STAGE]
- `DEFAULT_PROD_STAGE` - _(readonly)_ Default value for the `STAGE` variable in `Config` to indicate a production environment. [prod]
- `ENV_PROD_STAGE`- _(readonly)_ Name of the `Config` variable expected to contain an override of the default production environment name. [PROD_STAGE]

### Strings

*Documentation Coming Soon!*

### Time

*Documentation Coming Soon!*

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

- `getLogger(loggerName?: string): Logger` - By default this will return the default `Logger`. If a name is passed as an argument, a `Logger` with that name will be created, or, if one already exists, it will be returned.
- `logEnabledLevels(logger: Logger): void` - This will print an entry in the logs for every log `Level` that is enabled for the specified `Logger`.

##### PROPERTIES

- `ENV_LOGGING_LEVEL` - _(readonly)_ Name of value read from `Config` to determine initial default `Level`. [LOGGING_LEVEL]
- `ENV_LOGGING_LEVEL_PREFIX`- _(readonly)_ Prefix for any `Config` based `Level` used for a specific `Logger`. [LOGGING_LEVEL_]
- `DEFAULT_LOGGER` - _(readonly)_ Name of the default `Logger`. [DEFAULT]
- `DEFAULT_LOGGING_LEVEL` - _(readonly)_ The default logging `Level`. [ERROR]
- `GLOBAL_LEVEL` - The `Level` used by all `Logger`s that do not have one set explicitly.
- `GLOBAL_APPENDER` - The `Appender` used by all `Logger`s that do not have one set explicitly.

### Http

*Documentation Coming Soon!*