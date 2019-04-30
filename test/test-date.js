const test = require('tape')
const Winder = require('..')
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

test('One week before on Sunday', t=>{
  const result = winder('2019-08-09|skip -1 week|find -1 day day==0')
  t.equal(result, 'Su 2019-07-28')
  t.end()
})

test('6 years later and one week before on Sunday', t=>{
  const result = winder('2019-08-09|skip n year|skip -1 week|find -1 day day==0', 6)
  t.equal(result, 'Su 2025-07-27')
  t.end()
})