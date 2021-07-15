const Utils = require('./lib/Utils');
const HttpAgent = require('./lib/HttpAgent');

const main = async () => {
  const config = await Utils.readConfig()
  const httpAgent = new HttpAgent()
  const timestamp = new Date().getTime().toString()

  const signature = Utils.sign({
    apiMethod: 'GET',
    apiPath: 'account', 
    timestamp,
    secret: config.ftx.apiSecret
  })
  console.log('signature', signature);

  const res = await httpAgent.get({
    'FTX-KEY': config.ftx.apiKey,
    'FTX-SIGN': signature,
    'FTX-TS': timestamp,
    'Content-Type': 'application/json; utf-8',
  })
  console.log('res', res);
}

main()