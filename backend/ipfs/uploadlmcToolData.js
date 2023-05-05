const AWS =  require("@aws-sdk/client-s3")
const dayjs = require('dayjs')
const fs = require("fs")
const client = new AWS.S3({
  endpoint: 'https://endpoint.4everland.co',
  apiVersion: '2006-03-01',
  credentials: {
    accessKeyId: '4YOHVP0KIICUGR8R8PF0',
    secretAccessKey: '86rYF+YkdRoPjPndmDitfkXaZLkVr++MbVBEduaw',
  },
  region: "us-west-2",
});

async function main() {
  const content = fs.readFileSync('../data.json', 'utf-8')
  await client.putObject({
    Bucket: 'lmctool',
    Key: 'data.json',
    Body: content,
    ContentType: 'application/json',
  })
  const updateTime = { updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss') }
  await client.putObject({
    Bucket: 'lmctool',
    Key: 'time.json',
    Body: JSON.stringify(updateTime),
    ContentType: 'application/json',
  })
}

main().then(() => {
  console.log('上传数据成功')
})