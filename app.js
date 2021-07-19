const Utils = require('./lib/Utils');
const HttpAgent = require('./lib/HttpAgent');
const LoggerAdapter = require('./lib/LoggerAdapter.js')
const DB = require('./db/model')


const main = async () => {
  
  const config = await Utils.readConfig()
  const httpAgent = new HttpAgent()
  const log = new LoggerAdapter()
  const dbInstance = new DB({ dbConfig: config.database, logger: log })
  const db = await dbInstance.initialORM()
  log.info('service start!!')

  const intervalTime = 3600000

  setInterval(async () => {
    const balancesResponse = await httpAgent.get({ path: 'wallet/balances', secret: config.ftx.apiSecret, apiKey: config.ftx.apiKey })

    const updateCoins = ['BTC', 'ETH', 'DOGE', 'ASD', 'USD', 'USDT']

    const coinTables = {}

    if (!balancesResponse.success) {
      log.error('get balance error');
      return
    }
    for (let i = 0; i < balancesResponse.result.length; i++) {
      const coinBalance = balancesResponse.result[i];
      coinTables[coinBalance.coin] = coinBalance
    }
    
    for (let i = 0; i < updateCoins.length; i++) {
      const updateCoin = updateCoins[i];

      const body = {
        coin: updateCoin,
        size: coinTables[updateCoin].total,
        rate: 0.0000001
      }
      const lendingResponse = await httpAgent.post({ path: 'spot_margin/offers', secret: config.ftx.apiSecret, apiKey: config.ftx.apiKey, body })
      if (!lendingResponse.success) log.info(`update ${updateCoin} lending balance false!`);
      log.info(lendingResponse)
    }

    log.info('update lending balance success!!')
  }, intervalTime);
}

main()