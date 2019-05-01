const parse = require('./parse')
const debug = require('debug')('winder')
const ltgt = require('ltgt')

function defineType(codec, compare, fields) {
  const self = {
    encode: x => codec.encode(x),
    decode: x => codec.decode(x),
    find: (item, count, unit, conditions) => {
      do {
        item = self.skip(item, count, unit)
      } while(!self.checkConditions(item, conditions))
      return item
    },
    checkConditions: (item, conditions)=>{
      for(let {unit, value} of conditions) {
        const curVal = fields[unit]().get(item) 
        debug(`${unit} must be ${value} is ${curVal}`)
        if (String(curVal) !== String(value)) return false
      }
      debug('ok!')
      return true
    },
    skip: (item, count, unit) => {
      debug(`skip ${count} ${unit}`)
      const dir = count < 0 ? -1 : 1
      const f = fields[unit]()[count < 0 ? 'dec' : 'inc']
      count = Math.floor(Math.abs(count))
      for(let i=0; i<count; ++i) {
        item = f(item)
      }
      debug(codec.encode(item))
      return item
    }
  }
  return self
}

module.exports = function Winder(codec, compare, fields) {
  const t = defineType(codec, compare, fields)

  return function(s, opts) {
    opts = opts || {}
    const range = {}
    ltgt.toLtgt(opts, range, codec.decode)
    return source(s, range)
  }

  function source(s, range) {
    console.log('range', range)
    const sequence = parse(s)
    let recurring = false
    let ended
    let n = 0

    return function(end, cb) {
      if (end) ended = end
      if (ended) return cb && cb(ended)
      if (n>0 && !recurring) return cb(true)

      const startItem = codec.decode(sequence[0])
      let item
      while(true) {
        item = startItem
        for(let {count, unit, conditions} of sequence.slice(1)) {
          if (count == '+n') {count = n; recurring = true}
          if (count == '-n') {count = -n; recurring = true}

          if (conditions) item = t.find(item, count, unit, conditions)
          else item = t.skip(item, count, unit)
        }
        debug('n', n)
        n += range.reverse ? -1 : 1

        debug('item', codec.encode(item))

        if (ltgt.contains(range, item, compare)) break

        debug('not in range')

        // the value is not in range
        // is it because it is before lowerBound?
        const lb = ltgt.lowerBound(range)
        if (lb && compare(item, lb) !== (range.reverse ? -1 : 1)) {
          // yes, get anohter value
          if (recurring) continue
          debug('out of bounds and wont get there')
          ended = true
          return cb(true)
        }
        const ub = ltgt.upperBound(range)
        if (ub && compare(item, ub) !== (range.reverse ? 1 : -1)) {
          debug('beyond upper bound')
          ended = true
          return cb(true)
        }
        ended = new Error('invalid bounds')
        return cb(ended)
      }
      debug('in range')
      cb(null, codec.encode(item))
    }
  }
}

