const originalData = require('./data.json')
const fs = require('fs')

function transform() {
  const newData = {
    Gun: [],
    Bottle: [],
    Candy: [],
  }

  Object.keys(originalData).forEach(key => {
    const value = originalData[key]
    newData[key] = value.map(item => {
      return Object.values(item)[0]
    })
  })

  fs.writeFileSync('./data.json', JSON.stringify(newData, null, 2), 'utf-8')
}

// transform()
function main() {
  console.log(originalData.Candy.length)
}

main()