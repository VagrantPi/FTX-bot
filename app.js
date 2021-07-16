const Utils = require('./lib/Utils');
const HttpAgent = require('./lib/HttpAgent');
const LoggerAdapter = require('./lib/LoggerAdapter.js')

const main = async () => {
  const config = await Utils.readConfig()
  const httpAgent = new HttpAgent()
  const log = new LoggerAdapter()

  const intervalTime = 90000

  setInterval(async () => {
    const balancesResponse = await httpAgent.get({ path: 'wallet/balances', secret: config.ftx.apiSecret, apiKey: config.ftx.apiKey })

    const updateCoins = ['BTC', 'DOGE', 'ASD', 'USD', 'USDT']

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
        rate: 1e-6
      }
      const lendingResponse = await httpAgent.post({ path: 'spot_margin/offers', secret: config.ftx.apiSecret, apiKey: config.ftx.apiKey, body })
      if (!lendingResponse.success) log.info(`update ${updateCoin} lending balance false!`);
      log.info(lendingResponse)
    }
  }, intervalTime);
}

main()