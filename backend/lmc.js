const axios = require('axios');
const fs = require('fs')
// 上一次更新的数据
const dataJson = require('./data.json')

const queryDetailError = []
const parseData = {
  Gun: [],
  Bottle: [],
  Candy: [],
}

async function sleep(ms) {
  await new Promise((re) => {
    setTimeout(() => {
      re()
    }, ms)
  })
}

async function getDetail(id) {
  let tokenId = ''
  let price = ''
  try {
    const result = await axios({
      method: 'get',
      url: `https://yibi.co/apis/nft/getBoxDetail/${id}`,
    })
    tokenId = result.data.data.nftWorks.tokenId
    price = result.data.data.nftWorks.auctionNowPrice
  } catch (err) {
    console.log(`获取id${id}详情数据失败`)
    queryDetailError.push(id)
  }

  return { tokenId, price }
}

async function queryList() {
  let ids = []

  try {
    const result = await axios({
      method: 'post',
      url: 'https://yibi.co/apis/nft/selectAuctionWorks',
      data: {
        coinName: '',
        endPrice: '',
        isMysteryBox: 1,
        isOpen,
        key: '',
        nftMysteryProjectId: 21,
        pageIndex,
        pageSize,
        sellType: 0,
        sort: 1,
        startPrice: '',
        type: 0,
      }
    })
    const list = result.data.data.list
    hasNext = result.data.data.hasNextPage
    // 只处理数据库未存在的id，存在的id只更新price
    list.map(item => {
      if (!item.id) return
      // 记录所有上架的id，用于清除data中下架的内容
      allOnlineIds.push(item.id)
      const index = dataIds.indexOf(item.id)
      if (index === -1) {
        // 需要鉴别品质的id
        ids.push(item.id)
      } else {
        // 更新价格
        const type = dataInfos[index].type
        const originalIndex = dataTypeIdMap[type].indexOf(item.id)
        // 修改原始数据
        dataJson[type][originalIndex].price = item.auctionNowPrice
      }
    })
    console.log(`-----获取${pageIndex}页数据成功------`)
    console.log(`共${list.length}条数据，更新价格${list.length - ids.length}条，只需处理${ids.length}条数据`)
  } catch (err) {
    hasNext = true
    console.log(`-------获取${pageIndex}页数据失败-------`)
  }
  return ids
}

async function getAttr(id) {
  let attr = ''
  try {
    const result = await axios({
      method: 'get',
      url: `https://ipfs.io/ipfs/bafybeihnmvdmhx2timjjzxfxpcnsec5gvvbymagxocf5eruksn4ufuzuga/${id}`,
    });
    attr = result.data.attributes[0].value
  } catch(err) {
    console.log(`获取tokenId${id}的属性失败`)
  }
  return attr
}

async function main() {
  console.log(`----获取${pageIndex}页数据-------`)
  try {
    const ids = await queryList()
    // console.log(ids)
    const infos = []
    console.log(`----开始获取${pageIndex}页tokenId---`)
    // 获取详情
    for(let i = 0; i < ids.length; i++) {
      const { tokenId, price } = await getDetail(ids[i])
      if (tokenId) {
        infos.push({ tokenId, detatiId: ids[i], price })
        console.log(`获取id${ids[i]}的tokenId成功！`)
      }
      await sleep(500)
    }
    console.log('-------结束轮询获取tokenId------')
    console.log(`-------共获取${infos.length}条数据---------`)
    // 查看属性
    for(let i = 0; i < infos.length; i++) {
      const type = await getAttr(infos[i].tokenId)
      const logInfo = {
        detatiId: infos[i].detatiId,
        price: infos[i].price
      }
      const writeInfo = { ...infos[i] }
      if (type == 'Gun') {
        console.log('找到枪!!!!!!!!!!!!!!!!!!!!', JSON.stringify(logInfo))
        parseData.Gun.push(writeInfo)
      } else if (type == 'Bottle') {
        console.log('奶瓶!!!!!!!!!!！', JSON.stringify(infos[i]))
        parseData.Bottle.push(writeInfo)
      } else if (type == 'Candy') {
        console.log('糖', JSON.stringify(infos[i]))
        parseData.Candy.push(writeInfo)
      }
      await sleep(500)
    }

    // 写入数据
  } catch (err) {
    console.log('!!!!!未知错误!!!!')
    console.log(err)
    hasNext = false
  }
  
  if (hasNext && pageIndex < tem) {
    pageIndex += 1
    await main()
  }
}

// dataJson初始化内容
function initDataBase() {
  Object.keys(dataJson).forEach(key => {
    const value = dataJson[key]
    const typeIds = []
    value.forEach(item => {
      dataInfos.push({ type: key, id: item.detatiId })
      dataIds.push(item.detatiId)
      typeIds.push(item.detatiId)
    })
    dataTypeIdMap[key] = typeIds
  })
}

// dataJson数据扩充 && 排序
function updateDataBase() {
  Object.keys(dataJson).forEach(key => {
    // 过滤上架的id，不存在的会被清除掉
    const oldValue = dataJson[key].filter(item => allOnlineIds.includes(item.detatiId))
    const queryValue = parseData[key]
    const newValue = [...oldValue, ...queryValue].sort((a, b) => a.price - b.price)
    dataJson[key] = newValue
  })
}

let pageIndex = 1;
let pageSize = 100;
let hasNext = false;
let isOpen = 1; // 是否打开 0 未打开
let tem = 100000;
let dataInfos = []
let dataIds = []
let dataTypeIdMap = {}
let allOnlineIds = []

console.log('`--------脚本开始-------`')
initDataBase()
main().then(() => {
  // 更新原始数据
  updateDataBase()
  fs.writeFileSync('./data.json', JSON.stringify(dataJson, null, 2), 'utf-8')
  // 本次新上的数据
  fs.writeFileSync('./newData.json', JSON.stringify(parseData, null, 2), 'utf-8')
  console.log('`--------脚本结束-------`')
})

// getAttr(8412)
