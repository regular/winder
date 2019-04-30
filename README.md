Winder
===
A DSL to specify relative and recurring events

You can define a custom data type by passing a bunch of functions that extract field values ffom a compound (e.g. month from a date) and can increase and decrease that field's value.

Winder is using these functions to generate a series of events from a given first event.

To specify a series of events, you combine skip and find statements.


## Skip

`skip count unit`

Skip simply skips forward (or backward) a specified number of units. The number of units can either be a positive or negative integer, or the literal `+n` or `-n` (or `n`, which is the ame as `+n`)

The value for `n` can be specified at runtime and can be used to create a series.

## find

`find count unit unit1==value1 unit2==value2...`

`find` repeatedly calls `skip` until a set of conditions is met.


## Example

```
2019-08-09|skip n year|find -1 day day==Saturday
```
Starting from 9th of August 2019, skip ahead N years and then find the previous Saturday.

# API

```
const Winder = require('winder')
const winder = Winder(codec, fields)
console.log(winder('2019-08-09|skip n year|find -1 day day==Saturday', 1))
```

## Example for codec and fields using dayjs

```
const Winder = require('winder')
const dayjs = require('dayjs')

function day() {
  return {
    get: date => date.day(),
    inc: date => date.add(1, 'day'),
    dec: date => date.subtract(1, 'day')
  }
}

function week() {
  return {
    get: date => date.week(),
    inc: date => date.add(1, 'week'),
    dec: date => date.subtract(1, 'week')
  }
}

function year() {
  return {
    get: date => date.year(),
    inc: date => date.add(1, 'year'),
    dec: date => date.subtract(1, 'year')
  }
}

const codec = {
  decode: x => dayjs(x, 'YYYY-MM-DD'),
  encode: x => x.format('dd YYYY-MM-DD')
}

const winder = Winder(
  codec,
  {day, week, year}
)

// One week before on Sunday'
const result = winder('2019-08-09|skip -1 week|find -1 day day==0')

// 6 years later and one week before on Sunday
const result = winder('2019-08-09|skip n year|skip -1 week|find -1 day day==0', 6)
```
