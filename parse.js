module.exports = function parse(s) {
  const segments = s.split('|')
  //console.log(segments)
  return segments.map( (x,i) => {
    if (i == 0) return x
    // skip n unit
    //console.log(x)
    const set = x.match(/^set\s+(\w+)\s+(.*)$/)
    if (set) {
      const [_, unit, value] = set
      return {
        unit, value
      }
    }
    const skip = x.match(/^skip\s+([+-]?)([0-9]+|n)\s+(\w+)$/)
    if (skip) {
      const [_, direction, count, unit] = skip
      return {
        count: count == 'n' ? `${direction||'+'}n` : direction == '-' ? -Number(count) : Number(count),
        unit
      }
    }
    const find = x.match(/^find\s+([+-]?)([0-9]+|n)\s+(\w+)((?:\s+\w+==[^| =]+)+)$/)
    if (find) {
      const [_, direction, count, unit, _conditions] = find
      const conditions = []
      _conditions.replace(/\s+\w+==[^| =]+/g, x=>{
        const [unit, value] = x.split('==')
        conditions.push({
          unit: unit.trim(), value
        })
      })
      return {
        count: count == 'n' ? `${direction||'+'}n` : direction == '-' ? -Number(count) : Number(count),
        unit,
        conditions
      }
    }
    throw new Error(`Syntax Error': ${x}`)
  })
}
