# Cutwater Core

[![CircleCI](https://img.shields.io/circleci/project/github/CodificationOrg/cutwater-core.svg)](https://circleci.com/gh/CodificationOrg/cutwater-core)
[![NPM](https://img.shields.io/npm/v/cutwater-core.svg)](https://www.npmjs.com/package/cutwater-core)

A library providing the functionality that we always seem to need in every project Typescript/Javascript project.

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

const url = Config.get('API_URL', 'https://api.example.com');
// Returns 'https://api.example.com' if there is no value for API_URL

const otherUrl = Config.getRequired('API_URL', 'API_URL is required!');
// Will throw an error (optionally with the provided message) if API_URL does not exist

Config.put('BACKUP_API_URL', 'https://api-backup.example.com');
```

#### `Config`

##### METHODS

- `put(key: string, value: string): void` - This will set the provided configuration `key` to the specified `value`. This does not make any changes to `process.env`, the key/value pair is stored in memory only.
- `get(key: string, defaultValue?: string): string` - Returns the value associated with the `key`, checking first for values provided by the `put` method and then from `process.env`. If the value is not found, the `defaultValue` is returned, or an empty string if that is not provided.
- `getRequired(key: string, errorMsg?: string): string` - Returns the value associated with the `key`, checking first for values provided by the `put` method and then from `process.env`. Unlike the `get` method, an error is thrown if the value is not found, using the message specified if provided.

---

### Environment

Basic usage:

```typescript
import { Env } from 'cutwater-core';

if (Env.isProd()) {
  console.log('Yeah, we made it to production!');
}
if (Env.isDev()) {
  console.log('No yet I guess.');
}
```

#### `Env`

##### METHODS

- `isProd(): boolean` - Returns `true` if the `STAGE` value in `Config` indicates a production environment.
- `isDev(): boolean` - Returns `true` if the `STAGE` value in `Config` does not indicate a production environment. In other words: `!Env.isProd()`.

##### PROPERTIES

- `ENV_STAGE` - _(readonly)_ Name of the `Config` variable expected to contain the name of the environment. [STAGE]
- `DEFAULT_PROD_STAGE` - _(readonly)_ Default value for the `STAGE` variable in `Config` to indicate a production environment. [prod]
- `ENV_PROD_STAGE`- _(readonly)_ Name of the `Config` variable expected to contain an override of the default production environment name. [PROD_STAGE]

---

### String Utility Functions

Basic usage:

```typescript
import { contains, startWith, endsWith } from 'cutwater-core';

if (contains('Check This', 'This')) {
  console.log('Yes, it contains it.');
}
if (startsWith('x-forward', 'x-')) {
  console.log('A custom header.');
}
if (endsWith('x-Forward-Cookies', 'cookies', true)) {
  console.log('Case insensitivity FTW.');
}
```

#### FUNCTIONS

- `contains(value: string, searchTerm: string, caseInsensitive?: boolean): boolean` - Returns `true` if the `value` contains the `searchTerm`. By default, this function is case sensitive.
- `startsWith(value: string, searchTerm: string, caseInsensitive?: boolean): boolean` - Returns `true` if the `value` starts with the `searchTerm`. By default, this function is case sensitive.
- `endsWith(value: string, searchTerm: string, caseInsensitive?: boolean): boolean` - Returns `true` if the `value` ends with the `searchTerm`. By default, this function is case sensitive.

---

### Time

Basic usage:

```typescript
import { TimeUnit, TZUtils } from 'cutwater-core';

const oneDayInSeconds = TimeUnit.days(1).toSeconds();
const fiveMinutesInMillis = TimeUnit.minutes(5).toMillis();

console.log(TZUtils.timestamp());
// 2018-10-06 15:22:12,345 (This is UTC)

TZUtils.timezoneOffset = TimeUnit.hours(-5).toMinutes();
console.log(TZUtils.timestamp());
// 2018-10-06 10:22:12,345 (Now we get the time in Ecuador, UTC-5)

const localizedDate = TZUtils.now();
// localizedDate is the current date/time based on the timezoneOffset, Ecuador in this case.
```

#### `TimeUnit`

##### METHODS

- `days(count: number): TimeUnit` - Returns a `TimeUnit` representing the specified number of days.
- `hourse(count: number): TimeUnit` - Returns a `TimeUnit` representing the specified number of hours.
- `minutes(count: number): TimeUnit` - Returns a `TimeUnit` representing the specified number of minutes.
- `seconds(count: number): TimeUnit` - Returns a `TimeUnit` representing the specified number of seconds.
- `millis(count: number): TimeUnit` - Returns a `TimeUnit` representing the specified number of milliseconds.
- `toDays(): number` - Returns the number of days, rounded to the greatest integer less than or equal to, the `TimeUnit` instance.
- `toHours(): number` - Returns the number of hours, rounded to the greatest integer less than or equal to, the `TimeUnit` instance.
- `toMinutes(): number` - Returns the number of minutes, rounded to the greatest integer less than or equal to, the `TimeUnit` instance.
- `toSeconds(): number` - Returns the number of seconds, rounded to the greatest integer less than or equal to, the `TimeUnit` instance.
- `toMillis(): number` - Returns the number of milliseconds, rounded to the greatest integer less than or equal to, the `TimeUnit` instance.

#### `TZUtils`

##### METHODS

- `timestamp(format?: string): string` - Returns the current timestamp as a string. The actual value depends on both the `timezoneOffset` and the optionally provided `format`.
  - Please see the [date-fns project](https://date-fns.org/v1.29.0/docs/format) for details about the valid values for the format string.

##### PROPERTIES

- `ENV_OFFSET` - _(readonly)_ Name of value read from `Config` to determine initial timezone if present. [UTC_OFFSET]
- `DEFAULT_OFFSET`- _(readonly)_ The default timezone offset if `UTX_OFFSET` is not set in `Config`. [0]
- `FORMAT_TIMESTAMP` - _(readonly)_ The default format used when calling `timestamp()`. [YYYY-MM-DD HH:mm:ss,SSS]
- `now` - _(readonly)_ A `Date` object representing the date/time at the current `timezoneOffset`.
- `timezoneOffset` - The current offset **_in minutes_** from UTC. May be positive or negative.

---

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

---

### Http

_Documentation Coming Soon!_
