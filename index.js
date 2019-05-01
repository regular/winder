const parse = require('./parse')
const debug = require('debug')('winder')

function defineType(codec, fields) {
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

module.exports = function Winder(codec, fields) {
  const t = defineType(codec, fields)

  return function source(s) {
    const sequence = parse(s)
    let recurring = false
    let ended
    let n = 0
    return function(end, cb) {
      if (end) ended = end
      if (ended) return cb && cb(ended)
      if (n>0 && !recurring) return cb(true)

      let item = codec.decode(sequence[0])
      for(let {count, unit, conditions} of sequence.slice(1)) {
        if (count == '+n') {count = n; recurring = true}
        if (count == '-n') {count = -n; recurring = true}

        if (conditions) item = t.find(item, count, unit, conditions)
        else item = t.skip(item, count, unit)
      }
      n++
      return cb(null, codec.encode(item))
    }
  }
}

