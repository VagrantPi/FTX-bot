const Utils = require('./lib/Utils');
const HttpAgent = require('./lib/HttpAgent');
const LoggerAdapter = require('./lib/LoggerAdapter');
const DB = require('./db/model');

const main = async () => {
  const config = await Utils.readConfig();
  const logger = new LoggerAdapter();
  const httpAgent = new HttpAgent();
  const dbInstance = new DB({ dbConfig: config.database, logger });
  const db = await dbInstance.initialORM();
  logger.log('service start!!');

  const intervalTime = 3600000;

  setInterval(async () => {
    const balancesResponse = await httpAgent.get({ path: 'wallet/balances', secret: config.ftx.apiSecret, apiKey: config.ftx.apiKey });

    const updateCoins = ['BTC', 'ETH', 'DOGE', 'ASD', 'USD', 'USDT'];

    const coinTables = {};

    if (!balancesResponse.success) {
      logger.error('get balance error');
      return;
    }
    for (let i = 0; i < balancesResponse.result.length; i += 1) {
      const coinBalance = balancesResponse.result[i];
      coinTables[coinBalance.coin] = coinBalance;
    }

    for (let i = 0; i < updateCoins.length; i += 1) {
      const updateCoin = updateCoins[i];

      const body = {
        coin: updateCoin,
        size: coinTables[updateCoin].total,
        rate: 0.0000001,
      };
      // eslint-disable-next-line no-await-in-loop
      const lendingResponse = await httpAgent.post({
        path: 'spot_margin/offers',
        secret: config.ftx.apiSecret,
        apiKey: config.ftx.apiKey,
        body,
      });
      if (!lendingResponse.success) logger.log(`update ${updateCoin} lending balance false!`);
      logger.log(lendingResponse);
    }

    logger.log('update lending balance success!!');
  }, intervalTime);
};

main();
