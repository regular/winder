const test = require('tape')
const Winder = require('..')
const dayjs = require('dayjs')
const pull = require('pull-stream')

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

function compare(a,b) {
  if (a.isBefore(b)) return -1
  if (a.isAfter(b)) return 1
  return 0
}

const winder = Winder(
  codec,
  compare,
  {day, week, year}
)

test('One week before on Sunday', t=>{
  pull(
    winder('2019-08-09|skip -1 week|find -1 day day==0'),
    pull.collect((err, result) => {
      t.error(err)
      t.equal(result.length, 1)
      t.equal(result[0], 'Su 2019-07-28')
      t.end()
    })
  )
})

test('6 years later and one week before on Sunday', t=>{
  pull(
    winder('2019-08-09|skip n year|skip -1 week|find -1 day day==0'),
    pull.through(console.log),
    pull.take(7),
    pull.collect((err, result)=>{
      t.error(err)
      t.equal(result.length, 7)
      t.equal(result[6], 'Su 2025-07-27')
      t.end()
    })
  )
})

test('Test gt', t=>{
  pull(
    winder('2019-08-09|skip n year|skip -1 week|find -1 day day==0', {
      gt: '2025-07-26'
    }),
    pull.through(console.log),
    pull.take(5),
    pull.collect((err, result)=>{
      t.error(err)
      t.equal(result.length, 5)
      t.equal(result[0], 'Su 2025-07-27')
      t.end()
    })
  )
})

test('Test gte', t=>{
  pull(
    winder('2019-08-09|skip n year|skip -1 week|find -1 day day==0', {
      gte: '2025-07-27'
    }),
    pull.through(console.log),
    pull.take(5),
    pull.collect((err, result)=>{
      t.error(err)
      t.equal(result.length, 5)
      t.equal(result[0], 'Su 2025-07-27')
      t.end()
    })
  )
})

test('Test lte', t=>{
  pull(
    winder('2019-08-09|skip n year|skip -1 week|find -1 day day==0', {
      lte: '2025-07-27'
    }),
    pull.through(console.log),
    pull.collect((err, result)=>{
      t.error(err)
      t.equal(result.length, 7)
      t.equal(result[6], 'Su 2025-07-27')
      t.end()
    })
  )
})

test('upper bound is before first value', t=>{
  pull(
    winder('2019-08-09|skip n year|skip -1 week|find -1 day day==0', {
      lt: '1973-01-01'
    }),
    pull.through(console.log),
    pull.collect((err, result)=>{
      t.error(err)
      t.equal(result.length, 0)
      t.end()
    })
  )
})

test('Test reverse', t=>{
  pull(
    winder('2019-08-09|skip n year|skip -1 week|find -1 day day==0', {
      gt: '1970-01-01',
      lt: '1973-01-01',
      reverse: true
    }),
    pull.through(console.log),
    pull.collect((err, result)=>{
      t.error(err)
      t.equal(result.length, 3)
      t.equal(result[0], 'Su 1972-07-30')
      t.equal(result[2], 'Su 1970-07-26')
      t.end()
    })
  )
})
