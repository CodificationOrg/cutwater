---
id: getting-started
title: Getting Started
---

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

* [Release Notes](https://cutwater.codification.org/CHANGELOG.html)
* [API Documentation](https://codificationorg.github.io/cutwater-core/index.html)

## Quick Start Guide

### Configuration

```typescript
import { Config } from 'cutwater-core';

const url = Config.get('API_URL', 'https://api.example.com');
// Returns 'https://api.example.com' if there is no value for API_URL

const otherUrl = Config.getRequired('API_URL', 'API_URL is required!');
// Will throw an error (optionally with the provided message) if API_URL does not exist

Config.put('BACKUP_API_URL', 'https://api-backup.example.com');
```

---

### Environment

```typescript
import { Env } from 'cutwater-core';

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

---

### Time

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

---

### Logging

```typescript
import { LoggerFactory } from 'cutwater-core';

const LOG = LoggerFactory.getLogger();
LOG.info('Hey, here is a log message.');
LOG.debug('Examine this object: %j', someObj);
```

---

### Http

**Note:** The `http` related functions are designed to simplify aspects of working with the [http module in Node.js](https://nodejs.org/api/http.html)

```typescript
import { isResponseOk, LoggerFactory, mergeHeaders, toBodyText } from 'cutwater-core';

const LOG = LoggerFactory.getLogger();
const response = magicalHttpRequestFunction();
if(isResponseOk(response)){
  toBodyText(response).then(
    bodyTxt => {
      LOG.info('The body text was: %s', bodyTxt);
    }
  ).catch(
    err => {
      LOG.error('Oops! Problem reading the body: %j',err);
    }
  )

  const nextRequestHeaders = mergeHeaders(response.headers,{'x-custom-header':'Custom Value'},true);
  // Will add the 'x-custom-header' to the received headers, or overwrite if it already exists.
}
```