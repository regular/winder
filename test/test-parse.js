const test = require('tape')
const parse = require('../parse')

test('parse skip', t=>{
  t.deepEqual(
    parse('2019-03-21|skip 1 day'), [
      '2019-03-21',
      {
        unit: 'day',
        count: 1
      }
    ], 'positive integer'
  )
  t.deepEqual(
    parse('2019-03-21|skip -15 day'), [
      '2019-03-21',
      {
        unit: 'day',
        count: -15
      }
    ], 'negative integer'
  )
  t.deepEqual(
    parse('2019-03-21|skip n day'), [
      '2019-03-21',
      {
        unit: 'day',
        count: '+n'
      }
    ], 'positive n'
  )
  t.deepEqual(
    parse('2019-03-21|skip -n day'), [
      '2019-03-21',
      {
        unit: 'day',
        count: '-n'
      }
    ], 'negative n'
  )
  t.end()
})

test('parse find', t=>{
  t.throws( ()=>{
    parse('2019-03-21|find 1 day')
  }, 'empty conditions')

  t.deepEqual(
    parse('2019-03-21|find -15 day month==January'), [
      '2019-03-21',
      {
        unit: 'day',
        count: -15,
        conditions: [{
          unit: 'month',
          value: 'January'
        }]
      }
    ], 'one condition'
  )
  t.deepEqual(
    parse('2019-03-21|find n day day==Sunday month==January'), [
      '2019-03-21',
      {
        unit: 'day',
        count: '+n',
        conditions: [{
          unit: 'day',
          value: 'Sunday'
        }, {
          unit: 'month',
          value: 'January'
        }]
      }
    ], 'two conditions'
  )
  t.end()
})
