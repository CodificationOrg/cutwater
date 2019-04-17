# @codification/cutwater-core

Provides utilities for easily handling configuration, environment detection, timezone adjustments and string validation suitable for use in the browser or server-side.

## Installation

Via npm:

```bash
npm install @codification/cutwater-core
```

Via yarn:

```bash
yarn add @codification/cutwater-core
```

## Documentation

* [Release Notes](https://codificationorg.github.io/cutwater-core/CHANGELOG.html)
* [API Documentation](https://cutwater.codification.org/docs/api/cutwater-core/api-readme)

## Quick Start Guide

### Configuration

```typescript
import { Config } from '@codification/cutwater-core';

const url = Config.get('API_URL', 'https://api.example.com');
// Returns 'https://api.example.com' if there is no value for API_URL

const otherUrl = Config.getRequired('API_URL', 'API_URL is required!');
// Will throw an error (optionally with the provided message) if API_URL does not exist

Config.put('BACKUP_API_URL', 'https://api-backup.example.com');
```

---

### Environment

```typescript
import { Env } from '@codification/cutwater-core';

if (Env.isProd()) {
  console.log('Yeah, we made it to production!');
}
if (Env.isDev()) {
  console.log('Not yet I guess.');
}
```

---

### String Utility Functions

```typescript
import { StringUtils } from '@codification/cutwater-core';

if (StringUtils/contains('Check This', 'This')) {
  console.log('Yes, it contains it.');
}
if (StringUtils.startsWith('x-forward', 'x-')) {
  console.log('A custom header.');
}
if (StringUtils.endsWith('x-Forward-Cookies', 'cookies', true)) {
  console.log('Case insensitivity FTW.');
}
```

---

### Time

```typescript
import { TimeUnit, TZUtils } from '@codification/cutwater-core';

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