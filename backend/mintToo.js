const axios = require('axios');
const fs = require('fs')

async function getAttr(id) {
  let attr = ''
  try {
    const result = await axios({
      method: 'get',
      url: `https://ipfs.io/ipfs/bafybeihnmvdmhx2timjjzxfxpcnsec5gvvbymagxocf5eruksn4ufuzuga/${id}`,
    });
    attr = result.data.attributes[0].value
    console.log(`获取tokenId${id}成功，属性${attr}`)
  } catch(err) {
    console.log(`获取tokenId${id}的属性失败`)
  }
  return attr
}

async function sleep(ms) {
  await new Promise((re) => {
    setTimeout(() => {
      re()
    }, ms)
  })
}

let startId = 29106
let endId = 29999
let mintList = []

async function main() {
  for(let i = startId; i <= endId; i++) {
    const type = await getAttr(i)
    mintList.push(type)
  }

  fs.writeFileSync('./mintTool.json', JSON.stringify(mintList, null, 2), 'utf-8')
}

main()
