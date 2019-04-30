const parse = require('./parse')

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
        console.log(unit, 'must be', value, 'is', curVal)
        if (String(curVal) !== String(value)) return false
      }
      console.log('ok!')
      return true
    },
    skip: (item, count, unit) => {
      console.log('skip', count, unit)
      const dir = count < 0 ? -1 : 1
      const f = fields[unit]()[count < 0 ? 'dec' : 'inc']
      count = Math.floor(Math.abs(count))
      for(let i=0; i<count; ++i) {
        item = f(item)
      }
      console.log(codec.encode(item))
      return item
    }
  }
  return self
}

module.exports = function Winder(codec, fields) {
  const t = defineType(codec, fields)

  return function parseAndRun(s, n) {
    n = n == undefined ? 1 : n
    const sequence = parse(s)
    let item = codec.decode(sequence.shift())
    while(sequence.length) {
      let {count, unit, conditions} = sequence.shift()
      if (count == '+n') count = n
      if (count == '-n') count = -n

      if (conditions) item = t.find(item, count, unit, conditions)
      else item = t.skip(item, count, unit)
    }
    return codec.encode(item)
  }
}

